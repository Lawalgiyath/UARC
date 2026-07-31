import { db } from "@/lib/db";

// Fixed window rate limiting, stored in Postgres.
//
// The counters deliberately live in the database rather than in a module-level
// Map: on Vercel this app runs as several independent serverless instances, and
// an in-process counter would let an attacker get N times the allowance simply
// by being routed around. One row per bucket, upserted atomically, holds
// everywhere.

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  /** Seconds until the window resets, for the Retry-After header. */
  retryAfter: number;
}

export interface RateLimitRule {
  /** Requests permitted inside one window. */
  limit: number;
  /** Window length in seconds. */
  windowSeconds: number;
}

// Tuned so a human filling in a form never notices, and a script does.
export const RATE_LIMITS = {
  adminLogin: { limit: 5, windowSeconds: 15 * 60 },
  submission: { limit: 5, windowSeconds: 60 * 60 },
  registration: { limit: 8, windowSeconds: 60 * 60 },
  partnerApplication: { limit: 5, windowSeconds: 60 * 60 },
  lookup: { limit: 30, windowSeconds: 10 * 60 },
  upload: { limit: 20, windowSeconds: 60 * 60 },
} satisfies Record<string, RateLimitRule>;

export type RateLimitName = keyof typeof RATE_LIMITS;

/**
 * Consumes one unit from `name:identifier`. Returns `ok: false` once the
 * window's allowance is spent.
 *
 * If the database is unreachable the call fails open. A rate limiter that
 * takes the whole site down when Postgres blinks is a worse outcome than one
 * that briefly stops counting.
 */
export async function consumeRateLimit(
  name: RateLimitName,
  identifier: string
): Promise<RateLimitResult> {
  const rule = RATE_LIMITS[name];
  const key = `${name}:${identifier}`;
  const now = new Date();
  const resetAt = new Date(now.getTime() + rule.windowSeconds * 1000);

  try {
    const existing = await db.rateLimit.findUnique({ where: { key } });

    if (!existing || existing.resetAt <= now) {
      await db.rateLimit.upsert({
        where: { key },
        create: { key, count: 1, resetAt },
        update: { count: 1, resetAt },
      });
      return { ok: true, remaining: rule.limit - 1, retryAfter: rule.windowSeconds };
    }

    const retryAfter = Math.max(1, Math.ceil((existing.resetAt.getTime() - now.getTime()) / 1000));

    if (existing.count >= rule.limit) {
      return { ok: false, remaining: 0, retryAfter };
    }

    const updated = await db.rateLimit.update({
      where: { key },
      data: { count: { increment: 1 } },
    });

    return { ok: true, remaining: Math.max(0, rule.limit - updated.count), retryAfter };
  } catch (err) {
    console.error(`[rateLimit] check failed for ${key}, failing open`, err);
    return { ok: true, remaining: rule.limit, retryAfter: rule.windowSeconds };
  }
}

/** Clears a bucket, used after a successful admin sign in. */
export async function resetRateLimit(name: RateLimitName, identifier: string): Promise<void> {
  try {
    await db.rateLimit.deleteMany({ where: { key: `${name}:${identifier}` } });
  } catch (err) {
    console.error("[rateLimit] reset failed", err);
  }
}

/** Housekeeping, safe to call from a cron job. */
export async function purgeExpiredRateLimits(): Promise<number> {
  const { count } = await db.rateLimit.deleteMany({ where: { resetAt: { lte: new Date() } } });
  return count;
}
