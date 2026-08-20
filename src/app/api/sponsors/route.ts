import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { generateUniqueReference } from "@/lib/reference";
import { initializeTransaction } from "@/lib/paystack";
import { SPONSOR_TIERS, isSponsorTier } from "@/lib/sponsorship";
import { guardPublicWrite } from "@/lib/security";
import { cardPaymentAvailable, REMITA } from "@/lib/remita";
import { sendEmail } from "@/lib/email";
import { CONFERENCE, CONTACT } from "@/lib/conference";

const sponsorSchema = z.object({
  organisation: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(32),
  tier: z.string().refine(isSponsorTier, { message: "Unknown sponsorship tier" }),
  websiteUrl: z.string().trim().url().max(300).optional().or(z.literal("")),
  logoUrl: z.string().trim().url().max(500).optional().or(z.literal("")),
  logoPublicId: z.string().trim().max(300).optional().or(z.literal("")),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
  // Everyone goes through Remita unless card credentials are configured.
  paymentMethod: z.enum(["REMITA", "PAYSTACK"]).optional(),
});

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "partnerApplication");
  if (blocked) return blocked;

  const parsed = sponsorSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form for missing or invalid fields." },
      { status: 400 }
    );
  }
  const data = parsed.data;
  const tier = SPONSOR_TIERS[data.tier as keyof typeof SPONSOR_TIERS];

  const reference = await generateUniqueReference("UARC26-SPN", async (candidate) => {
    const existing = await db.sponsor.findUnique({ where: { reference: candidate } });
    return existing !== null;
  });

  const payingByCard = data.paymentMethod === "PAYSTACK" && cardPaymentAvailable();
  const amountLabel =
    tier.currency === "USD"
      ? `$${tier.amount.toLocaleString("en-US")}`
      : `₦${tier.amount.toLocaleString("en-NG")}`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;

  await db.sponsor.create({
    data: {
      reference,
      organisation: data.organisation,
      contactName: data.contactName,
      email: data.email,
      phone: data.phone,
      tier: tier.label,
      amount: tier.amount,
      currency: tier.currency,
      paystackRef: payingByCard ? reference : null,
      paymentMethod: payingByCard ? "PAYSTACK" : "REMITA",
      status: payingByCard ? "PENDING" : "AWAITING_PAYMENT",
      websiteUrl: data.websiteUrl || null,
      logoUrl: data.logoUrl || null,
      logoPublicId: data.logoPublicId || null,
      message: data.message || null,
    },
  });

  // The Secretariat needs to know an application landed whichever way it pays.
  void sendEmail({
    to: CONTACT.email,
    subject: `Sponsorship application: ${data.organisation} (${tier.label})`,
    text: `A sponsorship application has been received.\n\nOrganisation: ${data.organisation}\nTier: ${tier.label}\nAmount: ${tier.currency} ${tier.amount.toLocaleString("en-NG")}\nContact: ${data.contactName}\nEmail: ${data.email}\nPhone: ${data.phone}\nReference: ${reference}\nPayment: ${payingByCard ? "by card" : "through Remita, receipt to follow"}\n\n${data.message || ""}`.trim(),
  }).catch((err) => console.error("[sponsors] secretariat notification failed", err));

  if (!payingByCard) {
    void sendEmail({
      to: data.email,
      subject: `Sponsorship application received, reference ${reference}`,
      text: `Dear ${data.contactName},\n\nThank you for offering to sponsor the ${CONFERENCE.edition} ${CONFERENCE.name} at the ${tier.label} level.\n\nReference: ${reference}\nAmount to pay: ${amountLabel}\n\nTO PAY\n1. Go to ${REMITA.siteLabel} and click "${REMITA.portalLinkText}".\n2. Choose the customer category "${REMITA.customerCategory}".\n3. Fill in the form:\n     Name of payee: ${data.organisation}\n     Mobile number: ${data.phone}\n     Email address: ${data.email}\n     Payment item: ${REMITA.paymentItem}\n     Amount: ${amountLabel}\n4. Print the slip and note the 12 digit RRR.\n5. Pay the slip at any commercial bank.\n6. Send us the receipt at ${siteUrl}/register/payment, using this reference and email address.\n\nYour sponsorship is confirmed, and your logo goes up on the site, once the Secretariat has checked the receipt.\n\n${CONTACT.email}\n${CONTACT.phones[0].display}`,
    }).catch((err) => console.error("[sponsors] applicant acknowledgement failed", err));

    return NextResponse.json({
      reference,
      paymentMethod: "REMITA",
      amountLabel,
      payerName: data.organisation,
      email: data.email,
      phone: data.phone,
    });
  }

  try {
    const { authorizationUrl } = await initializeTransaction({
      email: data.email,
      amountMajorUnits: tier.amount,
      currency: tier.currency,
      reference,
      callbackUrl: `${siteUrl}/api/sponsors/verify`,
    });
    return NextResponse.json({ reference, authorizationUrl });
  } catch (err) {
    console.error("[sponsors] Paystack initialize failed", err);
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
