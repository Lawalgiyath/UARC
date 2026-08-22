// Talking to Remita directly, so the payment happens on this site.
//
// The portal link in remita.ts sends a delegate to pay.tranzgate.com.ng with
// their details filled in. It works, but it is still somebody else's website:
// they leave us, and we only learn they paid when they come back and upload a
// receipt for a human to check.
//
// Remita's own API removes both halves of that. We generate the Remita
// Retrieval Reference here, show it on our page, and take the card payment in
// a modal that never leaves this site. Then we ask Remita whether the money
// arrived, which means a payment confirms itself instead of waiting on the
// Secretariat to read a receipt.
//
// What it needs, and why it is not switched on yet
// -----------------------------------------------
// Three credentials, all issued by Remita to the *university*, not to us:
//
//     REMITA_MERCHANT_ID        identifies the University of Lagos
//     REMITA_SERVICE_TYPE_ID    the "Research Conference & Fair" collection
//     REMITA_API_KEY            secret, signs every request
//
// There is no way around that. Generating an RRR means creating a demand for
// money against the university's account, and the API key is precisely what
// authorises it. This is the same key Heckerbella has not released yet.
//
// So everything below is written and waiting. Set the three variables and the
// site switches from "here is a link to the portal" to "pay here", with no
// code change. Until then remitaApiConfigured() is false and the portal link
// carries on doing the job.
//
// Endpoints, hashes and option names were verified against Remita's own
// published integration samples and its live inline bundle.

import { createHash } from "node:crypto";

// remitademo.net still appears all over Remita's older samples, but it now
// answers with a 302 to demo.remita.net. Pointing straight at the new host
// keeps the redirect out of the request, which matters because a redirected
// POST is not guaranteed to keep its method or its Authorization header.
const BASE = {
  live: "https://login.remita.net/remita/exapp/api/v1/send/api/echannelsvc",
  demo: "https://demo.remita.net/remita/exapp/api/v1/send/api/echannelsvc",
} as const;

function env() {
  return {
    merchantId: process.env.REMITA_MERCHANT_ID ?? "",
    serviceTypeId: process.env.REMITA_SERVICE_TYPE_ID ?? "",
    apiKey: process.env.REMITA_API_KEY ?? "",
    mode: (process.env.REMITA_ENV === "live" ? "live" : "demo") as "live" | "demo",
  };
}

/**
 * Whether we can transact directly. False until the university's Remita
 * credentials are in the environment, which is the normal state today.
 */
export function remitaApiConfigured(): boolean {
  const { merchantId, serviceTypeId, apiKey } = env();
  return Boolean(merchantId && serviceTypeId && apiKey);
}

/** Remita signs with SHA512 over a bare concatenation, in a fixed order. */
function sha512(input: string): string {
  return createHash("sha512").update(input).digest("hex");
}

/**
 * Remita answers this API with JSONP even when nothing asked for it: the body
 * arrives as `jsonp {"statuscode":"025",...}`. Strip the wrapper, then parse.
 */
function parseRemitaBody(body: string): Record<string, unknown> {
  const trimmed = body.trim();
  const open = trimmed.indexOf("{");
  const close = trimmed.lastIndexOf("}");
  if (open === -1 || close === -1 || close < open) {
    throw new Error(`Remita returned something that is not JSON: ${trimmed.slice(0, 200)}`);
  }
  return JSON.parse(trimmed.slice(open, close + 1)) as Record<string, unknown>;
}

