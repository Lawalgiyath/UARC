import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateUniqueReference } from "@/lib/reference";
import { initializeTransaction } from "@/lib/paystack";
import { EXHIBIT_PACKAGES, isExhibitPackage } from "@/lib/exhibition";
import { guardPublicWrite } from "@/lib/security";
import { cardPaymentAvailable, REMITA } from "@/lib/remita";
import { sendEmail } from "@/lib/email";
import { CONFERENCE, CONTACT } from "@/lib/conference";

const exhibitorSchema = z.object({
  organisation: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(32),
  packageKey: z.string().refine(isExhibitPackage, { message: "Unknown exhibition package" }),
  description: z.string().trim().max(600).optional().or(z.literal("")),
  websiteUrl: z.string().trim().url().max(300).optional().or(z.literal("")),
  logoUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  logoPublicId: z.string().trim().max(300).optional().or(z.literal("")),
  paymentMethod: z.enum(["REMITA", "PAYSTACK"]).optional(),
});

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "partnerApplication");
  if (blocked) return blocked;

  const parsed = exhibitorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for missing or invalid fields." },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const pkg = EXHIBIT_PACKAGES[data.packageKey as keyof typeof EXHIBIT_PACKAGES];

  // Stands are physical and finite, so the count is checked before taking any
  // money. Applications that are cancelled or that failed payment do not hold
  // a stand.
  const taken = await db.exhibitor.count({
    where: {
      packageKey: pkg.label,
      status: { in: ["PENDING", "AWAITING_PAYMENT", "DECLARED", "PAID", "CONFIRMED"] },
    },
  });
  if (taken >= pkg.capacity) {
    return NextResponse.json(
      {
        error: `Every ${pkg.label.toLowerCase()} has been taken. Please choose another package or contact the Secretariat about the waiting list.`,
      },
      { status: 409 }
    );
  }

  const reference = await generateUniqueReference("UARC26-EXH", async (candidate) => {
    const existing = await db.exhibitor.findUnique({ where: { reference: candidate } });
    return existing !== null;
  });

  const payingByCard = data.paymentMethod === "PAYSTACK" && cardPaymentAvailable();
  const amount = pkg.amount;
  const amountLabel =
    pkg.currency === "USD"
      ? `$${pkg.amount.toLocaleString("en-US")}`
      : `₦${pkg.amount.toLocaleString("en-NG")}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  await db.exhibitor.create({
    data: {
      reference,
      organisation: data.organisation,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      packageKey: pkg.label,
      amount: pkg.amount,
      currency: pkg.currency,
      paystackRef: payingByCard ? reference : null,
      paymentMethod: payingByCard ? "PAYSTACK" : "REMITA",
      status: payingByCard ? "PENDING" : "AWAITING_PAYMENT",
      description: data.description || null,
      websiteUrl: data.websiteUrl || null,
      logoUrl: data.logoUrl || null,
      logoPublicId: data.logoPublicId || null,
    },
  });

  void sendEmail({
    to: CONTACT.email,
    subject: `Exhibition application: ${data.organisation} (${pkg.label})`,
    text: `An exhibition application has been received.\n\nOrganisation: ${data.organisation}\nPackage: ${pkg.label} (${pkg.size})\nAmount: ${pkg.currency} ${pkg.amount.toLocaleString("en-NG")}\nContact: ${data.contactName}\nEmail: ${data.email}\nPhone: ${data.phone}\nReference: ${reference}\nPayment: ${payingByCard ? "by card" : "through Remita, receipt to follow"}\nStands of this type now taken: ${taken + 1} of ${pkg.capacity}\n\n${data.description || ""}`.trim(),
  }).catch((err) => console.error("[exhibitors] secretariat notification failed", err));

  if (!payingByCard) {
    void sendEmail({
      to: data.email,
      subject: `Exhibition application received, reference ${reference}`,
      text: `Dear ${data.contactName},\n\nThank you for applying for a ${pkg.label} at the research fair alongside the ${CONFERENCE.edition} ${CONFERENCE.name}.\n\nReference: ${reference}\nStand: ${pkg.label}, ${pkg.size}\nAmount to pay: ${amountLabel}\n\nTO PAY\n1. Go to ${REMITA.siteLabel} and click "${REMITA.portalLinkText}".\n2. Choose the customer category "${REMITA.customerCategory}".\n3. Fill in the form, using ${REMITA.paymentItem} as the payment item and ${amountLabel} as the amount.\n4. Print the slip, note the 12 digit RRR, and pay it at any commercial bank.\n5. Send us the receipt at ${siteUrl}/register/payment, using this reference and email address.\n\nYour stand is held for fourteen days pending payment. The stand number is issued once the Secretariat has checked the receipt.\n\n${CONTACT.email}\n${CONTACT.phones[0].display}`,
    }).catch((err) => console.error("[exhibitors] applicant acknowledgement failed", err));

    return NextResponse.json({
      reference,
      paymentMethod: "REMITA",
      amountLabel,
      amount,
      payerName: data.organisation,
      email: data.email,
      phone: data.phone,
    });
  }

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: data.email,
      amountMajorUnits: pkg.amount,
      currency: pkg.currency,
      reference,
      callbackUrl: `${siteUrl}/api/exhibitors/verify`,
    });
    return NextResponse.json({ reference, authorizationUrl });
  } catch (err) {
    console.error("[exhibitors] Paystack initialize failed", err);
    return NextResponse.json(
      {
        error:
          "Your application was saved, but we could not open the payment page. The Secretariat will send an invoice instead.",
        reference,
      },
      { status: 502 }
    );
  }
}
