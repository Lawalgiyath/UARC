import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminCredentials } from "@/lib/auth";
import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/session";
import { consumeRateLimit, resetRateLimit } from "@/lib/rateLimit";
import { clientIp, isSameOrigin, forbidden, tooManyRequests } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbidden();

  // Five attempts per address per fifteen minutes. bcrypt already makes each
  // guess expensive; this makes a sustained attempt against the Secretariat's
  // password pointless rather than merely slow.
  const ip = clientIp(request);
  const limit = await consumeRateLimit("adminLogin", ip);
  if (!limit.ok) {
    return tooManyRequests(
      limit.retryAfter,
      "Too many sign in attempts. Please wait fifteen minutes and try again."
    );
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter an email and password." }, { status: 400 });
  }

  const ok = await verifyAdminCredentials(parsed.data.email, parsed.data.password);
  if (!ok) {
    // Deliberately identical for a wrong email and a wrong password: telling
    // an attacker which half they got right is free help.
    return NextResponse.json({ error: "Incorrect email or password." }, { status: 401 });
  }

  await resetRateLimit("adminLogin", ip);

  const token = await createSessionToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  return res;
}
