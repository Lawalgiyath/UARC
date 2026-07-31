import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { sendEmail } from "@/lib/email";
import { CONFERENCE, CONTACT } from "@/lib/conference";

// Where Paystack sends the sponsor's browser after checkout. The signed
// webhook at /api/webhooks/paystack is the authority on payment; this route
// re-verifies with Paystack directly before showing anyone a success page, so
// a sponsor who navigates here by hand is not told their money arrived.

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) return NextResponse.redirect(`${origin}/sponsors/failed`);

  const sponsor = await db.sponsor.findUnique({ where: { reference } });
  if (!sponsor) {
    return NextResponse.redirect(`${origin}/sponsors/failed?ref=${encodeURIComponent(reference)}`);
  }

  try {
    const result = await verifyTransaction(reference);

    if (result.paid) {
      if (sponsor.status !== "PAID" && sponsor.status !== "CONFIRMED") {
        await db.sponsor.update({ where: { reference }, data: { status: "PAID" } });

        void sendEmail({
          to: sponsor.email,
          subject: `Sponsorship confirmed, reference ${reference}`,
          text: `Dear ${sponsor.contactName},\n\nThank you. ${sponsor.organisation} is confirmed as a ${sponsor.tier} of the ${CONFERENCE.edition} ${CONFERENCE.name}, ${CONFERENCE.dates}.\n\nReference: ${reference}\nAmount received: ${sponsor.currency} ${sponsor.amount.toLocaleString("en-NG")}\n\nThe Secretariat will be in touch about your logo, your complimentary passes and your place in the programme.\n\n${CONTACT.email}\n${CONTACT.phones[0].display}`,
        }).catch((err) => console.error("[sponsors] confirmation email failed", err));
      }

      return NextResponse.redirect(`${origin}/sponsors/success?ref=${encodeURIComponent(reference)}`);
    }

    await db.sponsor.update({ where: { reference }, data: { status: "FAILED" } });
    return NextResponse.redirect(`${origin}/sponsors/failed?ref=${encodeURIComponent(reference)}`);
  } catch (err) {
    console.error("[sponsors] verify failed", err);
    return NextResponse.redirect(`${origin}/sponsors/failed?ref=${encodeURIComponent(reference)}`);
  }
}
