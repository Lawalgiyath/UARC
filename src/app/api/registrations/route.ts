import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateUniqueReference } from "@/lib/reference";
import { initializeTransaction } from "@/lib/paystack";
import { FEE_SCHEDULE, isFeeCategory, type FeeCategory } from "@/lib/pricing";
import { checkStudentClaim } from "@/lib/studentVerification";
import { guardPublicWrite } from "@/lib/security";
import { cardPaymentAvailable, REMITA } from "@/lib/remita";
import { sendEmail } from "@/lib/email";
import { CONFERENCE, CONTACT } from "@/lib/conference";
import { notificationChannels } from "@/lib/notify";

// Registering does not take any money.
//
// Payment goes through the university's Remita portal and a commercial bank,
// so this route's job is to work out what is owed, write the registration down
// as PENDING, and hand back the figures the delegate needs to carry to the
// portal. The receipt comes back later, to /api/payments/declare.
//
// The Paystack branch is kept for the day card credentials arrive: if
// PAYSTACK_SECRET_KEY is set and the delegate asked to pay by card, the old
// behaviour is still there, unchanged.

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
  paymentMethod: z.enum(["REMITA", "PAYSTACK"]).optional(),
});

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

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

  // Card is only honoured if it is actually configured, so a stale client
  // cannot put a delegate down the Paystack route into a 502.
  const wantsCard = data.paymentMethod === "PAYSTACK" && cardPaymentAvailable();
  const paymentMethod = wantsCard ? "PAYSTACK" : "REMITA";

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
      paymentMethod,
      paystackRef: wantsCard ? reference : null,
      // INVALID has already returned, so what is left maps straight onto the
      // VerificationStatus enum.
      verification: claim.status,
      verifiedAt: claim.status === "VERIFIED" ? new Date() : null,
      verificationNote: "reason" in claim ? claim.reason : null,
      studentIdNumber: data.studentIdNumber || null,
      studentInstitutionEmail: data.studentInstitutionEmail || null,
    },
  });

  const amountLabel = formatAmount(fee.amount, fee.currency);

  if (!wantsCard) {
    // Emailed immediately, because the delegate is about to walk away from
    // the screen and go to a bank. Everything they need is in this message.
    void sendEmail({
      to: data.email,
      subject: `How to pay for your registration, reference ${reference}`,
      text: `Dear ${data.fullName},\n\nYour place at the ${CONFERENCE.edition} ${CONFERENCE.name} is reserved. It is confirmed once payment is received.\n\nReference: ${reference}\nCategory: ${fee.label}\nAmount to pay: ${amountLabel}\n\nTO PAY\n1. Go to ${REMITA.siteLabel} and click "${REMITA.portalLinkText}".\n2. Choose the customer category "${REMITA.customerCategory}".\n3. Fill in the form:\n     Name of payee: ${data.fullName}\n     Mobile number: ${data.phone}\n     Email address: ${data.email}\n     Payment item: ${REMITA.paymentItem}\n     Amount: ${amountLabel}\n4. Print the slip and note the 12 digit RRR.\n5. Pay the slip at any commercial bank.\n6. Return to ${process.env.NEXT_PUBLIC_SITE_URL || ""}/register/payment and upload the receipt with your RRR.\n\nThe Secretariat checks the receipt within ${REMITA.verificationDays} working days and confirms your registration by ${notificationChannels()}.\n\nHelp with payment: WhatsApp ${REMITA.whatsApp.display} or ${CONTACT.email}`,
    }).catch((err) => console.error("[registrations] payment instructions email failed", err));

    return NextResponse.json({
      reference,
      paymentMethod: "REMITA",
      amount: fee.amount,
      currency: fee.currency,
      amountLabel,
      categoryLabel: fee.label,
      verification: claim.status,
      verificationNote: "reason" in claim ? claim.reason : null,
    });
  }

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
      paymentMethod: "PAYSTACK",
      verification: claim.status,
      verificationNote: "reason" in claim ? claim.reason : null,
    });
  } catch (err) {
    console.error("[registrations] Paystack initialize failed", err);
    // The registration is already saved, so send them down the Remita route
    // rather than losing the details they just typed in.
    return NextResponse.json(
      {
        error:
          "Card payment is unavailable at the moment. Your registration is saved, and you can pay by Remita instead.",
        reference,
        fallback: "REMITA",
        amountLabel,
      },
      { status: 502 }
    );
  }
}
