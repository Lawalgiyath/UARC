export class SubmissionServiceError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: number,
        public readonly code: string
    ) {
        super(message);

        this.name = "SubmissionServiceError";

        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class SubmissionNotFoundError extends SubmissionServiceError {
    constructor() {
        super(
            "Submission not found.",
            404,
            "SUBMISSION_NOT_FOUND"
        );
    }
}

export class DuplicateSubmissionError extends SubmissionServiceError {
    constructor() {
        super(
            "An abstract with the same content has already been submitted.",
            409,
            "DUPLICATE_SUBMISSION"
        );
    }
}

export class DuplicateSubmissionCodeError extends SubmissionServiceError {
    constructor() {
        super(
            "Generated submission code already exists.",
            409,
            "DUPLICATE_SUBMISSION_CODE"
        );
    }
}

export class SubmissionWindowClosedError extends SubmissionServiceError {
    constructor() {
        super(
            "Abstract submission is currently closed.",
            403,
            "SUBMISSION_CLOSED"
        );
    }
}

export class SubmissionConfigurationError extends SubmissionServiceError {
    constructor(message: string) {
        super(
            message,
            500,
            "SUBMISSION_CONFIGURATION_ERROR"
        );
    }
}

export class InvalidSubmissionStatusError extends SubmissionServiceError {
    constructor() {
        super(
            "The submission cannot be updated in its current state.",
            409,
            "INVALID_SUBMISSION_STATUS"
        );
    }
}