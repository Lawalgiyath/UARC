import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clientIp, tooManyRequests } from "@/lib/security";
import { consumeRateLimit } from "@/lib/rateLimit";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  const reference = searchParams.get("reference")?.trim().toUpperCase();

  if (!email || !reference) {
    return NextResponse.json({ error: "Provide both an email and a reference code." }, { status: 400 });
  }

  // Both halves are needed to see a status, and the pair is rate limited, so
  // the tracker cannot be walked to find out who submitted what.
  const limit = await consumeRateLimit("lookup", clientIp(request));
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const submission = await db.submission.findUnique({ where: { reference } });
  if (!submission || submission.email.toLowerCase() !== email) {
    return NextResponse.json({ error: "No submission matches that email and reference code." }, { status: 404 });
  }

  return NextResponse.json({
    reference: submission.reference,
    title: submission.title,
    track: submission.track,
    format: submission.format,
    status: submission.status,
    submittedAt: submission.createdAt,
    hasManuscript: submission.manuscriptUrl !== null,
  });
}
