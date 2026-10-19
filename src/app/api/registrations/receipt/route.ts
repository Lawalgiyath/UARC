import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const receiptSchema = z.object({
  reference: z.string().trim(),
  receiptUrl: z.string().url(),
  receiptPublicId: z.string(),
});

export async function POST(request: Request) {
  const parsed = receiptSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  const data = parsed.data;

  const registration = await db.registration.findUnique({
    where: { reference: data.reference },
  });

  if (!registration) {
    return NextResponse.json({ error: "Registration not found." }, { status: 404 });
  }

  await db.registration.update({
    where: { reference: data.reference },
    data: {
      receiptUrl: data.receiptUrl,
      receiptPublicId: data.receiptPublicId,
      status: "PENDING", // Admins will need to verify this
    },
  });

  return NextResponse.json({ success: true });
}
