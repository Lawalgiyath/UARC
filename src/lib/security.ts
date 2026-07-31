import { NextResponse } from "next/server";
import { consumeRateLimit, type RateLimitName } from "@/lib/rateLimit";

// Request-side security helpers shared by the API routes: who is calling,
// whether the call came from our own pages, and the standard 429 and 403
// responses.

/**
 * Best available client address.
 *
 * `x-forwarded-for` is only trustworthy because this app is expected to sit
 * behind a proxy that sets it (Vercel does). The left-most entry is the
 * original client; anything further along is proxy chain. If the app is ever
 * moved somewhere the header is not set by infrastructure, treat this as
 * spoofable and switch to a connection-level address.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Rejects cross-site form posts. Our forms are all same-origin `fetch` calls,
 * so a POST whose Origin is another site is either a mistake or a CSRF
 * attempt. Requests with no Origin header at all (server to server, curl) are
 * allowed through: they cannot be a browser riding a user's cookies, which is
 * the thing this check exists to stop.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;

  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  const allowed = new Set<string>();
  if (configured) {
    try {
      allowed.add(new URL(configured).origin);
    } catch {
      console.warn("[security] NEXT_PUBLIC_SITE_URL is not a valid URL, ignoring it");
    }
  }
  allowed.add(new URL(request.url).origin);

  return allowed.has(origin);
}

export function forbidden(message = "Request rejected.") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function tooManyRequests(retryAfter: number, message?: string) {
  return NextResponse.json(
    {
      error:
        message ||
        "Too many attempts from this connection. Please wait a few minutes and try again.",
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

/**
 * The guard every public write route starts with: same-origin, then rate
 * limited by IP. Returns a response to send back, or null to carry on.
 */
export async function guardPublicWrite(
  request: Request,
  limit: RateLimitName
): Promise<NextResponse | null> {
  if (!isSameOrigin(request)) return forbidden();

  const result = await consumeRateLimit(limit, clientIp(request));
  if (!result.ok) return tooManyRequests(result.retryAfter);

  return null;
}
