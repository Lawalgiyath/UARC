import { z } from "zod";
import {
  QR_MAX_REGISTRATION_CODE_LENGTH,
  QR_MAX_TOKEN_LENGTH,
  QR_MIN_REGISTRATION_CODE_LENGTH,
  QR_MIN_TOKEN_LENGTH,
} from "./qr.constants";

export const registrationIdField = z
  .string()
  .uuid("Invalid registration ID.");

export const registrationCodeField = z
  .string()
  .trim()
  .min(
    QR_MIN_REGISTRATION_CODE_LENGTH,
    `Registration code must be at least ${QR_MIN_REGISTRATION_CODE_LENGTH} characters.`
  )
  .max(
    QR_MAX_REGISTRATION_CODE_LENGTH,
    `Registration code cannot exceed ${QR_MAX_REGISTRATION_CODE_LENGTH} characters.`
  );

export const qrTokenField = z
  .string()
  .trim()
  .min(
    QR_MIN_TOKEN_LENGTH,
    `Invalid QR token.`
  )
  .max(
    QR_MAX_TOKEN_LENGTH,
    `QR token is too long.`
  );

export const regenerateField = z
  .boolean()
  .default(false);

export const scannerIdField = z
  .string()
  .trim()
  .min(1)
  .max(100)
  .optional();

export const scannerNameField = z
  .string()
  .trim()
  .min(2)
  .max(150)
  .optional();

  export const generateQrSchema =
  z.object({
    registrationId:
      registrationIdField,

    regenerate:
      regenerateField,
  });

export const regenerateQrSchema =
  z.object({
    registrationId:
      registrationIdField,
  });

export const getQrSchema = z
  .object({
    registrationId:
      registrationIdField.optional(),

    registrationCode:
      registrationCodeField.optional(),
  })
  .refine(
    ({
      registrationId,
      registrationCode,
    }) =>
      Boolean(
        registrationId ||
          registrationCode
      ),
    {
      message:
        "Either registrationId or registrationCode must be provided.",
      path: [
        "registrationId",
      ],
    }
  );

export const downloadQrSchema =
  getQrSchema;

export const scanQrSchema =
  z.object({
    qrToken:
      qrTokenField,

    scannerId:
      scannerIdField,

    scannerName:
      scannerNameField,
  });

export const qrRouteParamsSchema =
  z.object({
    registrationCode:
      registrationCodeField,
  });

export type GenerateQrInput =
  z.infer<
    typeof generateQrSchema
  >;

export type RegenerateQrInput =
  z.infer<
    typeof regenerateQrSchema
  >;

export type GetQrInput =
  z.infer<
    typeof getQrSchema
  >;

export type DownloadQrInput =
  z.infer<
    typeof downloadQrSchema
  >;

export type ScanQrInput =
  z.infer<
    typeof scanQrSchema
  >;

export type QrRouteParams =
  z.infer<
    typeof qrRouteParamsSchema
  >;