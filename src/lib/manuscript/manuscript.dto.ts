import { Prisma, ConferenceTrack, SubmissionStatus } from "@prisma/client";

export interface ManuscriptDto {
    id: string;

    submissionCode: string;

    originalFileName: string;

    filePath: string;

    mimeType: string;

    fileExtension: string;

    fileSize: number;

    version: number;

    uploadedAt: Date;

    updatedAt: Date;
}

export type ManuscriptWithSubmission =
    Prisma.ManuscriptGetPayload<{
        include: {
            submission: true;
        };
    }>;

export function toManuscriptDto(
    manuscript: ManuscriptWithSubmission
): ManuscriptDto {
    return {
        id: manuscript.id,

        submissionCode:
            manuscript.submission.submissionCode,

        originalFileName:
            manuscript.originalFileName,

        filePath:
            manuscript.filePath,

        mimeType:
            manuscript.mimeType,

        fileExtension:
            manuscript.fileExtension,

        fileSize:
            manuscript.fileSize,

        version:
            manuscript.version,

        uploadedAt:
            manuscript.uploadedAt,

        updatedAt:
            manuscript.updatedAt,
    };
}

export interface ListManuscriptsDto {
    page: number;

    limit: number;

    track?: ConferenceTrack;

    reviewStatus?: SubmissionStatus;

    search?: string;
}