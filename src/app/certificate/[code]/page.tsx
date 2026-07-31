import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UnilagLogo } from "@/components/UnilagLogo";
import { IconPattern } from "@/components/IconPattern";
import { AcademicVine } from "@/components/AcademicVine";
import { lookupCertificate } from "@/lib/certificates";
import { CONFERENCE, CRC } from "@/lib/conference";
import { UNIVERSITY } from "@/lib/university";

// The certificate itself.
//
// Rendered from the database on request rather than generated as a stored PDF:
// there is no file to lose, a reissue is the same URL, and a correction to a
// name takes effect immediately everywhere. Delegates print to PDF from the
// browser, which every phone and laptop can do, and the print stylesheet in
// globals.css strips everything except the certificate.
//
// Deliberately outside the (site) route group so it carries no site header,
// navigation or footer.

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const certificate = await lookupCertificate(code);
  if (!certificate) return { title: "Certificate not found" };

  return {
    title: `${certificate.label}, ${certificate.recipientName} | ${CONFERENCE.edition} ${CONFERENCE.shortName}`,
    // A certificate is a personal record, so keep it out of search results.
    robots: { index: false, follow: false },
  };
}

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const certificate = await lookupCertificate(code);

  if (!certificate) notFound();

  const issued = certificate.issuedAt.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="certificate-page">
      <div className="certificate-toolbar no-print">
        <Link className="btn ghost small" href="/certificates">
          Back to certificates
        </Link>
        <span className="certificate-hint">
          Use your browser&rsquo;s print command and choose &ldquo;Save as PDF&rdquo;.
        </span>
      </div>

      {certificate.revoked && (
        <div className="certificate-revoked-banner">
          This certificate was revoked{certificate.revokedReason ? `: ${certificate.revokedReason}` : "."}
        </div>
      )}

      <article className={`certificate ${certificate.revoked ? "is-revoked" : ""}`}>
        <IconPattern variant="loose" opacity={0.05} className="certificate-pattern" />

        <div className="certificate-inner">
          <header className="certificate-head">
            <UnilagLogo height={72} variant="crestOnly" />
            <div className="certificate-issuer">
              <div className="certificate-university">{UNIVERSITY.name}</div>
              <div className="certificate-crc">
                {CRC.name} ({CRC.abbr})
              </div>
            </div>
          </header>

          <AcademicVine variant="horizontal" className="certificate-vine" />

          <p className="certificate-kind">{certificate.label}</p>
          <p className="certificate-preamble">This is to certify that</p>

          <h1 className="certificate-name">{certificate.recipientName}</h1>

          {certificate.institution && (
            <p className="certificate-institution">{certificate.institution}</p>
          )}

          <p className="certificate-statement">
            {certificate.statement}, held at the {CONFERENCE.venue}, University of Lagos, Akoka,{" "}
            {CONFERENCE.dates}, on the theme
          </p>

          <p className="certificate-theme">&ldquo;{CONFERENCE.theme}&rdquo;</p>

          {certificate.paperTitle && (
            <p className="certificate-paper">
              for the paper &ldquo;{certificate.paperTitle}&rdquo;
              {certificate.track ? `, in ${certificate.track}` : ""}
            </p>
          )}

          <AcademicVine variant="horizontal" className="certificate-vine flipped" flip />

          <footer className="certificate-foot">
            <div className="certificate-signature">
              <div className="certificate-rule" />
              <div className="certificate-role">Chair, {CRC.name}</div>
              <div className="certificate-role-sub">{CRC.chairRole}</div>
            </div>
            <div className="certificate-signature">
              <div className="certificate-rule" />
              <div className="certificate-role">Chair, Conference Planning Committee</div>
              <div className="certificate-role-sub">{CRC.secretariat}</div>
            </div>
          </footer>

          <div className="certificate-verify">
            <span className="mono">{certificate.code}</span>
            <span>Issued {issued}</span>
            <span>Verify at unilag.edu.ng conference site, /verify</span>
          </div>
        </div>
      </article>
    </main>
  );
}
