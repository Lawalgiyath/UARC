import { PaymentStatus, Prisma, SubmissionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { ManuscriptDto, ManuscriptWithSubmission, toManuscriptDto } from "./manuscript.dto";
import { manuscriptErrors } from "./manuscript.errors";
import { manuscriptUploadService } from "./manuscript-upload.service";
import type { ListManuscriptsInput } from "./manuscript.validation";
import { createPagination } from "@/lib/api/pagination";

type SubmissionWithRelations =
    Prisma.SubmissionGetPayload<{
        include: {
            registration: true;
            manuscript: {
                include: {
                    submission: true;
                };
            };
        };
    }>;

export class ManuscriptService {
    async uploadManuscript(
        submissionCode: string,
        email: string,
        file: File
    ): Promise<ManuscriptDto> {
        const submission =
            await this.findSubmissionOrThrow(
                submissionCode,
                email
            );

        const registration =
            this.getRegistrationOrThrow(
                submission
            );

        this.validateSubmission(
            submission,
            registration
        );

        const upload =
            await manuscriptUploadService.upload(
                file
            );

        const manuscript =
            await db.manuscript.create({
                data: {
                    submissionId:
                        submission.id,

                    originalFileName:
                        upload.originalFileName,

                    storedFileName:
                        upload.storedFileName,

                    filePath:
                        upload.filePath,

                    mimeType:
                        upload.mimeType,

                    fileExtension:
                        upload.fileExtension,

                    fileSize:
                        upload.fileSize,
                },
                include: {
                    submission: true,
                },
            });

        return toManuscriptDto(
            manuscript
        );
    }

    async getManuscript(
        submissionCode: string
    ): Promise<ManuscriptDto> {
        const manuscript =
            await this.findManuscriptOrThrow(
                submissionCode
            );

        return toManuscriptDto(
            manuscript
        );
    }

    async listManuscripts(
        query: ListManuscriptsInput
    ) {
        const {
            page,
            pageSize,
            search,
            track,
            reviewStatus,
        } = query;


        const where: Prisma.ManuscriptWhereInput =
        {
            submission: {
                ...(track && {
                    track,
                }),

                ...(reviewStatus && {
                    reviewStatus,
                }),

                ...(search && {
                    OR: [
                        {
                            submissionCode: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },

                        {
                            presentingAuthor: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },

                        {
                            email: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },

                        {
                            institution: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }),
            },
        };


        const [
            manuscripts,
            total,
        ] =
            await db.$transaction([
                db.manuscript.findMany({
                    where,

                    include: {
                        submission: true,
                    },

                    orderBy: {
                        uploadedAt: "desc",
                    },

                    skip:
                        (page - 1) *
                        pageSize,

                    take:
                        pageSize,
                }),


                db.manuscript.count({
                    where,
                }),
            ]);


        return {
            data:
                manuscripts.map(
                    toManuscriptDto
                ),

            pagination:
                createPagination(
                    page,
                    pageSize,
                    total
                ),
        };
    }

    async getManuscriptById(
        manuscriptId: string
    ): Promise<ManuscriptDto> {
        const manuscript =
            await db.manuscript.findUnique({
                where: {
                    id: manuscriptId,
                },
                include: {
                    submission: true,
                },
            });

        if (!manuscript) {
            manuscriptErrors.submissionNotFound();
        }

        return toManuscriptDto(
            manuscript!
        );
    }

    private async findSubmissionOrThrow(
        submissionCode: string,
        email: string
    ): Promise<SubmissionWithRelations> {
        const submission =
            await db.submission.findUnique({
                where: {
                    submissionCode,
                    email: email
                        .trim()
                        .toLowerCase(),
                },
                include: {
                    registration: true,
                    manuscript: {
                        include: {
                            submission: true,
                        },
                    },
                },
            });

        if (!submission) {
            throw manuscriptErrors.submissionNotFound();
        }

        return submission;
    }

    private async findManuscriptOrThrow(
        submissionCode: string
    ): Promise<ManuscriptWithSubmission> {
        const manuscript =
            await db.manuscript.findFirst({
                where: {
                    submission: {
                        submissionCode,
                    },
                },
                include: {
                    submission: true,
                },
            });

        if (!manuscript) {
            throw manuscriptErrors.submissionNotFound();
        }

        return manuscript;
    }

    private getRegistrationOrThrow(
        submission: SubmissionWithRelations
    ): NonNullable<
        SubmissionWithRelations["registration"]
    > {
        const registration =
            submission.registration;

        if (!registration) {
            throw manuscriptErrors.registrationRequired();
        }

        return registration;
    }

    private validateSubmission(
        submission: SubmissionWithRelations,
        registration: NonNullable<
            SubmissionWithRelations["registration"]
        >
    ): void {
        if (
            registration.paymentStatus !==
            PaymentStatus.SUCCESSFUL
        ) {
            manuscriptErrors.paymentRequired();
        }

        if (
            submission.reviewStatus !==
            SubmissionStatus.ACCEPTED
        ) {
            manuscriptErrors.submissionNotAccepted();
        }

        if (submission.manuscript) {
            manuscriptErrors.manuscriptAlreadyExists();
        }
    }
}

export const manuscriptService =
    new ManuscriptService();