import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { logger } from "./logger";

import {
  QRCodeServiceError,
} from "@/lib/qrcode/qr.errors";

import {
  AttendanceServiceError,
} from "@/lib/attendance/attendance.errors";

export function handleApiError(
  error: unknown
) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Validation failed.",
        errors: error.errors,
      },
      {
        status: 400,
      }
    );
  }

  if (
    error instanceof QRCodeServiceError
  ) {
    return NextResponse.json(
      {
        success: false,
        code: error.code,
        message: error.message,
      },
      {
        status: error.statusCode,
      }
    );
  }

  if (
    error instanceof AttendanceServiceError
  ) {
    return NextResponse.json(
      {
        success: false,
        code: error.code,
        message: error.message,
      },
      {
        status: error.statusCode,
      }
    );
  }

  logger.error(
    "Unhandled API Error",
    error
  );

  return NextResponse.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected error occurred.",
    },
    {
      status: 500,
    }
  );
}