import { NextRequest } from "next/server";
import { attendanceService } from "@/lib/attendance/attendance.service";
import { checkOutSchema } from "@/lib/attendance/attendance.validation";
import { ApiResponse } from "@/lib/api/api-response";
import { handleApiError } from "@/lib/api/api-errors";
import { logger } from "@/lib/api/logger";

export async function POST(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const input =
      checkOutSchema.parse(body);

    const attendance =
      await attendanceService.checkOut(
        input
      );

    logger.info(
      "Attendee checked out successfully.",
      {
        attendanceId: attendance.id,
        registrationId:
          attendance.registrationId,
      }
    );

    return ApiResponse.success(
      attendance,
      "Check-out completed successfully."
    );
  } catch (error) {
    return handleApiError(error);
  }
}