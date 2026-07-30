import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/verify";
import { createSession } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookies";


const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(8, "Password must contain at least 8 characters"),
});

export async function POST(request: NextRequest) {

  try {

    const body = await request.json();

    const validation = loginSchema.safeParse(body);

    if (!validation.success) {

      return NextResponse.json(
        {
          success: false,
          message: "Invalid login credentials",
          errors: validation.error.flatten(),
        },
        {status: 400,}
      );
    }

    const {email,password,} = validation.data;

    const admin = await prisma.admin.findUnique({
      where: {email,},
    });

    if (!admin) {

      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {status: 401,}
      );
    }

    if (!admin.active) {

      return NextResponse.json(
        {
          success: false,
          message: "Account has been disabled",
        },
        {status: 403,}
      );

    }

    const passwordValid = await verifyPassword(
      password,
      admin.passwordHash
    );

    if (!passwordValid) {

      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "LOGIN_FAILED",
          entity: "Admin",
          entityId: admin.id,
        },
      });

      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {status: 401,}
      );

    }

    const ipAddress = request.headers.get("x-forwarded-for")
      ??
      request.headers.get("x-real-ip")
      ??
      undefined;

    const userAgent = request.headers.get("user-agent")
      ??
      undefined;

    const sessionToken = await createSession(
      admin.id,
      ipAddress,
      userAgent
    );

    await setSessionCookie(sessionToken);

    await prisma.admin.update({
      where: {
        id: admin.id,
      },

      data: {
        lastLogin: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "LOGIN",
        entity: "Admin",
        entityId: admin.id,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        admin: {
          id: admin.id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
        },
      },
      {status: 200,}
    );
  } catch (error) {

    console.error(
      "Admin login error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      {status: 500,}
    );

  }

}