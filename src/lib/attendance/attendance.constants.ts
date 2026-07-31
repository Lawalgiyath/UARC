/* -------------------------------------------------------------------------- */
/*                              Error Codes                                   */
/* -------------------------------------------------------------------------- */

export type AttendanceErrorCode =
    | "ATTENDANCE_NOT_FOUND"
    | "ALREADY_CHECKED_IN"
    | "ALREADY_CHECKED_OUT"
    | "NOT_CHECKED_IN"
    | "ATTENDANCE_CREATION_FAILED"
    | "ATTENDANCE_UPDATE_FAILED"
    | "ATTENDANCE_CONFIGURATION_ERROR";

export const ATTENDANCE_LOCATION_MAX_LENGTH = 255;

export const ATTENDANCE_STAFF_NAME_MAX_LENGTH = 100;

export const ATTENDANCE_CHECK_IN_EVENT = "CHECK_IN";

export const ATTENDANCE_CHECK_OUT_EVENT = "CHECK_OUT";

export const ATTENDANCE_EXPORT_FILENAME =
    "attendance-report";

export const ATTENDANCE_TIMEZONE =
    "Africa/Lagos";

export const attendanceConstants =
    Object.freeze({
        LOCATION_MAX_LENGTH:
            ATTENDANCE_LOCATION_MAX_LENGTH,

        STAFF_NAME_MAX_LENGTH:
            ATTENDANCE_STAFF_NAME_MAX_LENGTH,

        CHECK_IN_EVENT:
            ATTENDANCE_CHECK_IN_EVENT,

        CHECK_OUT_EVENT:
            ATTENDANCE_CHECK_OUT_EVENT,

        EXPORT_FILENAME:
            ATTENDANCE_EXPORT_FILENAME,

        TIMEZONE:
            ATTENDANCE_TIMEZONE,
    } as const);