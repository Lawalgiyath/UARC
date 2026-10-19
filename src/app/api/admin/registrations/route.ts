import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const registrations = await db.registration.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ registrations });
}

const updateSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "DECLARED", "PAID", "FAILED"]),
});

export async function PATCH(request: Request) {
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response("Bad request", { status: 400 });
  await db.registration.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status },
  });
  return new Response("OK");
}
