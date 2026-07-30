import { NextResponse } from "next/server";

import { AdminRole } from "@prisma/client";

import {
  requireAdmin,
  requireAnyRole,
} from "@/lib/auth/rbac";

import {
  settingsService,
  SettingsServiceError,
} from "@/lib/settings/settings.service";

export async function GET() {
  try {
    const admin = await requireAdmin();

    requireAnyRole(admin, [
      AdminRole.SUPER_ADMIN,
      AdminRole.SECRETARIAT,
    ]);

    const settings = await settingsService.getSettings();

    return NextResponse.json(
      {
        success: true,
        message: "Conference settings retrieved successfully.",
        data: settings,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleError(error);
  }
}

function handleError(error: unknown): NextResponse {
  if (error instanceof SettingsServiceError) {
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

  console.error("[GET /api/admin/settings]", error);

  return NextResponse.json(
    {
      success: false,
      message: "An unexpected server error occurred.",
    },
    {
      status: 500,
    }
  );
}