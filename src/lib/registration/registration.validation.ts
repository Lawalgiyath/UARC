import { PaymentStatus, RegistrationCategory, RegistrationStatus } from "@prisma/client";
import { z } from "zod";

const STUDENT_CATEGORIES = new Set<RegistrationCategory>([
    RegistrationCategory.STUDENT_EARLY_BIRD,
    RegistrationCategory.STUDENT_REGULAR,
]);

const fullNameField = z
    .string()
    .trim()
    .min(3, "Full name must contain at least 3 characters.")
    .max(150, "Full name cannot exceed 150 characters.");

const emailField = z
    .string()
    .trim()
    .toLowerCase()
    .email("A valid email address is required.")
    .max(255);

const phoneNumberField = z
    .string()
    .trim()
    .regex(
        /^\+?[1-9]\d{7,14}$/,
        "Enter a valid international phone number."
    );

const institutionField = z
    .string()
    .trim()
    .min(2, "Institution name is required.")
    .max(200);

const studentIdNumberField = z
    .string()
    .trim()
    .min(3, "Student ID number is required.")
    .max(100)
    .optional();

const studentInstitutionNameField = z
    .string()
    .trim()
    .min(2, "Student institution is required.")
    .max(200)
    .optional();

const uploadedStudentIdField = z
    .string()
    .trim()
    .min(1)
    .optional();

export const createRegistrationSchema = z
    .object({
        fullName: fullNameField,

        email: emailField,

        phoneNumber: phoneNumberField,

        institution: institutionField,

        category: z.nativeEnum(
            RegistrationCategory
        ),

        studentIdNumber:
            studentIdNumberField,

        studentInstitutionName:
            studentInstitutionNameField,

        studentIdFront:
            uploadedStudentIdField,

        studentIdBack:
            uploadedStudentIdField,
    })
    .superRefine((data, ctx) => {
        if (!STUDENT_CATEGORIES.has(data.category)) {
            return;
        }

        if (!data.studentIdNumber) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["studentIdNumber"],
                message:
                    "Student ID number is required.",
            });
        }

        if (!data.studentInstitutionName) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["studentInstitutionName"],
                message:
                    "Student institution is required.",
            });
        }

        if (!data.studentIdFront) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["studentIdFront"],
                message:
                    "Front of student ID is required.",
            });
        }

        if (!data.studentIdBack) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["studentIdBack"],
                message:
                    "Back of student ID is required.",
            });
        }
    });

export const getRegistrationSchema =
    z.object({
        registrationCode: z
            .string()
            .trim()
            .min(5)
            .max(50),
    });

export const verifyRegistrationSchema =
    z.object({
        registrationCode: z
            .string()
            .trim()
            .min(5)
            .max(50),

        email: emailField,
    });

export const listRegistrationsSchema =
    z.object({
        page: z.coerce
            .number()
            .int()
            .min(1)
            .default(1),

        pageSize: z.coerce
            .number()
            .int()
            .min(1)
            .max(100)
            .default(20),

        search: z
            .string()
            .trim()
            .min(1)
            .optional(),

        category: z
            .nativeEnum(
                RegistrationCategory
            )
            .optional(),

        registrationStatus: z
            .nativeEnum(
                RegistrationStatus
            )
            .optional(),

        paymentStatus: z
            .nativeEnum(PaymentStatus)
            .optional(),
    });

export type CreateRegistrationInput =
    z.infer<
        typeof createRegistrationSchema
    >;

export type GetRegistrationInput =
    z.infer<
        typeof getRegistrationSchema
    >;

export type VerifyRegistrationInput =
    z.infer<
        typeof verifyRegistrationSchema
    >;

export type ListRegistrationsInput =
    z.infer<
        typeof listRegistrationsSchema
    >;