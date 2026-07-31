"use client";

import { useState } from "react";
import { AcademicIcon } from "@/components/icons/AcademicIcons";

interface VerifyResult {
  found: boolean;
  valid?: boolean;
  code?: string;
  label?: string;
  statement?: string;
  recipientName?: string;
  institution?: string | null;
  paperTitle?: string | null;
  track?: string | null;
  issuedAt?: string;
  revokedReason?: string | null;
  error?: string;
}

/**
 * Public check on a certificate code, for anyone holding a certificate they
 * did not issue: a promotion panel, a funder, an employer.
 */
export function CertificateVerifier({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    setError(null);
    setResult(null);
    setChecking(true);
    try {
      const res = await fetch(`/api/certificates/verify?code=${encodeURIComponent(code)}`);
      const json: VerifyResult = await res.json();
      if (!res.ok) {
        if (res.status === 404) {
          setResult({ found: false });
          return;
        }
        throw new Error(json.error || "Could not check that code.");
      }
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check that code.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="panel">
      <div className="tracker-row no-rule">
        <div className="field">
          <label htmlFor="verifyCode">Certificate code</label>
          <input
            id="verifyCode"
            type="text"
            placeholder="XXXX-XXXX-XXXX"
            value={code}
            spellCheck={false}
            autoCapitalize="characters"
            className="mono"
            onChange={(e) => setCode(e.target.value)}
          />
          <span className="hint">Printed at the foot of the certificate. Dashes are optional.</span>
        </div>
        <button className="btn solid" type="button" onClick={verify} disabled={checking || !code.trim()}>
          {checking ? "Checking..." : "Verify"}
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {result && !result.found && (
        <div className="verify-result is-invalid">
          <AcademicIcon name="search" size={26} />
          <div>
            <h3>No certificate carries that code</h3>
            <p>
              Check for a mistyped character, then contact the Secretariat if the certificate looks
              genuine. Codes never contain the letters I, L, O or U.
            </p>
          </div>
        </div>
      )}

      {result?.found && (
        <div className={`verify-result ${result.valid ? "is-valid" : "is-revoked"}`}>
          <AcademicIcon name={result.valid ? "shield" : "search"} size={26} />
          <div>
            <h3>{result.valid ? "Genuine certificate" : "This certificate has been revoked"}</h3>
            <dl className="verify-fields">
              <div>
                <dt>Issued to</dt>
                <dd>{result.recipientName}</dd>
              </div>
              {result.institution && (
                <div>
                  <dt>Institution</dt>
                  <dd>{result.institution}</dd>
                </div>
              )}
              <div>
                <dt>Certificate</dt>
                <dd>{result.label}</dd>
              </div>
              {result.paperTitle && (
                <div>
                  <dt>Paper</dt>
                  <dd>&ldquo;{result.paperTitle}&rdquo;</dd>
                </div>
              )}
              {result.track && (
                <div>
                  <dt>Track</dt>
                  <dd>{result.track}</dd>
                </div>
              )}
              <div>
                <dt>Issued</dt>
                <dd>
                  {result.issuedAt
                    ? new Date(result.issuedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : ""}
                </dd>
              </div>
              <div>
                <dt>Code</dt>
                <dd className="mono">{result.code}</dd>
              </div>
            </dl>
            {!result.valid && result.revokedReason && (
              <p className="verify-revoked-reason">Reason given: {result.revokedReason}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
