export const MANUSCRIPT_ALLOWED_TYPES = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export type ManuscriptMimeType =
    (typeof MANUSCRIPT_ALLOWED_TYPES)[number];

export const MANUSCRIPT_MIME_EXTENSION_MAP: Record<
    ManuscriptMimeType,
    string
> = {
    "application/pdf": ".pdf",

    "application/msword": ".doc",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        ".docx",
};

export const MANUSCRIPT_MAX_SIZE =
    10 * 1024 * 1024;

export const MANUSCRIPT_UPLOAD_DIRECTORY =
    "manuscripts";