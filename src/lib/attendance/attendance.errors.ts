import { AttendanceErrorCode } from "./attendance.constants";

export class AttendanceServiceError extends Error {
    readonly code: AttendanceErrorCode;

    readonly statusCode: number;

    override readonly cause?: unknown;

    constructor(options: {
        code: AttendanceErrorCode;
        message: string;
        statusCode: number;
        cause?: unknown;
    }) {
        super(options.message);

        this.name = "AttendanceServiceError";

        this.code = options.code;

        this.statusCode = options.statusCode;

        this.cause = options.cause;

        Object.setPrototypeOf(
            this,
            AttendanceServiceError.prototype
        );

        Error.captureStackTrace?.(
            this,
            AttendanceServiceError
        );
    }
}

function createError(options: {
    code: AttendanceErrorCode;
    message: string;
    statusCode: number;
    cause?: unknown;
}): never {
    throw new AttendanceServiceError(options);
}

export const attendanceErrors =
    Object.freeze({
        attendanceNotFound(
            registrationCode: string
        ): never {
            return createError({
                code: "ATTENDANCE_NOT_FOUND",
                message: `Attendance record for '${registrationCode}' was not found.`,
                statusCode: 404,
            });
        },

        alreadyCheckedIn(
            registrationCode: string
        ): never {
            return createError({
                code: "ALREADY_CHECKED_IN",
                message: `'${registrationCode}' has already checked in.`,
                statusCode: 409,
            });
        },

        alreadyCheckedOut(
            registrationCode: string
        ): never {
            return createError({
                code: "ALREADY_CHECKED_OUT",
                message: `'${registrationCode}' has already checked out.`,
                statusCode: 409,
            });
        },

        notCheckedIn(
            registrationCode: string
        ): never {
            return createError({
                code: "NOT_CHECKED_IN",
                message: `'${registrationCode}' has not checked in.`,
                statusCode: 400,
            });
        },

        creationFailed(
            registrationCode: string,
            cause?: unknown
        ): never {
            return createError({
                code: "ATTENDANCE_CREATION_FAILED",
                message: `Unable to create attendance for '${registrationCode}'.`,
                statusCode: 500,
                cause,
            });
        },

        updateFailed(
            registrationCode: string,
            cause?: unknown
        ): never {
            return createError({
                code: "ATTENDANCE_UPDATE_FAILED",
                message: `Unable to update attendance for '${registrationCode}'.`,
                statusCode: 500,
                cause,
            });
        },
    } as const);