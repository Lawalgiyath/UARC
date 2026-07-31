import { NextRequest } from "next/server";
import { attendanceService } from "@/lib/attendance/attendance.service";
import { checkInSchema } from "@/lib/attendance/attendance.validation";
import { ApiResponse } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/api-errors";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const input =
      checkInSchema.parse(body);

    const result =
      await attendanceService.checkIn(
        input
      );

    return ApiResponse.success(
      result,
      "Check-in successful."
    );
  } catch (error) {
    return handleApiError(error);
  }
}