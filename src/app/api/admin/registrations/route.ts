import { NextRequest, NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { ZodError } from "zod";
import {requireAdmin,requireAnyRole} from "@/lib/auth/rbac";
import {registrationService,RegistrationServiceError,
} from "@/lib/registration/registration.service";
import {listRegistrationsSchema} from "@/lib/registration/registration.validation";

export async function GET(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const admin = await requireAdmin();

    requireAnyRole(admin, [
      AdminRole.SUPER_ADMIN,
      AdminRole.SECRETARIAT,
    ]);

    const query =
      listRegistrationsSchema.parse({
        page: request.nextUrl.searchParams.get("page"),

        pageSize:
          request.nextUrl.searchParams.get(
            "pageSize"
          ),

        search:
          request.nextUrl.searchParams.get(
            "search"
          ) ?? undefined,

        category:
          request.nextUrl.searchParams.get(
            "category"
          ) ?? undefined,

        registrationStatus:
          request.nextUrl.searchParams.get(
            "registrationStatus"
          ) ?? undefined,

        paymentStatus:
          request.nextUrl.searchParams.get(
            "paymentStatus"
          ) ?? undefined,
      });

    const registrations =
      await registrationService.listRegistrations(
        query
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Registrations retrieved successfully.",
        data: registrations,
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
        message: "Invalid query parameters.",
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
    "[GET /api/admin/registrations]",
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