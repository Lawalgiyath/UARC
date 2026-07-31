export class ManuscriptServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code: string
    ) {
        super(message);

        this.name = "ManuscriptServiceError";
    }
}

export const manuscriptErrors = Object.freeze({
    fileRequired(): never {
        throw new ManuscriptServiceError(
            "Manuscript file is required.",
            400,
            "FILE_REQUIRED"
        );
    },

    invalidFileType(type: string): never {
        throw new ManuscriptServiceError(
            `Unsupported manuscript file type: ${type}.`,
            400,
            "INVALID_FILE_TYPE"
        );
    },

    fileTooLarge(maxSize: number): never {
        throw new ManuscriptServiceError(
            `Manuscript exceeds the maximum allowed size of ${maxSize} bytes.`,
            400,
            "FILE_TOO_LARGE"
        );
    },

    submissionNotFound(): never {
        throw new ManuscriptServiceError(
            "Submission not found.",
            404,
            "SUBMISSION_NOT_FOUND"
        );
    },

    registrationRequired(): never {
        throw new ManuscriptServiceError(
            "A paid conference registration is required before uploading a manuscript.",
            403,
            "REGISTRATION_REQUIRED"
        );
    },

    paymentRequired(): never {
        throw new ManuscriptServiceError(
            "Registration payment must be completed before uploading a manuscript.",
            403,
            "PAYMENT_REQUIRED"
        );
    },

    submissionNotAccepted(): never {
        throw new ManuscriptServiceError(
            "Only accepted abstracts can upload a manuscript.",
            403,
            "SUBMISSION_NOT_ACCEPTED"
        );
    },

    manuscriptAlreadyExists(): never {
        throw new ManuscriptServiceError(
            "A manuscript has already been uploaded for this submission.",
            409,
            "MANUSCRIPT_ALREADY_EXISTS"
        );
    },

    uploadFailed(reason?: unknown): never {
        throw new ManuscriptServiceError(
            "Unable to upload manuscript.",
            500,
            "UPLOAD_FAILED"
        );
    },
} as const);