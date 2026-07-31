import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import {QRCodeServiceError} from "@/lib/qrcode/qr.errors";
import {qrService} from "@/lib/qrcode/qr.service"
import {getQrSchema} from "@/lib/qrcode/qr.validation";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);

    const input = getQrSchema.parse({
      registrationId:
        searchParams.get("registrationId") ??
        undefined,

      registrationCode:
        searchParams.get("registrationCode") ??
        undefined,
    });

    const qr =
      await qrService.getQr(input);

    return NextResponse.json(
      {
        success: true,
        message:
          "QR code retrieved successfully.",
        data: qr,
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
        message:
          "Invalid request parameters.",
        errors: error.issues,
      },
      {
        status: 400,
      }
    );
  }

  if (error instanceof QRCodeServiceError) {
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
    "[GET /api/qr/get]",
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