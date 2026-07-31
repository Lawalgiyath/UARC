import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import {
    MIME_EXTENSION_MAP,
    STUDENT_ID_ALLOWED_TYPES,
    STUDENT_ID_MAX_SIZE,
    STUDENT_ID_UPLOAD_DIRECTORY,
    type StudentIdMimeType,
} from "./student-upload.constants";
import { uploadErrors } from "./student-upload.errors";
import type { UploadResult } from "./student-upload.types";

class StudentUploadService {
    private readonly uploadRoot =
        process.env.UPLOAD_DIRECTORY ??
        path.join(
            process.cwd(),
            "public",
            "uploads"
        );

    async uploadStudentId(
        file: File,
        side: "front" | "back"
    ): Promise<UploadResult> {
        const mimeType =
            this.validateFile(file);

        const extension =
            MIME_EXTENSION_MAP[mimeType];

        const fileName =
            `student-${side}-${randomUUID()}${extension}`;

        const directory =
            await this.ensureUploadDirectory();

        const buffer = Buffer.from(
            await file.arrayBuffer()
        );

        const absolutePath = path.join(
            directory,
            fileName
        );

        await writeFile(
            absolutePath,
            buffer
        );

        const storagePath =
            `/${STUDENT_ID_UPLOAD_DIRECTORY}/${fileName}`;

        return {
            fileName,
            storagePath,
            fileUrl: `/uploads${storagePath}`,
            size: file.size,
            mimeType,
        };
    }

    private validateFile(
        file: File
    ): StudentIdMimeType {
        if (!(file instanceof File)) {
            throw uploadErrors.fileRequired();
        }

        if (
            !STUDENT_ID_ALLOWED_TYPES.includes(
                file.type as StudentIdMimeType
            )
        ) {
            throw uploadErrors.invalidFileType(
                file.type
            );
        }

        if (file.size > STUDENT_ID_MAX_SIZE) {
            throw uploadErrors.fileTooLarge(
                STUDENT_ID_MAX_SIZE
            );
        }

        return file.type as StudentIdMimeType;
    }

    private async ensureUploadDirectory(): Promise<string> {
        const directory = path.join(
            this.uploadRoot,
            STUDENT_ID_UPLOAD_DIRECTORY
        );

        await mkdir(directory, {
            recursive: true,
        });

        return directory;
    }
}

export const studentUploadService =
    new StudentUploadService();