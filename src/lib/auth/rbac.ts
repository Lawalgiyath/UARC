import { AdminRole } from "@prisma/client";

import { getCurrentAdmin } from "@/lib/auth/current-admin";

type AuthenticatedAdmin = Awaited<ReturnType<typeof getCurrentAdmin>>;

export class AuthenticationError extends Error {
  constructor(message = "Authentication required.") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  constructor(message = "You do not have permission to perform this action.") {
    super(message);
    this.name = "AuthorizationError";
  }
}

export async function requireAdmin(): Promise<NonNullable<AuthenticatedAdmin>> {
  const admin = await getCurrentAdmin();

  if (!admin) {
    throw new AuthenticationError();
  }

  return admin;
}

export function requireRole(
  admin: NonNullable<AuthenticatedAdmin>,
  role: AdminRole
): void {
  if (admin.role !== role) {
    throw new AuthorizationError();
  }
}

export function requireAnyRole(
  admin: NonNullable<AuthenticatedAdmin>,
  roles: readonly AdminRole[]
): void {
  if (!roles.includes(admin.role)) {
    throw new AuthorizationError();
  }
}

export function hasRole(
  admin: NonNullable<AuthenticatedAdmin>,
  role: AdminRole
): boolean {
  return admin.role === role;
}

export function hasAnyRole(
  admin: NonNullable<AuthenticatedAdmin>,
  roles: readonly AdminRole[]
): boolean {
  return roles.includes(admin.role);
}

export function isSuperAdmin(
  admin: NonNullable<AuthenticatedAdmin>
): boolean {
  return admin.role === AdminRole.SUPER_ADMIN;
}