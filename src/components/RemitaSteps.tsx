"use client";

import { useState } from "react";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { RemitaInline } from "@/components/RemitaInline";
import { REMITA, remitaSteps, portalPaymentUrl } from "@/lib/remita";

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
  amount,
  onPaid,
}: {
  amountLabel: string;
  payerName: string;
  reference: string;
  email: string;
  phone: string;
  /** The bare figure, for the portal's Amount box. */
  amount: number;
  /** Let the surrounding page refresh once a payment settles. */
  onPaid?: () => void;
}) {
  const steps = remitaSteps({ amountLabel, payerName, reference, email, phone });
  // Opens the university's own portal with every field already populated.
  const portalHref = portalPaymentUrl({ payerName, email, phone, amount });

  // Whether the payment can be taken on this page. Null until we have asked.
  const [payHere, setPayHere] = useState<boolean | null>(null);
  const [settled, setSettled] = useState(false);

  if (settled) {
    return (
      <div className="remita">
        <div className="remita-settled">
          <span className="remita-inline-icon">
            <AcademicIcon name="shield" size={26} />
          </span>
          <div>
            <h3>Payment confirmed</h3>
            <p>
              Remita has confirmed your {amountLabel} against reference{" "}
              <span className="mono">{reference}</span>. Your registration is complete and a
              confirmation is on its way to {email}. There is no receipt to send.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="remita">
      <RemitaInline
        reference={reference}
        email={email}
        amountLabel={amountLabel}
        onAvailability={setPayHere}
        onPaid={() => {
          setSettled(true);
          onPaid?.();
        }}
      />

      <div className={payHere ? "remita-head is-secondary" : "remita-head"}>
        <div>
          <div className="eyebrow">{payHere ? "Another way to pay" : "Step 2 of 3"}</div>
          <h3>{payHere ? `Or pay ${amountLabel} on the university portal` : `Pay ${amountLabel} through Remita`}</h3>
          <p>
            This opens the University of Lagos payment portal with your name, mobile, email, the
            payment item and the amount already filled in. Check them, press Continue, and pay by
            card there or print the slip and take it to any commercial bank.
          </p>
        </div>
        <a className="btn solid remita-cta" href={portalHref} target="_blank" rel="noreferrer noopener">
          Pay {amountLabel} on the UNILAG portal
        </a>
      </div>

      <p className="remita-prefill-note">
        Opens {REMITA.portalHost}, the university&rsquo;s own payment portal. Nothing on this site
        takes your card details. If the link does not carry your details across, the steps below
        are the same payment done by hand.
      </p>

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
