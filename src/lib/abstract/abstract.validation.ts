import {ConferenceTrack,PresentationPreference,SubmissionStatus} from "@prisma/client";
import { z } from "zod";
import {ABSTRACT_MAX_WORDS,ABSTRACT_MIN_WORDS,ABSTRACT_TITLE_MAX_LENGTH} from "./abstract.constants";


const presentingAuthorField = z
    .string()
    .trim()
    .min(
        3,
        "Presenting author name must contain at least 3 characters."
    )
    .max(
        150,
        "Presenting author name cannot exceed 150 characters."
    );

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
    .min(
        2,
        "Institution is required."
    )
    .max(
        200,
        "Institution cannot exceed 200 characters."
    );

const abstractTitleField = z
    .string()
    .trim()
    .min(
        10,
        "Abstract title is required."
    )
    .max(
        ABSTRACT_TITLE_MAX_LENGTH,
        `Abstract title cannot exceed ${ABSTRACT_TITLE_MAX_LENGTH} characters.`
    );

const abstractTextField = z
    .string()
    .trim()
    .superRefine((value, ctx) => {
        const words = value
            .split(/\s+/)
            .filter(Boolean);

        if (
            words.length < ABSTRACT_MIN_WORDS
        ) {
            ctx.addIssue({
                code:
                    z.ZodIssueCode.custom,
                message: `Abstract must contain at least ${ABSTRACT_MIN_WORDS} words.`,
            });
        }

        if (
            words.length > ABSTRACT_MAX_WORDS
        ) {
            ctx.addIssue({
                code:
                    z.ZodIssueCode.custom,
                message: `Abstract cannot exceed ${ABSTRACT_MAX_WORDS} words.`,
            });
        }
    });

export const createSubmissionSchema =
    z.object({
        presentingAuthor:
            presentingAuthorField,

        email: emailField,

        phoneNumber:
            phoneNumberField,

        institution:
            institutionField,

        track:
            z.nativeEnum(
                ConferenceTrack
            ),

        presentationPreference:
            z.nativeEnum(
                PresentationPreference
            ),

        abstractTitle:
            abstractTitleField,

        abstractText:
            abstractTextField,
    });

export const verifySubmissionSchema =
    z.object({
        submissionCode: z
            .string()
            .trim()
            .min(5)
            .max(50),

        email: emailField,
    });

export const getSubmissionSchema = z.object({
    submissionCode: z
        .string()
        .trim()
        .min(5, "Submission code is required.")
        .max(50),
});

export const listSubmissionsSchema =
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
            .optional(),

        track: z
            .nativeEnum(
                ConferenceTrack
            )
            .optional(),

        reviewStatus: z
            .nativeEnum(
                SubmissionStatus
            )
            .optional(),
    });

export const acceptSubmissionSchema =
    z.object({
        submissionId: z
            .string()
            .uuid(),

        acceptedPresentation:
            z.nativeEnum(
                PresentationPreference
            ),

        reviewerComment: z
            .string()
            .trim()
            .max(2000)
            .optional(),
    });

export const rejectSubmissionSchema =
    z.object({
        submissionId: z
            .string()
            .uuid(),

        reviewerComment: z
            .string()
            .trim()
            .min(
                10,
                "Reviewer comment is required."
            )
            .max(2000),
    });

export type CreateSubmissionInput =
    z.infer<
        typeof createSubmissionSchema
    >;

export type VerifySubmissionInput =
    z.infer<
        typeof verifySubmissionSchema
    >;
export type GetSubmissionInput = z.infer<
    typeof getSubmissionSchema
>;

export type ListSubmissionsInput =
    z.infer<
        typeof listSubmissionsSchema
    >;

export type AcceptSubmissionInput =
    z.infer<
        typeof acceptSubmissionSchema
    >;

export type RejectSubmissionInput =
    z.infer<
        typeof rejectSubmissionSchema
    >;