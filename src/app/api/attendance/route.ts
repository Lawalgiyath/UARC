import { NextRequest } from "next/server";
import { attendanceService } from "@/lib/attendance/attendance.service";
import { attendanceQuerySchema } from "@/lib/attendance/attendance.validation";
import { ApiResponse } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/api-errors";

function parseBoolean(
    value: string | null
): boolean | undefined {
    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return undefined;
}

function parseNumber(
    value: string | null
): number | undefined {
    if (!value) {
        return undefined;
    }

    const parsed = Number(value);

    return Number.isNaN(parsed)
        ? undefined
        : parsed;
}

export async function GET(
    request: NextRequest
) {
    try {
        const searchParams =
            request.nextUrl.searchParams;

        const input =
            attendanceQuerySchema.parse({
                registrationId:
                    searchParams.get(
                        "registrationId"
                    ) ?? undefined,

                checkedIn:
                    parseBoolean(
                        searchParams.get(
                            "checkedIn"
                        )
                    ),

                checkedOut:
                    parseBoolean(
                        searchParams.get(
                            "checkedOut"
                        )
                    ),

                page: parseNumber(
                    searchParams.get("page")
                ),

                limit: parseNumber(
                    searchParams.get("limit")
                ),
            });

        const attendances =
            await attendanceService.getAttendanceHistory(
                input
            );

        return ApiResponse.success(
            attendances,
            "Attendance records retrieved successfully."
        );
    } catch (error) {
        return handleApiError(error);
    }
}