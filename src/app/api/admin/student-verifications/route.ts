import { NextRequest, NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { ZodError } from "zod";

import {
  requireAdmin,
  requireAnyRole,
} from "@/lib/auth/rbac";

import {
  listStudentVerificationsSchema,
} from "@/lib/registration/student-verification/student-verification.validation";

import {
  studentVerificationService,
  StudentVerificationServiceError,
} from "@/lib/registration/student-verification/student-verification.service";

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
      listStudentVerificationsSchema.parse({
        page:
          request.nextUrl.searchParams.get("page"),

        pageSize:
          request.nextUrl.searchParams.get(
            "pageSize"
          ),

        search:
          request.nextUrl.searchParams.get(
            "search"
          ) ?? undefined,

        verificationStatus:
          request.nextUrl.searchParams.get(
            "verificationStatus"
          ) ?? undefined,

        institution:
          request.nextUrl.searchParams.get(
            "institution"
          ) ?? undefined,
      });

    const verifications =
      await studentVerificationService.listVerifications(
        query
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Student verifications retrieved successfully.",
        data: verifications,
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

  if (
    error instanceof StudentVerificationServiceError
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
    "[GET /api/admin/student-verifications]",
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