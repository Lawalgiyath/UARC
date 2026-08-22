import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { CONFERENCE, CONTACT } from "@/lib/conference";
import { kindFromReference } from "@/lib/paymentTargets";

// Where a human decides whether money actually arrived.
//
// Nothing else in the system marks a payment as received: the declaration
// route only records what the payer says. A receipt is a photograph of a piece
// of paper, so somebody has to look at it against the conference account, and
// this is the endpoint that records what they decided.

/** Everything declared and not yet decided, oldest first: a work queue. */
export async function GET() {
  const [registrations, sponsors, exhibitors] = await Promise.all([
    db.registration.findMany({
      where: { rrr: { not: null } },
      orderBy: { declaredAt: "asc" },
      select: {
        id: true,
        reference: true,
        fullName: true,
        email: true,
        institution: true,
        category: true,
        amount: true,
        currency: true,
        status: true,
        rrr: true,
        receiptUrl: true,
        declaredAt: true,
        paymentNote: true,
        declaredAmount: true,
        paidOn: true,
        paidVia: true,
        checkFlags: true,
        checkVerdict: true,
      },
    }),
    db.sponsor.findMany({
      where: { rrr: { not: null } },
      orderBy: { declaredAt: "asc" },
      select: {
        id: true,
        reference: true,
        organisation: true,
        contactName: true,
        email: true,
        tier: true,
        amount: true,
        currency: true,
        status: true,
        rrr: true,
        receiptUrl: true,
        declaredAt: true,
        paymentNote: true,
        declaredAmount: true,
        paidOn: true,
        paidVia: true,
        checkFlags: true,
        checkVerdict: true,
      },
    }),
    db.exhibitor.findMany({
      where: { rrr: { not: null } },
      orderBy: { declaredAt: "asc" },
      select: {
        id: true,
        reference: true,
        organisation: true,
        contactName: true,
        email: true,
        packageKey: true,
        amount: true,
        currency: true,
        status: true,
        rrr: true,
        receiptUrl: true,
        declaredAt: true,
        paymentNote: true,
        declaredAmount: true,
        paidOn: true,
        paidVia: true,
        checkFlags: true,
        checkVerdict: true,
      },
    }),
  ]);

  return NextResponse.json({ registrations, sponsors, exhibitors });
}

const decisionSchema = z.object({
  reference: z.string().trim().min(6).max(40),
  decision: z.enum(["ACCEPT", "REJECT"]),
  /** Required on a rejection: the payer is told this verbatim. */
  note: z.string().trim().max(400).optional(),
});

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

export async function PATCH(request: Request) {
  const parsed = decisionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { reference, decision, note } = parsed.data;

  if (decision === "REJECT" && !note) {
    return NextResponse.json(
      { error: "Give a reason when refusing a receipt. The payer is shown it word for word." },
      { status: 400 }
    );
  }

  const ref = reference.trim().toUpperCase();
  const kind = kindFromReference(ref);
  if (!kind) return NextResponse.json({ error: "Unrecognised reference." }, { status: 400 });

  const accepted = decision === "ACCEPT";
  const now = new Date();

  let payer: { name: string; email: string; phone: string; amount: number; currency: string };

  if (kind === "registration") {
    const row = await db.registration.update({
      where: { reference: ref },
      data: {
        // PAID is the only status that counts as registered, and only a
        // person can set it.
        status: accepted ? "PAID" : "REJECTED",
        paymentCheckedAt: now,
        paymentNote: note ?? null,
      },
    });
    payer = {
      name: row.fullName,
      email: row.email,
      phone: row.phone,
      amount: row.amount,
      currency: row.currency,
    };
  } else if (kind === "sponsor") {
    const row = await db.sponsor.update({
      where: { reference: ref },
      data: { status: accepted ? "PAID" : "REJECTED", paymentCheckedAt: now, paymentNote: note ?? null },
    });
    payer = {
      name: row.contactName,
      email: row.email,
      phone: row.phone,
      amount: row.amount,
      currency: row.currency,
    };
  } else {
    const row = await db.exhibitor.update({
      where: { reference: ref },
      data: { status: accepted ? "PAID" : "REJECTED", paymentCheckedAt: now, paymentNote: note ?? null },
    });
    payer = {
      name: row.contactName,
      email: row.email,
      phone: row.phone,
      amount: row.amount,
      currency: row.currency,
    };
  }

  const amount = formatAmount(payer.amount, payer.currency);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

  if (accepted) {
    void sendEmail({
      to: payer.email,
      subject: `Payment confirmed, reference ${ref}`,
      text: `Dear ${payer.name},\n\nYour payment of ${amount} for the ${CONFERENCE.edition} ${CONFERENCE.name} has been received and confirmed.\n\nReference: ${ref}\n\nBring this reference to the registration desk at the ${CONFERENCE.venue}, ${CONFERENCE.dates}. Your certificate is issued automatically once you are checked in.\n\n${CONTACT.email}\n${CONTACT.phones[0].display}`,
    }).catch((err) => console.error("[admin/payments] confirmation email failed", err));

    void sendSms({
      to: payer.phone,
      body: `UNILAG ARC: payment confirmed for ${ref}. See you at ${CONFERENCE.venue}, ${CONFERENCE.datesShort}.`,
    }).catch((err) => console.error("[admin/payments] confirmation SMS failed", err));
  } else {
    void sendEmail({
      to: payer.email,
      subject: `We could not accept your receipt, reference ${ref}`,
      text: `Dear ${payer.name},\n\nWe were unable to confirm the payment for ${ref}.\n\nReason: ${note}\n\nYour place is still held. Once the point above is resolved, send the receipt again at ${siteUrl}/register/payment using this reference and the email address you registered with.\n\nIf you believe this is a mistake, reply to this email or call ${CONTACT.phones[0].display} with your RRR to hand.\n\n${CONTACT.email}`,
    }).catch((err) => console.error("[admin/payments] rejection email failed", err));
  }

  return NextResponse.json({ ok: true, reference: ref, status: accepted ? "PAID" : "REJECTED" });
}
