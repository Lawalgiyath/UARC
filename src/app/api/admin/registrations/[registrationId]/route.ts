import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AdminRole } from "@prisma/client";

import {
  requireAdmin,
  requireAnyRole,
} from "@/lib/auth/rbac";

import {
  registrationService,
  RegistrationServiceError,
} from "@/lib/registration/registration.service";

const ALLOWED_ROLES = [
  AdminRole.SUPER_ADMIN,
  AdminRole.SECRETARIAT,
  AdminRole.FINANCE,
] as const;


export async function GET(
  _: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      registrationId: string;
    }>;
  }
): Promise<NextResponse> {
  try {
    const admin = await requireAdmin();

    requireAnyRole(admin, ALLOWED_ROLES);

    const { registrationId } = await params;

    const registration =
      await registrationService.getRegistrationById(
        registrationId
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration retrieved successfully.",
        data: registration,
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
        message: "Validation failed.",
        errors: error.flatten(),
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

  console.error(
    "[GET /api/admin/registrations/[registrationId]]",
    error
  );

  return NextResponse.json(
    {
      success: false,
      code: "INTERNAL_SERVER_ERROR",
      message:
        "An unexpected server error occurred.",
    },
    {
      status: 500,
    }
  );
}