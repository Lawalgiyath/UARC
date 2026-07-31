export class ReviewerServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code: string
    ) {
        super(message);

        this.name =
            "ReviewerServiceError";
    }
}

export const reviewerErrors =
    Object.freeze({
        reviewerNotFound(): never {
            throw new ReviewerServiceError(
                "Reviewer not found.",
                404,
                "REVIEWER_NOT_FOUND"
            );
        },

        submissionNotFound(): never {
            throw new ReviewerServiceError(
                "Submission not found.",
                404,
                "SUBMISSION_NOT_FOUND"
            );
        },

        reviewerInactive(): never {
            throw new ReviewerServiceError(
                "Reviewer account is inactive.",
                403,
                "REVIEWER_INACTIVE"
            );
        },

        alreadyAssigned(): never {
            throw new ReviewerServiceError(
                "Reviewer is already assigned to this submission.",
                409,
                "REVIEWER_ALREADY_ASSIGNED"
            );
        },

        assignmentNotFound(): never {
            throw new ReviewerServiceError(
                "Reviewer assignment not found.",
                404,
                "ASSIGNMENT_NOT_FOUND"
            );
        },

        reviewAlreadyExists(): never {
            throw new ReviewerServiceError(
                "A review has already been submitted for this submission.",
                409,
                "REVIEW_ALREADY_EXISTS"
            );
        },

        reviewNotFound(): never {
            throw new ReviewerServiceError(
                "Review not found.",
                404,
                "REVIEW_NOT_FOUND"
            );
        },

        unauthorizedReviewer(): never {
            throw new ReviewerServiceError(
                "You are not assigned to review this submission.",
                403,
                "UNAUTHORIZED_REVIEWER"
            );
        },

        invalidScore(): never {
            throw new ReviewerServiceError(
                "Scores must be between 1 and 10.",
                400,
                "INVALID_SCORE"
            );
        },
    } as const);