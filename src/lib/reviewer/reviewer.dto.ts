import type { Review, ReviewerAssignment, Submission } from "@prisma/client";


export interface ReviewerAssignmentDto {
    id: string;

    submissionId: string;

    submissionCode: string;

    reviewerId: string;

    reviewerName: string;

    assignedAt: Date;

    completed: boolean;

    completedAt: Date | null;
}

export interface ReviewDto {
    id: string;

    submissionId: string;

    submissionCode: string;

    reviewerId: string;

    originalityScore: number;

    relevanceScore: number;

    methodologyScore: number;

    presentationScore: number;

    overallScore: number;

    recommendation: string;

    strengths: string | null;

    weaknesses: string | null;

    confidentialNote: string | null;

    commentToAuthor: string | null;

    reviewedAt: Date;

    updatedAt: Date;
}

export type ReviewerAssignmentWithRelations =
    ReviewerAssignment & {
        submission: Submission;
        reviewer: {
            id: string;
            fullName: string;
            email: string;
        };
    };

export type ReviewWithSubmission =
    Review & {
        submission: Submission;
    };

export function toReviewerAssignmentDto(
    assignment: ReviewerAssignmentWithRelations
): ReviewerAssignmentDto {
    return {
        id: assignment.id,

        submissionId:
            assignment.submissionId,

        submissionCode:
            assignment.submission.submissionCode,

        reviewerId:
            assignment.reviewerId,

        reviewerName:
            assignment.reviewer.fullName,

        assignedAt:
            assignment.assignedAt,

        completed:
            assignment.completed,

        completedAt:
            assignment.completedAt,
    };
}

export function toReviewDto(
    review: ReviewWithSubmission
): ReviewDto {
    return {
        id: review.id,

        submissionId:
            review.submissionId,

        submissionCode:
            review.submission.submissionCode,

        reviewerId:
            review.reviewerId,

        originalityScore:
            review.originalityScore,

        relevanceScore:
            review.relevanceScore,

        methodologyScore:
            review.methodologyScore,

        presentationScore:
            review.presentationScore,

        overallScore:
            review.overallScore,

        recommendation:
            review.recommendation,

        strengths:
            review.strengths,

        weaknesses:
            review.weaknesses,

        confidentialNote:
            review.confidentialNote,

        commentToAuthor:
            review.commentToAuthor,

        reviewedAt:
            review.reviewedAt,

        updatedAt:
            review.updatedAt,
    };
}