function str(value: unknown): string {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export interface RrrResult {
  rrr: string;
  /** Remita's own code for what happened, kept for the logs. */
  statusCode: string;
  message: string;
}

/** Remita's answer when an orderId has been used before. */
export const DUPLICATE_ORDER = "DUPLICATE_REQUEST";

/**
 * Creates the Remita Retrieval Reference for one payment.
 *
 * orderId is ours, and Remita will not accept the same one twice: a repeat
 * comes back as DUPLICATE_REQUEST, and it does not hand back the reference it
 * issued the first time. Verified against the sandbox. So callers must store
 * the RRR they are given and not call this again for a payment that has one;
 * see the route, which reuses from the database and only retries with a
 * different orderId if Remita says duplicate while we hold nothing.
 *
 * Remita collects in naira. A USD fee cannot go down this route, and callers
 * are expected to have checked that already.
 */
export async function generateRrr(input: {
  orderId: string;
  amount: number;
  payerName: string;
  payerEmail: string;
  payerPhone: string;
  description: string;
}): Promise<RrrResult> {
  const { merchantId, serviceTypeId, apiKey, mode } = env();
  if (!remitaApiConfigured()) {
    throw new Error("Remita API credentials are not configured.");
  }

  // The amount is hashed exactly as it is sent, so it is stringified once and
  // that one string is used for both. A mismatch here reads as a bad key.
  const amount = String(Math.round(input.amount));
  const hash = sha512(merchantId + serviceTypeId + input.orderId + amount + apiKey);

  const res = await fetch(`${BASE[mode]}/merchant/api/paymentinit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `remitaConsumerKey=${merchantId},remitaConsumerToken=${hash}`,
    },
    body: JSON.stringify({
      serviceTypeId,
      amount,
      orderId: input.orderId,
      payerName: input.payerName,
      payerEmail: input.payerEmail,
      payerPhone: input.payerPhone,
      description: input.description,
    }),
    signal: AbortSignal.timeout(20_000),
  });

  const json = parseRemitaBody(await res.text());
  const rrr = str(json.RRR || json.rrr);
  // On success `status` carries the words and `statuscode` the number; on a
  // refusal `status` carries the machine-readable reason instead.
  const statusCode = str(json.statuscode || json.statusCode);
  const message = str(json.status || json.statusMessage) || "No message from Remita.";

  if (!rrr) {
    const err = new Error(`Remita did not return an RRR (${statusCode || message}).`);
    // Named so the caller can tell "try a different orderId" apart from
    // "Remita is unhappy", which need different handling.
    err.name = message === DUPLICATE_ORDER ? DUPLICATE_ORDER : "RemitaError";
    throw err;
  }
  return { rrr, statusCode, message };
}

export interface RrrStatus {
  rrr: string;
  /** True only when Remita says the money is actually in. */
  paid: boolean;
  statusCode: string;
  message: string;
  /**
   * The amount Remita holds against the reference. Note this is populated
   * before anything is paid, so it is the amount demanded, not proof of an
   * amount received; only read it alongside `paid`.
   */
  amount: number | null;
  paidAt: string | null;
  channel: string | null;
}

/**
 * Asks Remita whether an RRR has been paid.
 *
 * Codes seen from Remita against a live reference: "025" when it has just been
 * generated, "021" for Transaction Pending, both verified in the sandbox. "00"
 * and "01" are the documented success codes and are the only two treated as
 * paid here. That set is worth confirming against the university's own Remita
 * profile the first time a real payment goes through, because until a real
 * naira has moved nobody has seen this return success.
 */
export async function checkRrrStatus(rrr: string): Promise<RrrStatus> {
  const { merchantId, apiKey, mode } = env();
  if (!remitaApiConfigured()) {
    throw new Error("Remita API credentials are not configured.");
  }

  const digits = rrr.replace(/\D/g, "");
  // Note the order: this hash is rrr + key + merchant, not the order used above.
  const hash = sha512(digits + apiKey + merchantId);

  const res = await fetch(`${BASE[mode]}/${merchantId}/${digits}/${hash}/status.reg`, {
    headers: {
      Authorization: `remitaConsumerKey=${merchantId},remitaConsumerToken=${hash}`,
    },
    signal: AbortSignal.timeout(20_000),
  });

  const json = parseRemitaBody(await res.text());
  const statusCode = str(json.status || json.statuscode);
  const amountRaw = Number(str(json.amount));

  return {
    rrr: digits,
    paid: statusCode === "00" || statusCode === "01",
    statusCode,
    message: str(json.message || json.statusMessage) || "No message from Remita.",
    amount: Number.isFinite(amountRaw) && amountRaw > 0 ? amountRaw : null,
    paidAt: str(json.paymentDate || json.transactiontime) || null,
    channel: str(json.channel) || null,
  };
}
