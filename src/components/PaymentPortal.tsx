"use client";

import { useState } from "react";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { RemitaSteps } from "@/components/RemitaSteps";
import { PaymentDeclaration } from "@/components/PaymentDeclaration";
import { REMITA } from "@/lib/remita";

// The way back in.
//
// Paying at a bank takes hours or days, so hardly anyone finishes registration
// in one sitting. This page takes the reference and email a delegate already
// has, shows them exactly where their payment stands, and gives them the right
// next action for that state: pay, send the receipt, wait, or fix a rejection.

interface PaymentStatus {
  reference: string;
  payerName: string;
  purpose: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  status: string;
  rrr: string | null;
  paymentNote: string | null;
  declaredAt: string | null;
}

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString("en-US")}` : `₦${amount.toLocaleString("en-NG")}`;
}

const STATE = {
  PENDING: {
    tone: "is-waiting",
    icon: "city" as const,
    title: "Payment not received yet",
    body: "Follow the steps below to generate your Remita slip and pay it at any commercial bank, then come back and send us the receipt.",
  },
  AWAITING_PAYMENT: {
    tone: "is-waiting",
    icon: "city" as const,
    title: "Payment not received yet",
    body: "Follow the steps below to generate your Remita slip and pay it at any commercial bank, then come back and send us the receipt.",
  },
  DECLARED: {
    tone: "is-declared",
    icon: "scroll" as const,
    title: "Receipt received, being checked",
    body: `The Secretariat is checking your receipt against the conference account. This normally takes up to ${REMITA.verificationDays} working days, and you will be told by email and SMS. Nothing further is needed from you.`,
  },
  PAID: {
    tone: "is-paid",
    icon: "shield" as const,
    title: "Payment confirmed",
    body: "Your registration is complete. Bring your reference to the registration desk, where your certificate is issued automatically once you are checked in.",
  },
  CONFIRMED: {
    tone: "is-paid",
    icon: "shield" as const,
    title: "Confirmed",
    body: "Everything is settled. The Secretariat will be in touch about the remaining arrangements.",
  },
  REJECTED: {
    tone: "is-rejected",
    icon: "search" as const,
    title: "The receipt could not be accepted",
    body: "The reason is below. Correct it and send the receipt again; your place is still held in the meantime.",
  },
  FAILED: {
    tone: "is-rejected",
    icon: "search" as const,
    title: "Card payment did not complete",
    body: "No charge was made. You can pay through Remita instead, using the steps below.",
  },
  CANCELLED: {
    tone: "is-rejected",
    icon: "search" as const,
    title: "This registration was cancelled",
    body: "Contact the Secretariat if that is not what you expected.",
  },
} as const;

export function PaymentPortal({
  initialReference = "",
  initialEmail = "",
}: {
  initialReference?: string;
  initialEmail?: string;
}) {
  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState(initialEmail);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);

  async function lookUp() {
    setError(null);
    setChecking(true);
    try {
      const res = await fetch("/api/payments/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not find that registration.");
      setStatus(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find that registration.");
      setStatus(null);
    } finally {
      setChecking(false);
    }
  }

  const state = status ? (STATE[status.status as keyof typeof STATE] ?? STATE.PENDING) : null;
  const canDeclare =
    status !== null && status.status !== "PAID" && status.status !== "CONFIRMED";
  const needsSteps =
    status !== null &&
    ["PENDING", "AWAITING_PAYMENT", "FAILED", "REJECTED"].includes(status.status);

  return (
    <>
      <div className="panel">
        <div className="tracker-row no-rule">
          <div className="field">
            <label htmlFor="payRef">Your reference</label>
            <input
              id="payRef"
              className="mono"
              type="text"
              placeholder="UARC26-REG-0000"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
            <span className="hint">
              On the email we sent when you registered. Sponsors and exhibitors can use their
              reference here too.
            </span>
          </div>
          <div className="field">
            <label htmlFor="payEmail">Email address you used</label>
            <input
              id="payEmail"
              type="email"
              placeholder="you@institution.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            className="btn solid"
            type="button"
            onClick={lookUp}
            disabled={checking || !reference.trim() || !email.trim()}
          >
            {checking ? "Checking..." : "Find my payment"}
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}
      </div>

      {status && state && (
        <>
          <div className={`payment-state ${state.tone}`}>
            <span className="payment-state-icon">
              <AcademicIcon name={state.icon} size={28} />
            </span>
            <div>
              <h2>{state.title}</h2>
              <p>{state.body}</p>

              <dl className="payment-facts">
                <div>
                  <dt>Reference</dt>
                  <dd className="mono">{status.reference}</dd>
                </div>
                <div>
                  <dt>For</dt>
                  <dd>{status.purpose}</dd>
                </div>
                <div>
                  <dt>Amount</dt>
                  <dd className="tnum">{formatAmount(status.amount, status.currency)}</dd>
                </div>
                {status.rrr && (
                  <div>
                    <dt>RRR received</dt>
                    <dd className="mono">{status.rrr}</dd>
                  </div>
                )}
                {status.declaredAt && (
                  <div>
                    <dt>Receipt sent</dt>
                    <dd>
                      {new Date(status.declaredAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </dd>
                  </div>
                )}
              </dl>

              {status.paymentNote && (
                <p className="payment-note">
                  <strong>From the Secretariat:</strong> {status.paymentNote}
                </p>
              )}
            </div>
          </div>

          {needsSteps && (
            <RemitaSteps
              amountLabel={formatAmount(status.amount, status.currency)}
              payerName={status.payerName}
              reference={status.reference}
              email={status.email}
              phone={status.phone}
              amount={status.amount}
            />
          )}

          {canDeclare && (
            <PaymentDeclaration
              reference={status.reference}
              email={status.email}
              amountLabel={formatAmount(status.amount, status.currency)}
              onDeclared={lookUp}
            />
          )}
        </>
      )}
    </>
  );
}
