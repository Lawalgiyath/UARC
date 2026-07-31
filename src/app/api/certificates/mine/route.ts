import { NextResponse } from "next/server";
import { z } from "zod";
import { certificatesForHolder, CERTIFICATE_LABELS } from "@/lib/certificates";
import { clientIp, isSameOrigin, forbidden, tooManyRequests } from "@/lib/security";
import { consumeRateLimit } from "@/lib/rateLimit";

// "Where is my certificate?" — answered with the email address and the
// reference code the holder already has. Both are required: an email address
// on its own would let anyone pull another delegate's records.

const schema = z.object({
  email: z.string().trim().email(),
  reference: z.string().trim().min(6).max(40),
});

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return forbidden();

  const limit = await consumeRateLimit("lookup", clientIp(request));
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter the email address you registered with and your reference code." },
      { status: 400 }
    );
  }

  const certificates = await certificatesForHolder(parsed.data.email, parsed.data.reference);

  // Deliberately the same answer whether the reference does not exist or the
  // email does not match it, so this cannot be used to test whether a given
  // reference is real.
  if (certificates.length === 0) {
    return NextResponse.json({
      certificates: [],
      message:
        "No certificate has been issued against that email address and reference yet. Certificates appear once attendance is recorded at the registration desk, or once a presentation is confirmed in the programme.",
    });
  }

  return NextResponse.json({
    certificates: certificates.map((c) => ({
      code: c.code,
      kind: c.kind,
      label: CERTIFICATE_LABELS[c.kind],
      recipientName: c.recipientName,
      paperTitle: c.paperTitle,
      issuedAt: c.issuedAt.toISOString(),
      url: `/certificate/${c.code}`,
    })),
  });
}
