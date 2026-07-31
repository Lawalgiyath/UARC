import { z } from "zod";
import { ATTENDANCE_LOCATION_MAX_LENGTH, ATTENDANCE_STAFF_NAME_MAX_LENGTH } from "./attendance.constants";

const qrTokenField = z
    .string()
    .trim()
    .min(10);

const staffField = z
    .string()
    .trim()
    .max(
        ATTENDANCE_STAFF_NAME_MAX_LENGTH
    )
    .optional();

const locationField = z
    .string()
    .trim()
    .max(
        ATTENDANCE_LOCATION_MAX_LENGTH
    )
    .optional();

export const checkInSchema =
    z.object({
        qrToken: qrTokenField,

        checkedInBy: staffField,

        location: locationField,
    });

export const checkOutSchema =
    z.object({
        qrToken: qrTokenField,

        checkedOutBy: staffField,
    });

export const attendanceQuerySchema =
    z.object({
        registrationId:
            z.string().uuid().optional(),

        registrationCode:
            z.string().trim().optional(),

        checkedIn: z.boolean().optional(),
        checkedOut: z.boolean().optional(),
    });

export type CheckInInput =
    z.infer<typeof checkInSchema>;

export type CheckOutInput =
    z.infer<typeof checkOutSchema>;

export type AttendanceQueryInput =
    z.infer<
        typeof attendanceQuerySchema
    >;