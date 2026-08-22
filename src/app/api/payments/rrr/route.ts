import { NextResponse } from "next/server";
import { z } from "zod";
import { guardPublicWrite } from "@/lib/security";
import { findPaymentTarget, recordRrr, alreadySettled } from "@/lib/paymentTargets";
import { generateRrr, remitaApiConfigured, DUPLICATE_ORDER } from "@/lib/remitaApi";
import { normaliseRrr } from "@/lib/remita";

// Gets a delegate their Remita Retrieval Reference without sending them away.
//
// The reference is generated against the university's Remita collection and
// handed straight back to the page, so the payer sees their RRR here and can
// either pay by card in the modal or carry the number to a bank. Either way
// they never visit the portal.
//
// Generating a reference is not paying: the status stays PENDING until money
// actually arrives, which /api/payments/remita-status decides.

const schema = z.object({
  reference: z.string().trim().min(6).max(40),
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "lookup");
  if (blocked) return blocked;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Give your reference and the email you registered with." }, { status: 400 });
  }

  // 503 rather than an error: the caller is expected to fall back to the
  // prefilled portal link, which is a working payment route, not a failure.
  if (!remitaApiConfigured()) {
    return NextResponse.json(
      { error: "Direct payment is not switched on yet.", fallback: "PORTAL" },
      { status: 503 }
    );
  }

  const target = await findPaymentTarget(parsed.data.reference, parsed.data.email);
  if (!target) {
    return NextResponse.json(
      { error: "No registration matches that reference and email address." },
      { status: 404 }
    );
  }

  if (alreadySettled(target.status)) {
    return NextResponse.json(
      { error: "That payment is already confirmed.", status: target.status },
      { status: 409 }
    );
  }

  // Remita collects in naira. International delegates paying in dollars go the
  // portal route, which handles the conversion at the university's end.
  if (target.currency !== "NGN") {
    return NextResponse.json(
      {
        error: `Payments in ${target.currency} are handled on the university portal rather than here.`,
        fallback: "PORTAL",
      },
      { status: 503 }
    );
  }

  // Already have one? Hand it back. This is not just an optimisation: Remita
  // refuses a repeated orderId outright rather than returning what it issued
  // before, so the stored reference is the only copy we will ever get.
  if (target.rrr) {
    return NextResponse.json({
      rrr: target.rrr,
      reused: true,
      amount: target.amount,
      currency: target.currency,
      payerName: target.payerName,
      email: target.email,
      merchantId: process.env.REMITA_MERCHANT_ID,
      purpose: target.purpose,
    });
  }

  const ask = (orderId: string) =>
    generateRrr({
      orderId,
      amount: target.amount,
      payerName: target.payerName,
      payerEmail: target.email,
      payerPhone: target.phone,
      description: `${target.purpose} (${target.reference})`,
    });

  try {
    // The registration's own reference is the orderId, so a payment can be
    // traced from our records to the university's Remita report by eye.
    let result;
    try {
      result = await ask(target.reference);
    } catch (err) {
      if ((err as Error).name !== DUPLICATE_ORDER) throw err;
      // Remita has issued a reference for this order and we do not hold it,
      // which means the last attempt reached Remita but never reached our
      // database. Remita will not tell us the number, so ask for a fresh one
      // under a suffixed order. That leaves an unpaid reference stranded at
      // Remita, which costs nothing, and it unsticks the delegate.
      console.warn(`[payments/rrr] duplicate order for ${target.reference}, retrying suffixed`);
      result = await ask(`${target.reference}-${Date.now().toString(36).toUpperCase()}`);
    }

    const rrr = normaliseRrr(result.rrr) ?? result.rrr;
    await recordRrr(target, rrr);

    return NextResponse.json({
      rrr,
      reused: false,
      amount: target.amount,
      currency: target.currency,
      payerName: target.payerName,
      email: target.email,
      merchantId: process.env.REMITA_MERCHANT_ID,
      purpose: target.purpose,
    });
  } catch (err) {
    console.error("[payments/rrr] Remita would not issue a reference", err);
    // The registration is untouched, so the portal route is still open to them.
    return NextResponse.json(
      {
        error: "Remita could not issue a payment reference just now. You can still pay on the university portal.",
        fallback: "PORTAL",
      },
      { status: 502 }
    );
  }
}
