"use client";

import { useState } from "react";
import Link from "next/link";
import { AcademicIcon } from "@/components/icons/AcademicIcons";

interface HeldCertificate {
  code: string;
  label: string;
  recipientName: string;
  paperTitle: string | null;
  issuedAt: string;
  url: string;
}

/** "Where is my certificate?" — email address plus the reference already held. */
export function CertificateLookup() {
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<HeldCertificate[] | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function check() {
    setError(null);
    setResults(null);
    setMessage(null);
    setChecking(true);
    try {
      const res = await fetch("/api/certificates/mine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reference }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not look that up.");
      setResults(json.certificates);
      setMessage(json.message ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not look that up.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="panel">
      <div className="tracker-row no-rule">
        <div className="field">
          <label htmlFor="certEmail">Email address you registered with</label>
          <input
            id="certEmail"
            type="email"
            placeholder="you@institution.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="certRef">Registration or submission reference</label>
          <input
            id="certRef"
            type="text"
            placeholder="UARC26-REG-0000"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
        <button
          className="btn solid"
          type="button"
          onClick={check}
          disabled={checking || !email || !reference}
        >
          {checking ? "Checking..." : "Find my certificates"}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {results && results.length > 0 && (
        <ul className="certificate-results">
          {results.map((certificate) => (
            <li key={certificate.code}>
              <span className="certificate-seal">
                <AcademicIcon name="seal" size={26} />
              </span>
              <div>
                <h3>{certificate.label}</h3>
                <p className="certificate-holder">{certificate.recipientName}</p>
                {certificate.paperTitle && (
                  <p className="certificate-paper">&ldquo;{certificate.paperTitle}&rdquo;</p>
                )}
                <p className="certificate-code mono">{certificate.code}</p>
              </div>
              <Link className="btn ghost small" href={certificate.url}>
                Open and print
              </Link>
            </li>
          ))}
        </ul>
      )}

      {results && results.length === 0 && message && (
        <div className="notice-panel">
          <AcademicIcon name="scroll" size={22} />
          <p>{message}</p>
        </div>
      )}
    </div>
  );
}
