const PAYSTACK_BASE = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set");
  return key;
}

interface InitializeArgs {
  email: string;
  amountMajorUnits: number;
  currency: "NGN" | "USD";
  reference: string;
  callbackUrl: string;
}

interface InitializeResult {
  authorizationUrl: string;
  accessCode: string;
}

export async function initializeTransaction({
  email,
  amountMajorUnits,
  currency,
  reference,
  callbackUrl,
}: InitializeArgs): Promise<InitializeResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amountMajorUnits * 100),
      currency,
      reference,
      callback_url: callbackUrl,
    }),
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || `Paystack initialize failed with status ${res.status}`);
  }

  return {
    authorizationUrl: json.data.authorization_url,
    accessCode: json.data.access_code,
  };
}

interface VerifyResult {
  paid: boolean;
  amountMajorUnits: number;
  currency: string;
  reference: string;
}

export async function verifyTransaction(reference: string): Promise<VerifyResult> {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || `Paystack verify failed with status ${res.status}`);
  }

  return {
    paid: json.data.status === "success",
    amountMajorUnits: json.data.amount / 100,
    currency: json.data.currency,
    reference: json.data.reference,
  };
}
