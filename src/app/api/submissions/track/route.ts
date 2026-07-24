import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  const reference = searchParams.get("reference")?.trim().toUpperCase();

  if (!email || !reference) {
    return NextResponse.json({ error: "Provide both an email and a reference code." }, { status: 400 });
  }

  const submission = await db.submission.findUnique({ where: { reference } });
  if (!submission || submission.email.toLowerCase() !== email) {
    return NextResponse.json({ error: "No submission matches that email and reference code." }, { status: 404 });
  }

  return NextResponse.json({
    title: submission.title,
    track: submission.track,
    status: submission.status,
    submittedAt: submission.createdAt,
  });
}
