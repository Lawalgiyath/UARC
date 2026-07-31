import Link from "next/link";
import { CONTACT } from "@/lib/conference";

// The four payment landing pages (registration, sponsorship and exhibition,
// each succeeded or failed) say the same three things in the same shape, so
// they share one component rather than four near-identical files.

export function PaymentOutcome({
  eyebrow,
  heading,
  outcome,
  reference,
  body,
  retryHref,
  retryLabel = "Try again",
}: {
  eyebrow: string;
  heading: string;
  outcome: "success" | "failure";
  reference?: string;
  body: React.ReactNode;
  retryHref?: string;
  retryLabel?: string;
}) {
  return (
    <section>
      <div className="wrap login-shell">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="outcome-heading">{heading}</h1>

        {outcome === "success" ? (
          <div className="confirm-panel">
            {reference && <p className="ref">{reference}</p>}
            <div className="confirm-note">{body}</div>
          </div>
        ) : (
          <div className="form-error">
            {reference && <p className="mono">Reference: {reference}</p>}
            <div>{body}</div>
          </div>
        )}

        <div className="outcome-actions">
          {outcome === "failure" && retryHref && (
            <Link className="btn solid" href={retryHref}>
              {retryLabel}
            </Link>
          )}
          <Link className="btn ghost" href="/">
            Back to the conference site
          </Link>
        </div>

        <p className="outcome-contact">
          Something not right? Write to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or
          call <a href={`tel:${CONTACT.phones[0].e164}`}>{CONTACT.phones[0].display}</a>, quoting
          your reference.
        </p>
      </div>
    </section>
  );
}
