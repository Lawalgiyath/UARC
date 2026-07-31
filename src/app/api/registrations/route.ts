import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateUniqueReference } from "@/lib/reference";
import { initializeTransaction } from "@/lib/paystack";
import { FEE_SCHEDULE, isFeeCategory, type FeeCategory } from "@/lib/pricing";
import { checkStudentClaim } from "@/lib/studentVerification";
import { guardPublicWrite } from "@/lib/security";

const registrationSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(32),
  institution: z.string().trim().min(2).max(160),
  category: z.string().refine(isFeeCategory, { message: "Unknown fee category" }),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  /** Opt in, never assumed: see the public delegate list. */
  listPublicly: z.boolean().optional(),
  /** Only meaningful for the student categories. */
  studentIdNumber: z.string().trim().max(40).optional().or(z.literal("")),
  studentInstitutionEmail: z.string().trim().max(160).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "registration");
  if (blocked) return blocked;

  const parsed = registrationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form for missing or invalid fields." }, { status: 400 });
  }
  const data = parsed.data;
  const category = data.category as FeeCategory;
  const fee = FEE_SCHEDULE[category];

  // The discount is decided on the server. A delegate who picks a student rate
  // without a usable student number and institutional address is stopped here,
  // not at the registration desk after they have already paid the lower fee.
  const claim = checkStudentClaim({
    category,
    studentIdNumber: data.studentIdNumber,
    studentInstitutionEmail: data.studentInstitutionEmail,
  });
  if (claim.status === "INVALID") {
    return NextResponse.json({ error: claim.error, field: "student" }, { status: 400 });
  }

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
      country: data.country || null,
      listPublicly: data.listPublicly ?? false,
      paystackRef: reference,
      // INVALID has already returned, so what is left maps straight onto the
      // VerificationStatus enum.
      verification: claim.status,
      verifiedAt: claim.status === "VERIFIED" ? new Date() : null,
      verificationNote: "reason" in claim ? claim.reason : null,
      studentIdNumber: data.studentIdNumber || null,
      studentInstitutionEmail: data.studentInstitutionEmail || null,
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: data.email,
      amountMajorUnits: fee.amount,
      currency: fee.currency,
      reference,
      callbackUrl: `${siteUrl}/api/registrations/verify`,
    });
    return NextResponse.json({
      authorizationUrl,
      reference,
      verification: claim.status,
      verificationNote: "reason" in claim ? claim.reason : null,
    });
  } catch (err) {
    console.error("[registrations] Paystack initialize failed", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again shortly." },
      { status: 502 }
    );
  }
}
