import { z } from "zod";
import { ReviewRecommendation, } from "@prisma/client";


const uuidField =
    z
        .string()
        .uuid(
            "Invalid ID format."
        );

export const assignReviewerSchema =
    z.object({
        submissionId:
            uuidField,

        reviewerId:
            uuidField,
    });

export const submitReviewSchema =
    z.object({
        submissionId:
            uuidField,

        reviewerId:
            uuidField,

        originalityScore:
            z
                .number()
                .int()
                .min(
                    1,
                    "Score must be between 1 and 10."
                )
                .max(
                    10,
                    "Score must be between 1 and 10."
                ),

        relevanceScore:
            z
                .number()
                .int()
                .min(
                    1,
                    "Score must be between 1 and 10."
                )
                .max(
                    10,
                    "Score must be between 1 and 10."
                ),

        methodologyScore:
            z
                .number()
                .int()
                .min(
                    1,
                    "Score must be between 1 and 10."
                )
                .max(
                    10,
                    "Score must be between 1 and 10."
                ),

        presentationScore:
            z
                .number()
                .int()
                .min(
                    1,
                    "Score must be between 1 and 10."
                )
                .max(
                    10,
                    "Score must be between 1 and 10."
                ),

        recommendation:
            z.nativeEnum(
                ReviewRecommendation
            ),

        strengths:
            z
                .string()
                .trim()
                .optional(),

        weaknesses:
            z
                .string()
                .trim()
                .optional(),

        confidentialNote:
            z
                .string()
                .trim()
                .optional(),

        commentToAuthor:
            z
                .string()
                .trim()
                .optional(),
    });

export type AssignReviewerInput = z.infer<typeof assignReviewerSchema>;

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;