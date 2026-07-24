import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const registrations = await db.registration.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ registrations });
}
