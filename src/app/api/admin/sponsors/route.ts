import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export async function GET() {
  const sponsors = await db.sponsor.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ sponsors });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum(["PENDING", "AWAITING_TRANSFER", "PAID", "CONFIRMED", "FAILED", "CANCELLED"])
    .optional(),
  /** Nothing appears on the public sponsor wall until this is switched on. */
  displayOnSite: z.boolean().optional(),
  logoUrl: z.string().url().max(500).nullable().optional(),
  websiteUrl: z.string().url().max(300).nullable().optional(),
});

export async function PATCH(request: Request) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { id, ...changes } = parsed.data;

  const sponsor = await db.sponsor.update({ where: { id }, data: changes });
  return NextResponse.json({ sponsor });
}
