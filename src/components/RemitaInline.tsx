"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { REMITA_INLINE_SCRIPT } from "@/lib/remita";

// Paying without leaving the site.
//
// Three things happen here, in the order a payer meets them:
//
//   1. We ask our server for a Remita Retrieval Reference. It comes back from
//      Remita against the university's collection, and we put it on screen.
//      That number alone replaces the whole portal walkthrough: it is what the
//      portal existed to produce.
//   2. Card, transfer and USSD go through Remita's own modal, opened over this
//      page. Card details are typed into Remita's iframe, never into our DOM,
//      so nothing sensitive passes through this site.
//   3. Whatever the modal says, we ask our server to ask Remita. The browser's
//      word is a claim; Remita's is the fact, and only the server-side answer
//      settles a payment.
//
// If any of that is unavailable, this renders nothing at all and the portal
// steps underneath carry the payment, exactly as they do today.

interface RemitaEngine {
  showPaymentWidget: () => void;
}

declare global {
  interface Window {
    RmPaymentEngine?: {
      init: (options: Record<string, unknown>) => RemitaEngine;
    };
  }
}

/** Loads Remita's bundle once, however many times this component mounts. */
let scriptPromise: Promise<void> | null = null;

function loadRemitaScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.RmPaymentEngine) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = REMITA_INLINE_SCRIPT;
    el.async = true;
    el.onload = () =>
      window.RmPaymentEngine ? resolve() : reject(new Error("Remita loaded but exposed nothing."));
    el.onerror = () => {
      // Let a later attempt try again rather than caching the failure.
      scriptPromise = null;
      reject(new Error("Remita's payment window could not be loaded."));
    };
    document.body.appendChild(el);
  });
  return scriptPromise;
}

interface Issued {
  rrr: string;
  merchantId: string;
  amount: number;
  payerName: string;
  email: string;
  purpose: string;
}

export function RemitaInline({
  reference,
  email,
  amountLabel,
  onPaid,
  onAvailability,
}: {
  reference: string;
  email: string;
  amountLabel: string;
  /** Called once the server has confirmed with Remita, never on the modal's word. */
  onPaid: () => void;
  /**
   * Tells the parent whether paying here is possible, so it can demote the
   * portal walkthrough to a fallback instead of leading with it.
   */
  onAvailability?: (ok: boolean) => void;
}) {
  const [issued, setIssued] = useState<Issued | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Ask for the reference as soon as the payer arrives. It is generated once
  // and reused afterwards, so revisiting this page shows the same number.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/payments/rrr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference, email }),
        });
        const json = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          // 503 with a PORTAL fallback is the ordinary state while the
          // university's credentials are outstanding: step aside quietly.
          setAvailable(false);
          onAvailability?.(false);
          if (res.status !== 503 && res.status !== 409) {
            setError(json.error ?? null);
          }
          return;
        }
        setIssued(json as Issued);
        setAvailable(true);
        onAvailability?.(true);
      } catch {
        if (!cancelled) {
          setAvailable(false);
          onAvailability?.(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // onAvailability is a setter from the parent and is deliberately not a
    // dependency: including it would re-request a reference on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference, email]);

  /** Asks our server to ask Remita. The only thing that settles a payment. */
  const confirm = useCallback(
    async (quiet: boolean) => {
      if (!quiet) setChecking(true);
      setError(null);
      try {
        const res = await fetch("/api/payments/remita-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference, email }),
        });
        const json = await res.json();
        if (!mounted.current) return false;

        if (res.ok && json.paid) {
          onPaid();
          return true;
        }
        if (!quiet) {
          setNote(
            json.message
              ? `Remita has not recorded this payment yet. It said: ${json.message}`
              : "Remita has not recorded this payment yet. A bank payment can take a few minutes to show."
          );
        }
        return false;
      } catch {
        if (!quiet) setError("Could not reach Remita just now. Try again in a moment.");
        return false;
      } finally {
        if (mounted.current && !quiet) setChecking(false);
      }
    },
    [reference, email, onPaid]
  );

  async function payByCard() {
    if (!issued) return;
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      await loadRemitaScript();
      const engine = window.RmPaymentEngine?.init({
        key: issued.merchantId,
        // Pay an existing reference rather than opening a new charge, which is
        // what keeps the money attached to the RRR the university reconciles.
        processRrr: true,
        transactionId: reference,
        extendedData: { customFields: [{ name: "rrr", value: issued.rrr }] },
        narration: issued.purpose,
        onSuccess: () => void confirm(false),
        // Remita reports errors and closes for reasons that are not always
        // failures, so both go and ask the server rather than guessing.
        onError: () => void confirm(true),
        onClose: () => void confirm(true),
      });
      engine?.showPaymentWidget();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Remita's payment window could not be opened.");
    } finally {
      if (mounted.current) setBusy(false);
    }
  }

  async function copyRrr() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.rrr);
      setCopied(true);
      window.setTimeout(() => mounted.current && setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  }

  // Nothing to offer, or not yet known: the portal steps below stand alone.
  if (available !== true || !issued) return null;

  return (
    <div className="remita-inline">
      <div className="remita-inline-head">
        <span className="remita-inline-icon">
          <AcademicIcon name="shield" size={26} />
        </span>
        <div>
          <div className="eyebrow">Pay here</div>
          <h3>Your payment reference is ready</h3>
          <p>
            This is your Remita Retrieval Reference, issued against the University of Lagos
            conference account. Pay it by card below, or quote it at any commercial bank.
          </p>
        </div>
      </div>

      <div className="rrr-plate">
        <span className="rrr-label">RRR</span>
        <span className="rrr-value mono">{issued.rrr}</span>
        <button type="button" onClick={copyRrr} aria-label="Copy your RRR">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="remita-inline-actions">
        <button className="btn solid" type="button" onClick={payByCard} disabled={busy}>
          {busy ? "Opening..." : `Pay ${amountLabel} by card`}
        </button>
        <button className="btn" type="button" onClick={() => void confirm(false)} disabled={checking}>
          {checking ? "Checking with Remita..." : "I paid at the bank, check now"}
        </button>
      </div>

      <p className="remita-inline-note">
        Card, transfer and USSD all open in Remita&rsquo;s own secure window over this page. Your
        card details are typed into Remita, never into this site. Once Remita confirms the money,
        your registration is settled automatically, with no receipt to upload and nothing to wait
        for.
      </p>

      {note && <p className="remita-inline-pending">{note}</p>}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
