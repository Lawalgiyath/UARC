import { z } from "zod";
import { ConferencePhase } from "@prisma/client";


const dateField = z.preprocess(
    (value) => {
        if (value instanceof Date) return value;
        if (typeof value === "string") return new Date(value);
        return value;
    },
    z.date({
        required_error: "Date is required.",
        invalid_type_error: "Invalid date.",
    })
);

const feeField = z
    .number({
        required_error: "Fee is required.",
        invalid_type_error: "Fee must be a number.",
    })
    .finite()
    .nonnegative("Fee cannot be negative.");

export const updateConferenceSettingsSchema = z
    .object({
        conferenceName: z
            .string()
            .trim()
            .min(5, "Conference name is too short.")
            .max(200, "Conference name is too long."),

        conferenceYear: z
            .number()
            .int()
            .min(2025, "Conference year is invalid.")
            .max(2100, "Conference year is invalid."),

        conferencePhase: z.nativeEnum(ConferencePhase),

        abstractDeadline: dateField,

        earlyBirdDeadline: dateField,

        regularDeadline: dateField,

        conferenceStartDate: dateField,

        conferenceEndDate: dateField,

        earlyBirdFee: feeField,

        regularFee: feeField,

        studentEarlyBirdFee: feeField,

        studentRegularFee: feeField,

        internationalFee: feeField,
        abstractSubmissionOpen: z.boolean(),

        registrationOpen: z.boolean(),

        internationalCurrency: z
            .string()
            .trim()
            .length(3),

        minAbstractWords: z
            .number()
            .int()
            .min(300),

        maxAbstractWords: z
            .number()
            .int()
            .max(500),

        maxUploadSizeMB: z
            .number()
            .int()
            .min(1, "Maximum upload size must be at least 1 MB.")
            .max(100, "Maximum upload size cannot exceed 100 MB."),

        maintenanceMode: z.boolean(),
    })

    .superRefine((data, ctx) => {
        if (data.abstractDeadline >= data.earlyBirdDeadline) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["abstractDeadline"],
                message:
                    "Abstract deadline must be before the early-bird deadline.",
            });
        }

        if (data.earlyBirdDeadline >= data.regularDeadline) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["earlyBirdDeadline"],
                message:
                    "Early-bird deadline must be before the regular registration deadline.",
            });
        }

        if (data.regularDeadline >= data.conferenceStartDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["regularDeadline"],
                message:
                    "Regular registration deadline must be before the conference start date.",
            });
        }

        if (data.conferenceStartDate >= data.conferenceEndDate) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["conferenceEndDate"],
                message:
                    "Conference end date must be after the conference start date.",
            });
        }

        if (data.studentEarlyBirdFee > data.earlyBirdFee) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["studentEarlyBirdFee"],
                message:
                    "Student early-bird fee cannot exceed the regular early-bird fee.",
            });
        }

        if (data.studentRegularFee > data.regularFee) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ["studentRegularFee"],
                message:
                    "Student regular fee cannot exceed the regular registration fee.",
            });
        }
    });


export const getConferenceSettingsSchema = z.object({});

export type UpdateConferenceSettingsInput = z.infer<
    typeof updateConferenceSettingsSchema
>;

export type GetConferenceSettingsInput = z.infer<
    typeof getConferenceSettingsSchema
>;