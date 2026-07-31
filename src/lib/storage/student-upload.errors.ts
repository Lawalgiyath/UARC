export class UploadServiceError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number,
        public readonly code: string
    ) {
        super(message);
        this.name = "UploadServiceError";
    }
}

export const uploadErrors = Object.freeze({
    fileRequired(): never {
        throw new UploadServiceError(
            "File is required.",
            400,
            "FILE_REQUIRED"
        );
    },

    invalidFileType(type: string): never {
        throw new UploadServiceError(
            `Unsupported file type: ${type}`,
            400,
            "INVALID_FILE_TYPE"
        );
    },

    fileTooLarge(max: number): never {
        throw new UploadServiceError(
            `File exceeds ${max} bytes.`,
            400,
            "FILE_TOO_LARGE"
        );
    },

    uploadFailed(reason?: unknown): never {
        throw new UploadServiceError(
            "Unable to upload file.",
            500,
            "UPLOAD_FAILED"
        );
    },
} as const);