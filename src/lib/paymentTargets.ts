import { db } from "@/lib/db";

// Delegates, sponsors and exhibitors all pay the same way, so they share one
// declaration route rather than three near-identical ones. The reference
// prefix says which register a payment belongs to, and each kind exposes the
// same small surface: look it up, describe what is owed, record a declaration.

export type PaymentKind = "registration" | "sponsor" | "exhibitor";

export interface PaymentTarget {
  kind: PaymentKind;
  id: string;
  reference: string;
  /** Who to address in correspondence. */
  payerName: string;
  /** What they are paying for, in words. */
  purpose: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  status: string;
  rrr: string | null;
  receiptUrl: string | null;
  paymentNote: string | null;
  declaredAt: Date | null;
}

export function kindFromReference(reference: string): PaymentKind | null {
  const ref = reference.trim().toUpperCase();
  if (ref.startsWith("UARC26-REG")) return "registration";
  if (ref.startsWith("UARC26-SPN")) return "sponsor";
  if (ref.startsWith("UARC26-EXH")) return "exhibitor";
  return null;
}

/**
 * Finds what a reference refers to. The email must match the one on file:
 * without that, anyone holding a reference could attach a receipt to someone
 * else's registration, or read back their details.
 */
export async function findPaymentTarget(
  reference: string,
  email: string
): Promise<PaymentTarget | null> {
  const ref = reference.trim().toUpperCase();
  const addr = email.trim().toLowerCase();
  const kind = kindFromReference(ref);
  if (!kind) return null;

  if (kind === "registration") {
    const row = await db.registration.findUnique({ where: { reference: ref } });
    if (!row || row.email.toLowerCase() !== addr) return null;
    return {
      kind,
      id: row.id,
      reference: row.reference,
      payerName: row.fullName,
      purpose: `${row.category} registration`,
      email: row.email,
      phone: row.phone,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      rrr: row.rrr,
      receiptUrl: row.receiptUrl,
      paymentNote: row.paymentNote,
      declaredAt: row.declaredAt,
    };
  }

  if (kind === "sponsor") {
    const row = await db.sponsor.findUnique({ where: { reference: ref } });
    if (!row || row.email.toLowerCase() !== addr) return null;
    return {
      kind,
      id: row.id,
      reference: row.reference,
      payerName: row.contactName,
      purpose: `${row.tier}, ${row.organisation}`,
      email: row.email,
      phone: row.phone,
      amount: row.amount,
      currency: row.currency,
      status: row.status,
      rrr: row.rrr,
      receiptUrl: row.receiptUrl,
      paymentNote: row.paymentNote,
      declaredAt: row.declaredAt,
    };
  }

  const row = await db.exhibitor.findUnique({ where: { reference: ref } });
  if (!row || row.email.toLowerCase() !== addr) return null;
  return {
    kind,
    id: row.id,
    reference: row.reference,
    payerName: row.contactName,
    purpose: `${row.packageKey}, ${row.organisation}`,
    email: row.email,
    phone: row.phone,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
    rrr: row.rrr,
    receiptUrl: row.receiptUrl,
    paymentNote: row.paymentNote,
    declaredAt: row.declaredAt,
  };
}

/** Records an RRR and receipt against a target, moving it to DECLARED. */
export async function recordDeclaration(
  target: PaymentTarget,
  input: { rrr: string; receiptUrl: string; receiptPublicId: string | null }
): Promise<void> {
  const data = {
    rrr: input.rrr,
    receiptUrl: input.receiptUrl,
    receiptPublicId: input.receiptPublicId,
    declaredAt: new Date(),
    // A re-declaration after a rejection clears the old reason, so the
    // delegate is not left staring at a note about a receipt they replaced.
    paymentNote: null,
    paymentCheckedAt: null,
    status: "DECLARED" as const,
  };

  if (target.kind === "registration") {
    await db.registration.update({ where: { id: target.id }, data });
  } else if (target.kind === "sponsor") {
    await db.sponsor.update({ where: { id: target.id }, data });
  } else {
    await db.exhibitor.update({ where: { id: target.id }, data });
  }
}

/** Statuses that mean "do not accept another receipt for this one". */
export function alreadySettled(status: string): boolean {
  return status === "PAID" || status === "CONFIRMED";
}

/**
 * Stores an RRR against a target without claiming anything has been paid.
 *
 * Used when we generate the reference ourselves through Remita's API: at that
 * moment the money has not moved, so the status must not change. A delegate
 * who generates an RRR and then walks away is still PENDING.
 */
export async function recordRrr(target: PaymentTarget, rrr: string): Promise<void> {
  const data = { rrr };
  if (target.kind === "registration") {
    await db.registration.update({ where: { id: target.id }, data });
  } else if (target.kind === "sponsor") {
    await db.sponsor.update({ where: { id: target.id }, data });
  } else {
    await db.exhibitor.update({ where: { id: target.id }, data });
  }
}

/**
 * Marks a payment settled on Remita's word rather than a person's.
 *
 * This is the one place a payment becomes PAID without the Secretariat looking
 * at a receipt, and it is only reached after Remita itself has confirmed the
 * money against the RRR. The note records that, so the admin table shows why
 * a row was confirmed with nothing attached to it.
 */
export async function markPaidByRemita(
  target: PaymentTarget,
  input: { rrr: string; amountPaid: number | null; paidAt: string | null; channel: string | null }
): Promise<void> {
  const when = input.paidAt ? `on ${input.paidAt}` : "";
  const how = input.channel ? ` by ${input.channel.toLowerCase()}` : "";
  // Remita reports the amount standing against the reference rather than a
  // separately confirmed receipt, so this is worded as what Remita holds.
  const paid = input.amountPaid !== null ? ` Remita records ${input.amountPaid}.` : "";

  const data = {
    rrr: input.rrr,
    status: "PAID" as const,
    paymentCheckedAt: new Date(),
    declaredAt: target.declaredAt ?? new Date(),
    paymentNote: `Confirmed automatically by Remita${how} ${when}.${paid}`.replace(/\s+/g, " ").trim(),
  };

  if (target.kind === "registration") {
    await db.registration.update({ where: { id: target.id }, data });
  } else if (target.kind === "sponsor") {
    await db.sponsor.update({ where: { id: target.id }, data });
  } else {
    await db.exhibitor.update({ where: { id: target.id }, data });
  }
}
