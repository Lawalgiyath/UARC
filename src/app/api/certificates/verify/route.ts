import { NextResponse } from "next/server";
import { lookupCertificate } from "@/lib/certificates";
import { clientIp, tooManyRequests } from "@/lib/security";
import { consumeRateLimit } from "@/lib/rateLimit";

// Public certificate verification: anyone holding a certificate code, a
// promotion panel or a funder checking one, can confirm it is genuine.
//
// Rate limited by address because this endpoint answers questions about real
// people. The codes are 60 bits of randomness, so guessing one is not the
// risk; grinding the endpoint is, and 30 lookups per ten minutes is far more
// than an honest checker needs.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim();

  if (!code) {
    return NextResponse.json({ error: "Enter the code printed on the certificate." }, { status: 400 });
  }

  const limit = await consumeRateLimit("lookup", clientIp(request));
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const certificate = await lookupCertificate(code);

  if (!certificate) {
    return NextResponse.json(
      { found: false, error: "No certificate carries that code." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    found: true,
    valid: !certificate.revoked,
    code: certificate.code,
    label: certificate.label,
    statement: certificate.statement,
    recipientName: certificate.recipientName,
    institution: certificate.institution,
    paperTitle: certificate.paperTitle,
    track: certificate.track,
    issuedAt: certificate.issuedAt.toISOString(),
    revokedReason: certificate.revokedReason,
  });
}
