import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { createRegistrationSchema } from "@/lib/registration/registration.validation";

import {
  registrationService,
  RegistrationServiceError,
} from "@/lib/registration/registration.service";

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

    const input = createRegistrationSchema.parse(body);

    const registration =
      await registrationService.createRegistration(input);

    return NextResponse.json(
      {
        success: true,
        message: "Registration created successfully.",
        data: registration,
      },
      {
        status: 201,
        headers: {
          Location: `/api/registrations/${registration.registrationCode}`,
        },
      }
    );
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown): NextResponse {
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

  if (error instanceof RegistrationServiceError) {
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

  console.error("[POST /api/registrations]", {
    timestamp: new Date().toISOString(),
    error,
  });

  return NextResponse.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected server error occurred.",
    },
    {
      status: 500,
    }
  );
}