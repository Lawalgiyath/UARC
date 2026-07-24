import bcrypt from "bcryptjs";

// bcrypt needs Node.js APIs, so this file must only be imported from
// Node.js runtime code (API routes, server components) and never from
// src/middleware.ts, which runs on the Edge runtime. Session token
// creation/verification lives in ./session, which is Edge-safe, so
// middleware imports that instead.

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !passwordHash) return false;
  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;
  return bcrypt.compare(password, passwordHash);
}
