import { NextResponse } from "next/server";
import { z } from "zod";
import { guardPublicWrite } from "@/lib/security";
import { normaliseRrr, REMITA } from "@/lib/remita";
import { findPaymentTarget, recordDeclaration, alreadySettled } from "@/lib/paymentTargets";
import { checkDeclaration, FLAG_LABELS } from "@/lib/paymentChecks";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { CONFERENCE, CONTACT } from "@/lib/conference";

// "I have paid at the bank, here is the proof."
//
// This is the step that used to be a Google Form. It takes the Remita
// Retrieval Reference and the receipt, attaches them to the right register,
// and puts the payment in front of the Secretariat to check. It deliberately
// does not mark anything as paid: only a human who has looked at the receipt
// does that, in the admin panel.

const declareSchema = z.object({
  reference: z.string().trim().min(6).max(40),
  email: z.string().trim().email(),
  rrr: z.string().trim().min(10).max(24),
  receiptUrl: z.string().trim().url().max(500),
  receiptPublicId: z.string().trim().max(300).optional().or(z.literal("")),
  /** Typed off the receipt. Whole units, so 40000 rather than 40000.00. */
  declaredAmount: z.number().int().nonnegative().max(100_000_000).optional(),
  /** The date printed on the receipt, as yyyy-mm-dd. */
  paidOn: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  /** Which bank or channel, in the payer's own words. */
  paidVia: z.string().trim().max(120).optional().or(z.literal("")),
});

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "registration");
  if (blocked) return blocked;

  const parsed = declareSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please give your reference, the email you used, your RRR and the receipt." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  const rrr = normaliseRrr(data.rrr);
  if (!rrr) {
    return NextResponse.json(
      {
        error:
          "A Remita Retrieval Reference is 12 digits, like 1234-5678-9012. Check the number on your slip.",
        field: "rrr",
      },
      { status: 400 }
    );
  }

  const target = await findPaymentTarget(data.reference, data.email);
  if (!target) {
    // Same answer whether the reference is unknown or the email does not match
    // it, so this cannot be used to test whether a reference exists.
    return NextResponse.json(
      { error: "No registration matches that reference and email address." },
      { status: 404 }
    );
  }

  if (alreadySettled(target.status)) {
    return NextResponse.json(
      {
        error: "That payment has already been confirmed. There is nothing further to send.",
        status: target.status,
      },
      { status: 409 }
    );
  }

  // Everything that can be checked without Remita's cooperation is checked
  // here, the moment the receipt arrives, and the findings are stored with it.
  // This does not decide whether the money came in; it decides where the
  // Secretariat should look first.
  const paidOn = data.paidOn ? new Date(`${data.paidOn}T12:00:00Z`) : null;
  const checks = await checkDeclaration(target, {
    rrr,
    declaredAmount: data.declaredAmount ?? null,
    paidOn,
    receiptUrl: data.receiptUrl,
  });

  await recordDeclaration(target, {
    rrr,
    receiptUrl: data.receiptUrl,
    receiptPublicId: data.receiptPublicId || null,
    declaredAmount: data.declaredAmount ?? null,
    paidOn,
    paidVia: data.paidVia || null,
    checkFlags: checks.flags.map((flag) => flag.code),
    checkVerdict: checks.verdict,
  });

  const amount = formatAmount(target.amount, target.currency);
  const serious = checks.flags.filter((flag) => flag.severity === "HIGH");

  void sendEmail({
    to: target.email,
    subject: `Payment received for checking, reference ${target.reference}`,
    text: `Dear ${target.payerName},\n\nWe have your payment details for the ${CONFERENCE.edition} ${CONFERENCE.name}.\n\nReference: ${target.reference}\nFor: ${target.purpose}\nAmount: ${amount}\nRRR: ${rrr}\n\nThe Secretariat now checks the receipt against the conference account, normally within ${REMITA.verificationDays} working days. You will get a second email once it is confirmed. Nothing further is needed from you in the meantime.\n\nKeep the original receipt until you have collected your delegate pack at the registration desk.\n\n${CONTACT.email}\n${CONTACT.phones[0].display}`,
  }).catch((err) => console.error("[payments] declaration acknowledgement failed", err));

  void sendSms({
    to: target.phone,
    body: `UNILAG ARC: receipt received for ${target.reference}, RRR ${rrr}. Confirmation follows within ${REMITA.verificationDays} working days.`,
  }).catch((err) => console.error("[payments] declaration SMS failed", err));

  const findings = checks.flags.length
    ? checks.flags.map((flag) => `  ${FLAG_LABELS[flag.code] ?? flag.code}: ${flag.detail}`).join("\n")
    : "  Nothing found. That means nothing contradicts the claim, not that the\n  money has been seen: only the account statement shows that.";

  void sendEmail({
    to: CONTACT.email,
    subject: serious.length
      ? `Payment needs attention: ${target.reference} (${serious.map((f) => FLAG_LABELS[f.code] ?? f.code).join(", ")})`
      : `Payment to check: ${target.reference} (${amount})`,
    text: `A payment has been declared and needs checking.\n\nReference: ${target.reference}\nPayer: ${target.payerName}\nFor: ${target.purpose}\nExpected amount: ${amount}\nPayer says they paid: ${
      data.declaredAmount !== undefined ? formatAmount(data.declaredAmount, target.currency) : "not stated"
    }\nDated: ${data.paidOn || "not stated"}\nPaid via: ${data.paidVia || "not stated"}\nRRR: ${rrr}\n\nThe receipt is not linked here on purpose: it is stored privately and only\nopens for a signed-in member of the Secretariat.\n\nAUTOMATIC CHECKS: ${checks.verdict}\n${findings}\n\nVerify it in the Secretariat dashboard, Payments tab.`,
  }).catch((err) => console.error("[payments] secretariat notification failed", err));

  return NextResponse.json({
    ok: true,
    reference: target.reference,
    rrr,
    status: "DECLARED",
    verificationDays: REMITA.verificationDays,
    checkVerdict: checks.verdict,
  });
}
