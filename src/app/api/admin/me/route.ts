import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/current-admin";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
   
    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json(
      {
        success: true,

        admin: {
          id: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          active: admin.active,
          lastLogin: admin.lastLogin,
        },
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Current admin error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}