import { randomBytes, createHash } from "crypto";
import { Prisma, SubmissionStatus, AuditAction, PresentationPreference } from "@prisma/client";
import { db } from "@/lib/db";
import { auditService } from "@/lib/audit/audit.service";
import { SubmissionDto, SubmissionDetailsDto, SubmissionVerificationDto, toSubmissionDto, toSubmissionDetailsDto, toSubmissionVerificationDto } from "./abstract.dto";
import { CreateSubmissionInput, VerifySubmissionInput } from "./abstract.validation";
import { SubmissionListQuery, PaginatedSubmissionDto } from "./abstract.types";
import { SUBMISSION_CODE_PREFIX } from "./abstract.constants";
import {
    SubmissionNotFoundError, DuplicateSubmissionError, SubmissionConfigurationError,
    SubmissionWindowClosedError
} from "./abstract.errors";

class SubmissionService {
    private readonly submissionInclude =
        Prisma.validator<Prisma.SubmissionInclude>()({
            manuscript: true,
        });

    private generateFingerprint(
        input: CreateSubmissionInput
    ): string {
        return createHash("sha256")
            .update(
                [
                    input.email.trim().toLowerCase(),

                    input.abstractTitle.trim(),

                    input.abstractText.trim(),
                ].join("|")
            )
            .digest("hex");
    }

    private async ensureUniqueFingerprint(
        fingerprint: string
    ): Promise<void> {
        const exists =
            await db.submission.findUnique({
                where: {
                    fingerprint,
                },
                select: {
                    id: true,
                },
            });

        if (exists) {
            throw new DuplicateSubmissionError();
        }
    }

    private async generateSubmissionCode(
        year: number
    ): Promise<string> {
        while (true) {
            const random =
                randomBytes(3)
                    .toString("hex")
                    .toUpperCase();

            const code =
                `${SUBMISSION_CODE_PREFIX}-${year}-${random}`;

            const exists =
                await db.submission.findUnique({
                    where: {
                        submissionCode: code,
                    },
                    select: {
                        id: true,
                    },
                });

            if (!exists) {
                return code;
            }
        }
    }

    private async validateSubmissionState() {
        const settings =
            await db.setting.findFirst();

        if (!settings) {
            throw new SubmissionConfigurationError(
                "Conference settings have not been configured."
            );
        }

        if (settings.maintenanceMode) {
            throw new SubmissionWindowClosedError();
        }

        if (!settings.abstractSubmissionOpen) {
            throw new SubmissionWindowClosedError();
        }

        return settings;
    }

    async createSubmission(
        input: CreateSubmissionInput
    ): Promise<SubmissionDto> {
        const settings =
            await this.validateSubmissionState();

        const fingerprint =
            this.generateFingerprint(input);

        await this.ensureUniqueFingerprint(
            fingerprint
        );

        const submissionCode =
            await this.generateSubmissionCode(
                settings.conferenceYear
            );

        const submission =
            await db.submission.create({
                data: {
                    submissionCode,

                    presentingAuthor:
                        input.presentingAuthor,

                    email:
                        input.email.toLowerCase(),

                    phoneNumber:
                        input.phoneNumber,

                    institution:
                        input.institution,

                    track:
                        input.track,

                    presentationPreference:
                        input.presentationPreference,

                    abstractTitle:
                        input.abstractTitle,

                    abstractText:
                        input.abstractText,

                    fingerprint,

                    reviewStatus:
                        SubmissionStatus.PENDING,
                },
            });

        await auditService.log({
            action: AuditAction.CREATE,

            entity: "Submission",

            entityId: submission.id,

            newValue: {
                submissionCode:
                    submission.submissionCode,

                presentingAuthor:
                    submission.presentingAuthor,

                email:
                    submission.email,

                track:
                    submission.track,

                reviewStatus:
                    submission.reviewStatus,
            },
        });

        return toSubmissionDto(
            submission
        );
    }

    async verifySubmission(
        input: VerifySubmissionInput
    ): Promise<SubmissionVerificationDto> {
        const submission =
            await db.submission.findFirst({
                where: {
                    submissionCode:
                        input.submissionCode,

                    email:
                        input.email.toLowerCase(),
                },

                include:
                    this.submissionInclude,
            });

        if (!submission) {
            throw new SubmissionNotFoundError();
        }

        return toSubmissionVerificationDto(
            submission
        );
    }

    async getSubmissionByCode(
        submissionCode: string
    ): Promise<SubmissionDetailsDto> {
        const submission =
            await db.submission.findUnique({
                where: {
                    submissionCode,
                },

                include:
                    this.submissionInclude,
            });

        if (!submission) {
            throw new SubmissionNotFoundError();
        }

        return toSubmissionDetailsDto(
            submission
        );
    }

