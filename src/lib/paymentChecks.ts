import { db } from "@/lib/db";
import type { PaymentTarget } from "@/lib/paymentTargets";

// Checking a payment when nobody will tell us whether it happened.
//
// With Remita's merchant key we would simply ask Remita and be done; that is
// what lib/remitaApi.ts does, and it is switched off until the university
// releases the credentials. Until then the only evidence is what the payer
// types and the photograph they attach, and a photograph proves very little.
//
// So this does the part that can be done honestly: it turns a receipt into
// structured facts, checks those facts against what we already know, and says
// where a human should look. It does not decide that a payment happened. The
// Secretariat still confirms, but they confirm against a list of findings
// rather than by squinting at two hundred photographs in a row.
//
// The findings that matter are the ones a person scanning quickly would miss:
// the same RRR pasted onto two registrations, an amount that is two thousand
// naira short, a receipt dated before the delegate ever registered.

export type Verdict = "CLEAR" | "REVIEW";

export interface CheckFlag {
  code: string;
  /** Shown to the Secretariat, in the admin table. */
  detail: string;
  /**
   * Severity is about attention, not guilt. HIGH means do not accept this
   * without looking; LOW means it is worth a glance.
   */
  severity: "HIGH" | "LOW";
}

export interface CheckResult {
  verdict: Verdict;
  flags: CheckFlag[];
}

export interface Declaration {
  rrr: string;
  /** What the payer says they paid, in whole naira or dollars. */
  declaredAmount: number | null;
  /** The date printed on the receipt. */
  paidOn: Date | null;
  receiptUrl: string | null;
}

function money(amount: number, currency: string): string {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

/**
 * Is this RRR already attached to somebody else?
 *
 * The cheapest way to fake a payment is to take a receipt that really was
 * paid, for a colleague or for a previous year, and attach it to a second
 * registration. The receipt is genuine, the RRR is genuine, and everything
 * looks right to a person reading one row at a time. Only comparing across all
 * three registers catches it, which is precisely what a person cannot do by
 * eye and a database does instantly.
 */
async function rrrUsedElsewhere(rrr: string, self: PaymentTarget): Promise<string[]> {
  const [registrations, sponsors, exhibitors] = await Promise.all([
    db.registration.findMany({ where: { rrr }, select: { reference: true } }),
    db.sponsor.findMany({ where: { rrr }, select: { reference: true } }),
    db.exhibitor.findMany({ where: { rrr }, select: { reference: true } }),
  ]);

  return [...registrations, ...sponsors, ...exhibitors]
    .map((row) => row.reference)
    .filter((reference) => reference !== self.reference);
}

/**
 * Runs every check against one declaration.
 *
 * Deliberately returns findings rather than a decision. A CLEAR verdict means
 * "nothing here contradicts the claim", which is not the same as "this was
 * paid", and the wording in the admin panel says so.
 */
export async function checkDeclaration(
  target: PaymentTarget,
  declaration: Declaration,
  now: Date = new Date()
): Promise<CheckResult> {
  const flags: CheckFlag[] = [];

  const clash = await rrrUsedElsewhere(declaration.rrr, target);
  if (clash.length > 0) {
    flags.push({
      code: "RRR_REUSED",
      severity: "HIGH",
      detail: `This RRR is already on ${clash.join(", ")}. One payment cannot settle two registrations.`,
    });
  }

  if (declaration.declaredAmount === null) {
    flags.push({
      code: "AMOUNT_MISSING",
      severity: "LOW",
      detail: "The payer did not say how much they paid, so the amount cannot be checked.",
    });
  } else if (declaration.declaredAmount < target.amount) {
    flags.push({
      code: "AMOUNT_SHORT",
      severity: "HIGH",
      detail: `Paid ${money(declaration.declaredAmount, target.currency)} against ${money(
        target.amount,
        target.currency
      )} owed, short by ${money(target.amount - declaration.declaredAmount, target.currency)}.`,
    });
  } else if (declaration.declaredAmount > target.amount) {
    // Overpayment is not fraud, but the university owes a refund and somebody
    // has to know before the delegate arrives asking about it.
    flags.push({
      code: "AMOUNT_OVER",
      severity: "LOW",
      detail: `Paid ${money(declaration.declaredAmount, target.currency)} against ${money(
        target.amount,
        target.currency
      )} owed, over by ${money(declaration.declaredAmount - target.amount, target.currency)}.`,
    });
  }

  if (declaration.paidOn) {
    // Compared by day, because a receipt carries a date and not a timestamp,
    // and a payment made this morning must not read as being in the future.
    const paidDay = new Date(declaration.paidOn);
    paidDay.setHours(0, 0, 0, 0);
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    if (paidDay.getTime() > today.getTime()) {
      flags.push({
        code: "DATE_FUTURE",
        severity: "HIGH",
        detail: "The receipt is dated in the future.",
      });
    }

    const days = Math.round((today.getTime() - paidDay.getTime()) / 86_400_000);
    if (days > 365) {
      flags.push({
        code: "DATE_STALE",
        severity: "HIGH",
        detail: `The receipt is dated ${days} days ago, which is before this edition opened.`,
      });
    }
  } else {
    flags.push({
      code: "DATE_MISSING",
      severity: "LOW",
      detail: "No payment date was given.",
    });
  }

  if (!declaration.receiptUrl) {
    flags.push({
      code: "RECEIPT_MISSING",
      severity: "HIGH",
      detail: "No receipt was attached.",
    });
  }

  if (target.status === "REJECTED") {
    flags.push({
      code: "REDECLARED",
      severity: "LOW",
      detail: "A previous receipt for this registration was refused. Check what changed.",
    });
  }

  return { verdict: flags.length === 0 ? "CLEAR" : "REVIEW", flags };
}

/** Plain-English summaries, for the admin table and the alert email. */
export const FLAG_LABELS: Record<string, string> = {
  RRR_REUSED: "RRR already used",
  AMOUNT_MISSING: "No amount given",
  AMOUNT_SHORT: "Underpaid",
  AMOUNT_OVER: "Overpaid",
  DATE_FUTURE: "Dated in the future",
  DATE_STALE: "Receipt too old",
  DATE_MISSING: "No date given",
  RECEIPT_MISSING: "No receipt",
  REDECLARED: "Sent again after refusal",
};
