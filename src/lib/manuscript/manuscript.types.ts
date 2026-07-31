export interface ManuscriptUploadResult {
    originalFileName: string;

    storedFileName: string;

    filePath: string;

    fileUrl: string;

    mimeType: string;

    fileExtension: string;

    fileSize: number;
}

export interface ManuscriptVerificationInput {
    submissionCode: string;

    email: string;
}