    async getSubmissionById(
        submissionId: string
    ): Promise<SubmissionDetailsDto> {
        const submission =
            await db.submission.findUnique({
                where: {
                    id: submissionId,
                },

                include:
                    this.submissionInclude,
            });

        if (!submission) {
            throw new SubmissionNotFoundError();
        }

        return toSubmissionDetailsDto(
            submission
        );
    }

    async listSubmissions(
        query: SubmissionListQuery
    ): Promise<
        PaginatedSubmissionDto<SubmissionDto>
    > {
        const {
            page,
            pageSize,
            search,
            track,
            reviewStatus,
            presentationPreference,
        } = query;

        const where: Prisma.SubmissionWhereInput = {
            ...(track && {
                track,
            }),

            ...(reviewStatus && {
                reviewStatus,
            }),

            ...(presentationPreference && {
                presentationPreference,
            }),

            ...(search && {
                OR: [
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
                        abstractTitle: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    {
                        submissionCode: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                ],
            }),
        };

        const [submissions, totalItems] =
            await db.$transaction([
                db.submission.findMany({
                    where,

                    orderBy: {
                        submittedAt: "desc",
                    },

                    skip:
                        (page - 1) * pageSize,

                    take: pageSize,
                }),

                db.submission.count({
                    where,
                }),
            ]);

        return {
            items: submissions.map(
                toSubmissionDto
            ),

            pagination: {
                page,

                pageSize,

                totalItems,

                totalPages: Math.ceil(
                    totalItems / pageSize
                ),
            },
        };
    }

    async markSubmissionUnderReview(
        submissionId: string
    ): Promise<SubmissionDetailsDto> {
        const submission =
            await db.submission.findUnique({
                where: {
                    id: submissionId,
                },
            });

        if (!submission) {
            throw new SubmissionNotFoundError();
        }

        if (
            submission.reviewStatus ===
            SubmissionStatus.UNDER_REVIEW
        ) {
            return this.getSubmissionById(
                submissionId
            );
        }

        const updated =
            await db.submission.update({
                where: {
                    id: submissionId,
                },

                data: {
                    reviewStatus:
                        SubmissionStatus.UNDER_REVIEW,
                },

                include:
                    this.submissionInclude,
            });

        await auditService.log({
            action: AuditAction.UPDATE,

            entity: "Submission",

            entityId: updated.id,

            oldValue: {
                reviewStatus:
                    submission.reviewStatus,
            },

            newValue: {
                reviewStatus:
                    updated.reviewStatus,
            },
        });

        return toSubmissionDetailsDto(
            updated
        );
    }

    async acceptSubmission(
        submissionId: string,
        acceptedPresentation: PresentationPreference,
        reviewerComment?: string
    ): Promise<SubmissionDetailsDto> {
        const submission =
            await db.submission.findUnique({
                where: {
                    id: submissionId,
                },
            });

        if (!submission) {
            throw new SubmissionNotFoundError();
        }

        const updated =
            await db.submission.update({
                where: {
                    id: submissionId,
                },

                data: {
                    reviewStatus:
                        SubmissionStatus.ACCEPTED,

                    acceptedPresentation,

                    reviewerComment:
                        reviewerComment ?? null,

                    acceptedAt: new Date(),
                },

                include:
                    this.submissionInclude,
            });

        await auditService.log({
            action: AuditAction.UPDATE,

            entity: "Submission",

            entityId: updated.id,

            oldValue: {
                reviewStatus:
                    submission.reviewStatus,
            },

            newValue: {
                reviewStatus:
                    updated.reviewStatus,

                acceptedPresentation,

                reviewerComment: reviewerComment ?? null,
            },
        });

        return toSubmissionDetailsDto(
            updated
        );
    }

    async rejectSubmission(
        submissionId: string,
        reviewerComment: string
    ): Promise<SubmissionDetailsDto> {
        const submission =
            await db.submission.findUnique({
                where: {
                    id: submissionId,
                },
            });

        if (!submission) {
            throw new SubmissionNotFoundError();
        }

        const updated =
            await db.submission.update({
                where: {
                    id: submissionId,
                },

                data: {
                    reviewStatus:
                        SubmissionStatus.REJECTED,

                    reviewerComment,

                    rejectedAt: new Date(),
                },

                include:
                    this.submissionInclude,
            });

        await auditService.log({
            action: AuditAction.UPDATE,

            entity: "Submission",

            entityId: updated.id,

            oldValue: {
                reviewStatus:
                    submission.reviewStatus,
            },

            newValue: {
                reviewStatus:
                    updated.reviewStatus,

                reviewerComment,
            },
        });

        return toSubmissionDetailsDto(
            updated
        );
    }
}
export const submissionService =
    new SubmissionService();