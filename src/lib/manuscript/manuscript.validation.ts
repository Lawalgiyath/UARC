import { z } from "zod";
import { ConferenceTrack, SubmissionStatus } from "@prisma/client";


const submissionCodeField =
    z
        .string()
        .trim()
        .min(
            5,
            "Submission code is required."
        )
        .max(
            50,
            "Submission code is too long."
        );


const emailField =
    z
        .string()
        .trim()
        .toLowerCase()
        .email(
            "A valid email address is required."
        )
        .max(
            255,
            "Email address is too long."
        );


export const uploadManuscriptSchema =
    z.object({
        submissionCode:
            submissionCodeField,

        email:
            emailField,
    });


export const verifyManuscriptSchema =
    z.object({
        submissionCode:
            submissionCodeField,

        email:
            emailField,
    });


export const getManuscriptSchema =
    z.object({
        submissionCode:
            submissionCodeField,
    });


export const listManuscriptsSchema =
    z.object({
        page:
            z.coerce
                .number()
                .int()
                .min(
                    1,
                    "Page must start from 1."
                )
                .default(1),

        pageSize:
            z.coerce
                .number()
                .int()
                .min(
                    1,
                    "Page size must be at least 1."
                )
                .max(
                    100,
                    "Page size cannot exceed 100."
                )
                .default(20),

        track:
            z.nativeEnum(
                ConferenceTrack
            )
                .optional(),

        reviewStatus:
            z.nativeEnum(
                SubmissionStatus
            )
                .optional(),

        search:
            z.string()
                .trim()
                .optional(),
    });


export type UploadManuscriptInput =
    z.infer<
        typeof uploadManuscriptSchema
    >;


export type VerifyManuscriptInput =
    z.infer<
        typeof verifyManuscriptSchema
    >;


export type GetManuscriptInput =
    z.infer<
        typeof getManuscriptSchema
    >;


export type ListManuscriptsInput =
    z.infer<
        typeof listManuscriptsSchema
    >;