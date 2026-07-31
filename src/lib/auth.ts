import bcrypt from "bcryptjs";

// bcrypt needs Node.js APIs, so this file must only be imported from
// Node.js runtime code (API routes, server components) and never from
// src/middleware.ts, which runs on the Edge runtime. Session token
// creation/verification lives in ./session, which is Edge-safe, so
// middleware imports that instead.

/**
 * A bcrypt hash is `$2<a|b|y>$<cost>$<22 char salt><31 char digest>`, always
 * exactly 60 characters. Anything else in ADMIN_PASSWORD_HASH is a
 * configuration mistake, not a wrong password.
 */
const BCRYPT_HASH = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

let warnedAboutHash = false;

function checkHashShape(hash: string): boolean {
  if (BCRYPT_HASH.test(hash)) return true;

  // Warn once per process rather than on every attempt, so a probing script
  // cannot flood the logs, but the Secretariat still sees it immediately.
  if (!warnedAboutHash) {
    warnedAboutHash = true;
    console.error(
      "[auth] ADMIN_PASSWORD_HASH is not a valid bcrypt hash, so every sign in will fail.\n" +
        `[auth] Got ${hash.length} characters, expected 60.\n` +
        "[auth] The usual cause: a bcrypt hash is full of $ characters, and .env files\n" +
        "[auth] expand $NAME as a variable reference, which eats part of the hash.\n" +
        '[auth] In .env, escape them: ADMIN_PASSWORD_HASH="\\$2a\\$12\\$..."\n' +
        "[auth] In a hosting dashboard, paste the raw hash with no escaping.\n" +
        '[auth] Regenerate with: npm run hash-password -- "your password"'
    );
  }
  return false;
}

export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminEmail || !passwordHash) {
    if (!warnedAboutHash) {
      warnedAboutHash = true;
      console.error("[auth] ADMIN_EMAIL or ADMIN_PASSWORD_HASH is not set, so sign in is disabled.");
    }
    return false;
  }

  if (!checkHashShape(passwordHash)) return false;

  if (email.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) return false;
  return bcrypt.compare(password, passwordHash);
}
