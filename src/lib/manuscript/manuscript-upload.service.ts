import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import {
  MANUSCRIPT_ALLOWED_TYPES, MANUSCRIPT_MAX_SIZE, MANUSCRIPT_MIME_EXTENSION_MAP, MANUSCRIPT_UPLOAD_DIRECTORY, type ManuscriptMimeType
} from "./manuscript.constants";
import { manuscriptErrors } from "./manuscript.errors";
import type { ManuscriptUploadResult } from "./manuscript.types";

class ManuscriptUploadService {
  private readonly uploadRoot =
    process.env.UPLOAD_DIRECTORY ??
    path.join(
      process.cwd(),
      "public",
      "uploads"
    );

  async upload(
    file: File
  ): Promise<ManuscriptUploadResult> {
    const mimeType =
      this.validateFile(file);

    const extension =
      MANUSCRIPT_MIME_EXTENSION_MAP[
      mimeType
      ];

    const storedFileName =
      `manuscript-${randomUUID()}${extension}`;

    const directory =
      await this.ensureUploadDirectory();

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const absolutePath =
      path.join(
        directory,
        storedFileName
      );

    await writeFile(
      absolutePath,
      buffer
    );

    const filePath =
      `/${MANUSCRIPT_UPLOAD_DIRECTORY}/${storedFileName}`;

    return {
      originalFileName:
        file.name,

      storedFileName,

      filePath,

      fileUrl:
        `/uploads${filePath}`,

      mimeType,

      fileExtension:
        extension,

      fileSize:
        file.size,
    };
  }

  private validateFile(
    file: File
  ): ManuscriptMimeType {
    if (!(file instanceof File)) {
      manuscriptErrors.fileRequired();
    }

    if (
      !MANUSCRIPT_ALLOWED_TYPES.includes(
        file.type as ManuscriptMimeType
      )
    ) {
      manuscriptErrors.invalidFileType(
        file.type
      );
    }

    if (
      file.size >
      MANUSCRIPT_MAX_SIZE
    ) {
      manuscriptErrors.fileTooLarge(
        MANUSCRIPT_MAX_SIZE
      );
    }

    return file.type as ManuscriptMimeType;
  }

  private async ensureUploadDirectory(): Promise<string> {
    const directory =
      path.join(
        this.uploadRoot,
        MANUSCRIPT_UPLOAD_DIRECTORY
      );

    await mkdir(directory, {
      recursive: true,
    });

    return directory;
  }
}

export const manuscriptUploadService =
  new ManuscriptUploadService();