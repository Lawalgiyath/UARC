import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

export async function GET() {
  const exhibitors = await db.exhibitor.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ exhibitors });
}

const patchSchema = z.object({
  id: z.string().min(1),
  status: z
    .enum([
      "PENDING",
      "AWAITING_PAYMENT",
      "DECLARED",
      "PAID",
      "CONFIRMED",
      "REJECTED",
      "FAILED",
      "CANCELLED",
    ])
    .optional(),
  standNumber: z.string().trim().max(20).nullable().optional(),
  displayOnSite: z.boolean().optional(),
});

export async function PATCH(request: Request) {
  const parsed = patchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { id, ...changes } = parsed.data;

  const exhibitor = await db.exhibitor.update({ where: { id }, data: changes });
  return NextResponse.json({ exhibitor });
}
