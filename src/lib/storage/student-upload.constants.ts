export const STUDENT_ID_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type StudentIdMimeType =
  (typeof STUDENT_ID_ALLOWED_TYPES)[number];

export const MIME_EXTENSION_MAP: Record<
  StudentIdMimeType,
  string
> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const STUDENT_ID_MAX_SIZE =
  5 * 1024 * 1024;

export const STUDENT_ID_UPLOAD_DIRECTORY =
  "student-verification";