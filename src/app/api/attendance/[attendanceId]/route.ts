import { NextRequest } from "next/server";
import { attendanceService } from "@/lib/attendance/attendance.service";
import { ApiResponse } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/api-errors";
import { logger } from "@/lib/api/logger";

interface RouteContext {
    params: Promise<{
        attendanceId: string;
    }>;
}


export async function GET(
    _request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { attendanceId } =
            await params;

        const attendance =
            await attendanceService.getAttendance(
                attendanceId
            );

        return ApiResponse.success(
            attendance,
            "Attendance record retrieved successfully."
        );
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    _request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { attendanceId } =
            await params;

        logger.warn(
            "Attendance deletion attempted.",
            {
                attendanceId,
            }
        );

        return ApiResponse.success(
            null,
            "Attendance deletion is not enabled."
        );
    } catch (error) {
        return handleApiError(error);
    }
}