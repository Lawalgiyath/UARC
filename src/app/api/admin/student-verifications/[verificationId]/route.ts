import { NextRequest, NextResponse } from "next/server";
import { AdminRole } from "@prisma/client";
import { ZodError } from "zod";

import {
  requireAdmin,
  requireAnyRole,
} from "@/lib/auth/rbac";

import {
  approveStudentVerificationSchema,
  rejectStudentVerificationSchema,
} from "@/lib/registration/student-verification/student-verification.validation";

import { studentVerificationService, StudentVerificationServiceError, } from "@/lib/registration/student-verification/student-verification.service";


export async function GET(
  _request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      verificationId: string;
    }>;
  }
): Promise<NextResponse> {
  try {
    const admin = await requireAdmin();

    requireAnyRole(admin, [
      AdminRole.SUPER_ADMIN,
      AdminRole.SECRETARIAT,
    ]);

    const { verificationId } = await params;

    const verification =
      await studentVerificationService.getVerificationById(
        verificationId
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Student verification retrieved successfully.",
        data: verification,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{
      verificationId: string;
    }>;
  }
): Promise<NextResponse> {
  try {
    const admin = await requireAdmin();

    requireAnyRole(admin, [
      AdminRole.SUPER_ADMIN,
      AdminRole.SECRETARIAT,
    ]);

    const { verificationId } = await params;

    const body = await request.json();

    if (body.action === "approve") {
      approveStudentVerificationSchema.parse({
        verificationId,
      });

      const verification =
        await studentVerificationService.approveVerification(
          {
            verificationId,
            verifiedBy: admin.id,
          }
        );

      return NextResponse.json(
        {
          success: true,
          message:
            "Student verification approved successfully.",
          data: verification,
        },
        {
          status: 200,
        }
      );
    }

    const input =
      rejectStudentVerificationSchema.parse({
        verificationId,
        rejectionReason: body.rejectionReason,
      });

    const verification =
      await studentVerificationService.rejectVerification(
        {
          verificationId:
            input.verificationId,
          rejectedBy: admin.id,
          rejectionReason:
            input.rejectionReason,
        }
      );

    return NextResponse.json(
      {
        success: true,
        message:
          "Student verification rejected successfully.",
        data: verification,
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

  if (
    error instanceof
    StudentVerificationServiceError
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
    "[PATCH /api/admin/student-verifications/[verificationId]]",
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