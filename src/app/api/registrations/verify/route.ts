import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyTransaction } from "@/lib/paystack";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) {
    return NextResponse.redirect(`${origin}/register/failed`);
  }

  const registration = await db.registration.findUnique({ where: { reference } });
  if (!registration) {
    return NextResponse.redirect(`${origin}/register/failed?ref=${encodeURIComponent(reference)}`);
  }

  try {
    const result = await verifyTransaction(reference);

    if (result.paid) {
      await db.registration.update({ where: { reference }, data: { status: "PAID" } });

      try {
        await sendEmail({
          to: registration.email,
          subject: `Registration confirmed, reference ${reference}`,
          text: `Dear ${registration.fullName},\n\nYour registration for the 19th UNILAG Annual Research Conference is confirmed.\n\nReference: ${reference}\nCategory: ${registration.category}\nAmount paid: ${registration.currency} ${registration.amount}\n\nBring this reference or this email to the registration desk at the Jelili Adebisi Omotola Hall.\n\nUNILAG Annual Research Conference Secretariat`,
        });
        await sendSms({
          to: registration.phone,
          body: `UNILAG ARC: payment confirmed. Registration reference ${reference}. See you at Omotola Hall, 14-16 Oct 2026.`,
        });
      } catch (err) {
        console.error("[registrations] confirmation notification failed", err);
      }

      return NextResponse.redirect(`${origin}/register/success?ref=${encodeURIComponent(reference)}`);
    }

    await db.registration.update({ where: { reference }, data: { status: "FAILED" } });
    return NextResponse.redirect(`${origin}/register/failed?ref=${encodeURIComponent(reference)}`);
  } catch (err) {
    console.error("[registrations] verify failed", err);
    return NextResponse.redirect(`${origin}/register/failed?ref=${encodeURIComponent(reference)}`);
  }
}
