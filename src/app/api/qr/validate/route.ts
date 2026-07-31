import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {qrService} from "@/lib/qrcode/qr.service";
import {QRCodeServiceError} from "@/lib/qrcode/qr.errors"
import {scanQrSchema} from "@/lib/qrcode/qr.validation";

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_JSON",
          message: "Invalid JSON payload.",
        },
        {
          status: 400,
        }
      );
    }

    const input =
      scanQrSchema.parse(body);

    const result =
      await qrService.validateQrToken(
        input.qrToken
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "QR code validated successfully.",
        data: {
          registration: result.registration,
          qr: result.qr,
        },
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    return handleError(error);
  }
}

function handleError(
  error: unknown
): NextResponse {

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        code: "VALIDATION_ERROR",
        message: "Validation failed.",
        errors: error.issues,
      },
      {
        status: 400,
      }
    );
  }

  if (
    error instanceof
    QRCodeServiceError
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

  console.error(
    "[POST /api/qr/validate]",
    {
      timestamp:
        new Date().toISOString(),
      error,
    }
  );

  return NextResponse.json(
    {
      success: false,
      code:
        "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected server error occurred.",
    },
    {
      status: 500,
    }
  );
}