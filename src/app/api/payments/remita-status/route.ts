import { NextResponse } from "next/server";
import { z } from "zod";
import { guardPublicWrite } from "@/lib/security";
import { findPaymentTarget, markPaidByRemita, alreadySettled } from "@/lib/paymentTargets";
import { checkRrrStatus, remitaApiConfigured } from "@/lib/remitaApi";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { CONFERENCE, CONTACT } from "@/lib/conference";

// Asks Remita whether the money arrived, and settles the payment if it did.
//
// This is the part that makes the whole thing worth doing. Until now a payment
// became PAID only when somebody in the Secretariat opened a photograph of a
// receipt and agreed with it. Here Remita is asked directly, and its answer is
// authoritative: nobody has to read anything.
//
// It is deliberately server-side. The card modal in the browser also reports
// success, but a value posted by a browser is a claim, not a fact, so that
// callback only prompts this route to go and ask Remita itself.

const schema = z.object({
  reference: z.string().trim().min(6).max(40),
  email: z.string().trim().email(),
});

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "lookup");
  if (blocked) return blocked;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Give your reference and the email you registered with." }, { status: 400 });
  }

  if (!remitaApiConfigured()) {
    return NextResponse.json({ error: "Automatic confirmation is not switched on yet." }, { status: 503 });
  }

  const target = await findPaymentTarget(parsed.data.reference, parsed.data.email);
  if (!target) {
    return NextResponse.json(
      { error: "No registration matches that reference and email address." },
      { status: 404 }
    );
  }

  if (alreadySettled(target.status)) {
    return NextResponse.json({ paid: true, status: target.status, alreadySettled: true });
  }

  if (!target.rrr) {
    return NextResponse.json(
      { error: "There is no payment reference on this registration yet.", paid: false },
      { status: 400 }
    );
  }

  let status;
  try {
    status = await checkRrrStatus(target.rrr);
  } catch (err) {
    console.error("[payments/remita-status] status check failed", err);
    return NextResponse.json(
      { error: "Remita did not answer just now. Try again in a moment.", paid: false },
      { status: 502 }
    );
  }

  if (!status.paid) {
    return NextResponse.json({
      paid: false,
      status: target.status,
      // Remita's own words, so a delegate staring at an unpaid slip is told why.
      message: status.message,
    });
  }

  // Remita says the money is in. Underpayment is worth flagging rather than
  // quietly accepting, but it is still money received, so the payment settles
  // and the note carries the discrepancy to the Secretariat.
  const short =
    status.amount !== null && status.amount !== target.amount
      ? `Remita holds ${status.amount} against an expected ${target.amount}.`
      : null;

  await markPaidByRemita(target, {
    rrr: target.rrr,
    amountPaid: status.amount,
    paidAt: status.paidAt,
    channel: status.channel,
  });

  const amount = formatAmount(target.amount, target.currency);

  void sendEmail({
    to: target.email,
    subject: `Payment confirmed, reference ${target.reference}`,
    text: `Dear ${target.payerName},\n\nYour payment of ${amount} for the ${CONFERENCE.edition} ${CONFERENCE.name} has been received and confirmed by Remita. Nothing further is needed from you: there is no receipt to send.\n\nReference: ${target.reference}\nFor: ${target.purpose}\nRRR: ${target.rrr}\n\nBring this reference to the registration desk at the ${CONFERENCE.venue}, ${CONFERENCE.dates}. Your certificate is issued automatically once you are checked in.\n\n${CONTACT.email}\n${CONTACT.phones[0].display}`,
  }).catch((err) => console.error("[payments/remita-status] confirmation email failed", err));

  void sendSms({
    to: target.phone,
    body: `UNILAG ARC: payment confirmed for ${target.reference}. See you at ${CONFERENCE.venue}, ${CONFERENCE.datesShort}.`,
  }).catch((err) => console.error("[payments/remita-status] confirmation SMS failed", err));

  if (short) {
    void sendEmail({
      to: CONTACT.email,
      subject: `Underpayment confirmed by Remita: ${target.reference}`,
      text: `${target.reference} (${target.payerName}, ${target.purpose}) was confirmed automatically by Remita, but the amount does not match.\n\n${short}\nRRR: ${target.rrr}\n\nIt is marked PAID. Decide whether to chase the difference.`,
    }).catch((err) => console.error("[payments/remita-status] underpayment notice failed", err));
  }

  return NextResponse.json({
    paid: true,
    status: "PAID",
    rrr: target.rrr,
    amountPaid: status.amount,
    paidAt: status.paidAt,
    channel: status.channel,
  });
}
