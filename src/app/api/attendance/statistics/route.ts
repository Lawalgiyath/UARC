import { NextRequest } from "next/server";
import { attendanceService } from "@/lib/attendance/attendance.service";
import { ApiResponse } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/api-errors";

export async function GET(
  _request: NextRequest
) {
  try {
    const statistics =
      await attendanceService.getAttendanceStatistics();

    return ApiResponse.success(
      statistics,
      "Attendance statistics retrieved successfully."
    );
  } catch (error) {
    return handleApiError(error);
  }
}