import {
  StudentVerificationStatus,
} from "@prisma/client";
import { z } from "zod";

const verificationIdField = z
  .string()
  .uuid("Invalid verification ID.");

const rejectionReasonField = z
  .string()
  .trim()
  .min(
    10,
    "Rejection reason must contain at least 10 characters."
  )
  .max(
    500,
    "Rejection reason cannot exceed 500 characters."
  );

const institutionField = z
  .string()
  .trim()
  .min(2)
  .max(200);

export const listStudentVerificationsSchema =
  z.object({
    page: z.coerce.number().int().min(1).default(1),

    pageSize: z.coerce
      .number()
      .int()
      .min(1)
      .max(100)
      .default(20),

    search: z
      .string()
      .trim()
      .max(150)
      .optional(),

    verificationStatus: z
      .nativeEnum(StudentVerificationStatus)
      .optional(),

    institution: institutionField.optional(),
  });

export const getStudentVerificationSchema =
  z.object({
    verificationId: verificationIdField,
  });

export const approveStudentVerificationSchema =
  z.object({
    verificationId: verificationIdField,
  });

export const rejectStudentVerificationSchema =
  z.object({
    verificationId: verificationIdField,

    rejectionReason: rejectionReasonField,
  });

export type ListStudentVerificationsInput =
  z.infer<
    typeof listStudentVerificationsSchema
  >;

export type GetStudentVerificationInput =
  z.infer<
    typeof getStudentVerificationSchema
  >;

export type ApproveStudentVerificationInput =
  z.infer<
    typeof approveStudentVerificationSchema
  >;

export type RejectStudentVerificationInput =
  z.infer<
    typeof rejectStudentVerificationSchema
  >;