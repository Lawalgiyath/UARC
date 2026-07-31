import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookSignature } from "@/lib/paystack";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { CONFERENCE, CONTACT } from "@/lib/conference";

// The authoritative record of money received.
//
// The browser redirect after checkout can be skipped, replayed or typed in by
// hand, and a delegate who closes the tab at the wrong moment never triggers
// it at all. Paystack's webhook fires regardless, and it is signed, so this is
// where a payment actually gets written down. Both paths are kept: the
// redirect gives the payer an immediate answer, the webhook makes sure the
// record is right even when nobody was watching.
//
// Point Paystack at https://<your-domain>/api/webhooks/paystack under
// Settings > API Keys & Webhooks.

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  // Must be the exact bytes received: parsing and re-serialising would change
  // the digest and every signature would fail.
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  let valid: boolean;
  try {
    valid = await verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    console.error("[webhook] signature check could not run", err);
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  if (!valid) {
    console.warn("[webhook] rejected an unsigned or badly signed payload");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string; status?: string; amount?: number } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
  }

  const reference = event.data?.reference;
  if (event.event !== "charge.success" || !reference) {
    // Anything else is acknowledged and ignored, so Paystack stops retrying.
    return NextResponse.json({ received: true });
  }

  try {
    if (reference.startsWith("UARC26-REG")) {
      await confirmRegistration(reference);
    } else if (reference.startsWith("UARC26-SPN")) {
      await confirmSponsor(reference);
    } else if (reference.startsWith("UARC26-EXH")) {
      await confirmExhibitor(reference);
    } else {
      console.warn(`[webhook] charge.success for an unrecognised reference: ${reference}`);
    }
  } catch (err) {
    // A 500 makes Paystack retry, which is what we want if our database was
    // briefly unavailable.
    console.error(`[webhook] could not record payment for ${reference}`, err);
    return NextResponse.json({ error: "Could not record payment" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function confirmRegistration(reference: string) {
  const registration = await db.registration.findUnique({ where: { reference } });
  if (!registration || registration.status === "PAID") return;

  await db.registration.update({ where: { reference }, data: { status: "PAID" } });

  await Promise.allSettled([
    sendEmail({
      to: registration.email,
      subject: `Registration confirmed, reference ${reference}`,
      text: `Dear ${registration.fullName},\n\nYour registration for the ${CONFERENCE.edition} ${CONFERENCE.name} is confirmed.\n\nReference: ${reference}\nCategory: ${registration.category}\nAmount paid: ${registration.currency} ${registration.amount.toLocaleString("en-NG")}\n\nBring this reference to the registration desk at the ${CONFERENCE.venue}, ${CONFERENCE.dates}. Your certificate is issued automatically once you are checked in, and will be available at ${process.env.NEXT_PUBLIC_SITE_URL || ""}/certificates.\n\n${CONTACT.email}\n${CONTACT.phones[0].display}`,
    }),
    sendSms({
      to: registration.phone,
      body: `UNILAG ARC: payment confirmed. Registration reference ${reference}. See you at ${CONFERENCE.venue}, ${CONFERENCE.datesShort}.`,
    }),
  ]);
}

async function confirmSponsor(reference: string) {
  const sponsor = await db.sponsor.findUnique({ where: { reference } });
  if (!sponsor || sponsor.status === "PAID" || sponsor.status === "CONFIRMED") return;

  await db.sponsor.update({ where: { reference }, data: { status: "PAID" } });
}

async function confirmExhibitor(reference: string) {
  const exhibitor = await db.exhibitor.findUnique({ where: { reference } });
  if (!exhibitor || exhibitor.status === "PAID" || exhibitor.status === "CONFIRMED") return;

  await db.exhibitor.update({ where: { reference }, data: { status: "PAID" } });
}
