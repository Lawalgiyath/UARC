import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { sendEmail } from "@/lib/email";
import { EXHIBITION } from "@/lib/exhibition";
import { CONFERENCE, CONTACT } from "@/lib/conference";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) return NextResponse.redirect(`${origin}/exhibit/failed`);

  const exhibitor = await db.exhibitor.findUnique({ where: { reference } });
  if (!exhibitor) {
    return NextResponse.redirect(`${origin}/exhibit/failed?ref=${encodeURIComponent(reference)}`);
  }

  try {
    const result = await verifyTransaction(reference);

    if (result.paid) {
      if (exhibitor.status !== "PAID" && exhibitor.status !== "CONFIRMED") {
        await db.exhibitor.update({ where: { reference }, data: { status: "PAID" } });

        void sendEmail({
          to: exhibitor.email,
          subject: `Exhibition stand confirmed, reference ${reference}`,
          text: `Dear ${exhibitor.contactName},\n\n${exhibitor.organisation} is confirmed for a ${exhibitor.packageKey} at the research fair alongside the ${CONFERENCE.edition} ${CONFERENCE.name}.\n\nReference: ${reference}\nAmount received: ${exhibitor.currency} ${exhibitor.amount.toLocaleString("en-NG")}\n\nBuild up: ${EXHIBITION.buildUp}\nOpen: ${EXHIBITION.open}\nBreak down: ${EXHIBITION.breakDown}\nVenue: ${EXHIBITION.venue}\n\nYour stand number and exhibitor passes are issued by the Secretariat nearer the date.\n\n${CONTACT.email}\n${CONTACT.phones[0].display}`,
        }).catch((err) => console.error("[exhibitors] confirmation email failed", err));
      }

      return NextResponse.redirect(`${origin}/exhibit/success?ref=${encodeURIComponent(reference)}`);
    }

    await db.exhibitor.update({ where: { reference }, data: { status: "FAILED" } });
    return NextResponse.redirect(`${origin}/exhibit/failed?ref=${encodeURIComponent(reference)}`);
  } catch (err) {
    console.error("[exhibitors] verify failed", err);
    return NextResponse.redirect(`${origin}/exhibit/failed?ref=${encodeURIComponent(reference)}`);
  }
}
