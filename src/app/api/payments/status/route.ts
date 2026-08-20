import { NextResponse } from "next/server";
import { z } from "zod";
import { clientIp, isSameOrigin, forbidden, tooManyRequests } from "@/lib/security";
import { consumeRateLimit } from "@/lib/rateLimit";
import { findPaymentTarget } from "@/lib/paymentTargets";

// Lets someone pick up where they left off.
//
// Paying at a bank takes hours or days, so almost nobody completes
// registration in one sitting. This returns what is owed and where the payment
// has got to, given the reference and the email it was made with, so the
// delegate can come back on Thursday and carry on.

const schema = z.object({
  reference: z.string().trim().min(6).max(40),
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbidden();

  const limit = await consumeRateLimit("lookup", clientIp(request));
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter your reference and the email address you registered with." },
      { status: 400 }
    );
  }

  const target = await findPaymentTarget(parsed.data.reference, parsed.data.email);
  if (!target) {
    return NextResponse.json(
      { error: "No registration matches that reference and email address." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    reference: target.reference,
    payerName: target.payerName,
    purpose: target.purpose,
    email: target.email,
    phone: target.phone,
    amount: target.amount,
    currency: target.currency,
    status: target.status,
    rrr: target.rrr,
    paymentNote: target.paymentNote,
    declaredAt: target.declaredAt?.toISOString() ?? null,
  });
}
