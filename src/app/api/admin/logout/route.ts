import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import {
  getSessionCookie,
  clearSessionCookie,
} from "@/lib/auth/cookies";
import {
  getSession,
  revokeSession,
} from "@/lib/auth/session";

export async function POST() {
  try {
    const token = await getSessionCookie();

    if (!token) {
      return NextResponse.json(
        {
          success: true,
          message: "Logged out successfully.",
        },
        { status: 200 }
      );
    }

    const session = await getSession(token);

    if (session) {
      await revokeSession(token);

      await prisma.auditLog.create({
        data: {
          adminId: session.admin.id,
          action: "LOGOUT",
          entity: "Admin",
          entityId: session.admin.id,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
        },
      });
    }

    await clearSessionCookie();

    return NextResponse.json(
      {
        success: true,
        message: "Logged out successfully.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Logout error:", error);

    try {
      await clearSessionCookie();
    } catch {
    }

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred.",
      },
      {
        status: 500,
      }
    );
  }
}