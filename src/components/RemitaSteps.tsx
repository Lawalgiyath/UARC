"use client";

import { useState } from "react";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { REMITA, remitaSteps } from "@/lib/remita";

// The portal walkthrough, with the payer's own figures already filled in.
//
// The point of doing this on the site rather than in a PDF is that the fields
// are the delegate's actual details and their actual amount, ready to copy.
// The most common way this payment goes wrong is a mistyped amount or a
// payment item picked from the wrong end of the drop-down, and both of those
// come from asking people to transcribe.

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard access can be refused; the value is on screen to be read.
      setCopied(false);
    }
  }

  return (
    <div className="copy-field">
      <span className="copy-label">{label}</span>
      <span className="copy-value">{value}</span>
      <button type="button" onClick={copy} aria-label={`Copy ${label}`}>
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

export function RemitaSteps({
  amountLabel,
  payerName,
  reference,
  email,
  phone,
}: {
  amountLabel: string;
  payerName: string;
  reference: string;
  email: string;
  phone: string;
}) {
  const steps = remitaSteps({ amountLabel, payerName, reference, email, phone });
  const portalHref = REMITA.directPortalUrl ?? REMITA.siteUrl;

  return (
    <div className="remita">
      <div className="remita-head">
        <div>
          <div className="eyebrow">Step 2 of 3</div>
          <h3>Pay {amountLabel} through Remita</h3>
          <p>
            The University of Lagos collects conference fees through its Remita portal. You generate
            a payment slip there, pay it at any commercial bank, then come back here with the
            receipt.
          </p>
        </div>
        <a className="btn solid" href={portalHref} target="_blank" rel="noreferrer noopener">
          Open {REMITA.siteLabel}
        </a>
      </div>

      <ol className="remita-steps">
        {steps.map((step) => (
          <li key={step.n}>
            <span className="remita-n mono">{String(step.n).padStart(2, "0")}</span>
            <span className="remita-icon">
              <AcademicIcon name={step.icon} size={22} />
            </span>
            <div className="remita-body">
              <h4>{step.title}</h4>
              <p>{step.body}</p>
              {step.fields && (
                <div className="copy-fields">
                  {step.fields.map((field) => (
                    <CopyField key={field.label} label={field.label} value={field.value} />
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="remita-help">
        Stuck on the portal? WhatsApp{" "}
        <a href={`https://wa.me/${REMITA.whatsApp.e164.replace("+", "")}`} target="_blank" rel="noreferrer noopener">
          {REMITA.whatsApp.display}
        </a>
        . Keep the original receipt until you collect your delegate pack.
      </p>
    </div>
  );
}
