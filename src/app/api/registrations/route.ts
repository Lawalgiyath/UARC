import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateUniqueReference } from "@/lib/reference";
import { FEE_SCHEDULE, isFeeCategory } from "@/lib/pricing";

const registrationSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7),
  institution: z.string().trim().min(2),
  category: z.string().refine(isFeeCategory, { message: "Unknown fee category" }),
});

export async function POST(request: Request) {
  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for missing or invalid fields." }, { status: 400 });
  }
  const data = parsed.data;
  const fee = FEE_SCHEDULE[data.category as keyof typeof FEE_SCHEDULE];

  const reference = await generateUniqueReference("UARC26-REG", async (candidate) => {
    const existing = await db.registration.findUnique({ where: { reference: candidate } });
    return existing !== null;
  });

  await db.registration.create({
    data: {
      reference,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      institution: data.institution,
      category: fee.label,
      amount: fee.amount,
      currency: fee.currency,
    },
  });

  return NextResponse.json({ reference });
}
