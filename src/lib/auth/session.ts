import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const SESSION_TTL_DAYS = 7;

export type SessionUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

function getExpiryDate(): Date {
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_TTL_DAYS);
  return expires;
}

export async function createSession(
  adminId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = generateToken();

  await prisma.adminSession.create({
    data: {
      adminId,
      sessionHash: hashToken(token),
      expiresAt: getExpiryDate(),
      ipAddress,
      userAgent,
    },
  });

  return token;
}

export async function getSession(token: string) {
  const sessionHash = hashToken(token);

  const session = await prisma.adminSession.findUnique({
    where: {
      sessionHash,
    },
    include: {
      admin: true,
    },
  });

  if (!session) return null;

  if (session.revokedAt) return null;

  if (session.expiresAt < new Date()) {
    await prisma.adminSession.delete({
      where: {
        id: session.id,
      },
    });

    return null;
  }

  if (!session.admin.active) {
    return null;
  }

  await prisma.adminSession.update({
    where: {
      id: session.id,
    },
    data: {
      lastUsedAt: new Date(),
    },
  });

  return session;
}

export async function revokeSession(token: string): Promise<void> {
  const sessionHash = hashToken(token);

  await prisma.adminSession.updateMany({
    where: {
      sessionHash,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function revokeAllSessions(adminId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: {
      adminId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}

export async function requireAdmin(token: string): Promise<SessionUser> {
  const session = await getSession(token);

  if (!session) {
    throw new Error("Unauthorized");
  }

  return {
    id: session.admin.id,
    fullName: session.admin.fullName,
    email: session.admin.email,
    role: session.admin.role,
  };
}

export async function cleanupExpiredSessions(): Promise<void> {
  await prisma.adminSession.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: new Date(),
          },
        },
        {
          revokedAt: {
            not: null,
          },
        },
      ],
    },
  });
}