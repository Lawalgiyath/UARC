import type { Metadata } from "next";
import Link from "next/link";
import { CertificateVerifier } from "@/components/CertificateVerifier";
import { CONFERENCE, CONTACT } from "@/lib/conference";

export const metadata: Metadata = {
  title: "Verify a Certificate | 19th UNILAG Annual Research Conference",
  description:
    "Check that a certificate issued by the UNILAG Annual Research Conference is genuine, using the code printed on it.",
};

export const dynamic = "force-dynamic";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Verification</div>
          <h1 className="page-title">Verify a certificate</h1>
          <p className="page-lede">
            Every certificate issued by the {CONFERENCE.edition} {CONFERENCE.name} carries a code.
            Enter it below to confirm who it was issued to, what it was issued for, and whether it
            is still valid.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap narrow">
          <CertificateVerifier initialCode={code ?? ""} />

          <div className="verify-notes">
            <h2>What this check tells you</h2>
            <p>
              A genuine code returns the holder&rsquo;s name, their institution, the kind of
              certificate and the date it was issued. That is the whole record: no contact details,
              no fees, nothing that identifies the holder beyond what the certificate itself already
              says.
            </p>
            <p>
              A certificate can be revoked, and a revoked code still resolves here and says so
              plainly, rather than disappearing. If a code does not resolve at all, it was not issued
              by this conference.
            </p>
            <p>
              Checking many certificates at once, for an institutional audit? Write to{" "}
              <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> rather than working through
              them one at a time: this page is rate limited.
            </p>
            <p>
              Looking for your own certificate instead?{" "}
              <Link href="/certificates">Collect it here</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
