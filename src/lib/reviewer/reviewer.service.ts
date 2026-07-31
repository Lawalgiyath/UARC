import { AdminStatus, } from "@prisma/client";
import { db } from "@/lib/db";
import { reviewerErrors } from "./reviewer.errors";
import { AssignReviewerInput, SubmitReviewInput } from "./reviewer.validation";
import { ReviewerAssignmentDto, ReviewDto, toReviewerAssignmentDto, toReviewDto, } from "./reviewer.dto";


export class ReviewerService {

    async assignReviewer(
        input: AssignReviewerInput,
        assignedById: string
    ): Promise<ReviewerAssignmentDto> {

        const submission =
            await db.submission.findUnique({
                where: {
                    id: input.submissionId,
                },
            });

        if (!submission) {
            reviewerErrors.submissionNotFound();
        }

        const reviewer =
            await db.admin.findUnique({
                where: {
                    id: input.reviewerId,
                },
            });

        if (!reviewer) {
            throw reviewerErrors.reviewerNotFound();
        }

        if (
            reviewer.active !==
            AdminStatus.ACTIVE
        ) {
            reviewerErrors.reviewerInactive();
        }

        const existing =
            await db.reviewerAssignment.findUnique({
                where: {
                    submissionId_reviewerId: {
                        submissionId:
                            input.submissionId,

                        reviewerId:
                            input.reviewerId,
                    },
                },
            });


        if (existing) {
            reviewerErrors.alreadyAssigned();
        }

        const assignment =
            await db.reviewerAssignment.create({
                data: {
                    submissionId:
                        input.submissionId,

                    reviewerId:
                        input.reviewerId,

                    assignedById,
                },

                include: {
                    submission: true,

                    reviewer: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                        },
                    },
                },
            });


        return toReviewerAssignmentDto(
            assignment
        );
    }

    async submitReview(
        input: SubmitReviewInput
    ): Promise<ReviewDto> {

        const assignment =
            await db.reviewerAssignment.findUnique({
                where: {
                    submissionId_reviewerId: {
                        submissionId:
                            input.submissionId,

                        reviewerId:
                            input.reviewerId,
                    },
                },
            });

        if (!assignment) {
            throw reviewerErrors.assignmentNotFound();
        }

        const existing =
            await db.review.findUnique({
                where: {
                    submissionId_reviewerId: {
                        submissionId:
                            input.submissionId,

                        reviewerId:
                            input.reviewerId,
                    },
                },
            });

        if (existing) {
            reviewerErrors.reviewAlreadyExists();
        }

        const overallScore =
            (
                input.originalityScore +
                input.relevanceScore +
                input.methodologyScore +
                input.presentationScore
            ) / 4;

        const review =
            await db.review.create({
                data: {

                    submissionId:
                        input.submissionId,

                    reviewerId:
                        input.reviewerId,

                    originalityScore:
                        input.originalityScore,

                    relevanceScore:
                        input.relevanceScore,

                    methodologyScore:
                        input.methodologyScore,

                    presentationScore:
                        input.presentationScore,

                    overallScore,

                    recommendation:
                        input.recommendation,

                    strengths:
                        input.strengths,

                    weaknesses:
                        input.weaknesses,

                    confidentialNote:
                        input.confidentialNote,

                    commentToAuthor:
                        input.commentToAuthor,
                },

                include: {
                    submission: true,
                },
            });

        await db.reviewerAssignment.update({
            where: {
                id: assignment.id,
            },

            data: {
                completed: true,

                completedAt:
                    new Date(),
            },
        });

        return toReviewDto(
            review
        );
    }

}
export const reviewerService =
    new ReviewerService();