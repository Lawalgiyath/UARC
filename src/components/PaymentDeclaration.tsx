"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { REMITA, normaliseRrr } from "@/lib/remita";

// "I have paid" — the step that replaces the Google Form.
//
// Two things go in: the RRR from the payment slip, and a photograph of the
// receipt. The RRR is checked for shape before the request leaves the browser,
// because a delegate standing outside a bank should be told about a mistyped
// digit immediately, not after an upload.

interface UploadedReceipt {
  url: string;
  publicId: string;
  fileName: string;
}

const MAX_BYTES = 8 * 1024 * 1024;

export function PaymentDeclaration({
  reference,
  email,
  amountLabel,
  onDeclared,
}: {
  reference: string;
  email: string;
  amountLabel?: string;
  onDeclared?: () => void;
}) {
  const [rrr, setRrr] = useState("");
  const [receipt, setReceipt] = useState<UploadedReceipt | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const rrrLooksValid = normaliseRrr(rrr) !== null;
  const rrrTyped = rrr.replace(/\D/g, "").length > 0;

  async function handleFile(file: File) {
    setUploadError(null);
    if (file.size > MAX_BYTES) {
      setUploadError("That file is larger than the 8 MB limit. A photograph of the receipt is fine.");
      return;
    }
    setUploading(true);
    try {
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "uarc/receipts" }),
      });
      if (!signRes.ok) throw new Error("Could not prepare the upload.");
      const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Upload to cloud storage failed.");
      const uploaded = await uploadRes.json();
      setReceipt({ url: uploaded.secure_url, publicId: uploaded.public_id, fileName: file.name });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!receipt) {
      setError("Please attach the receipt before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/declare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          email,
          rrr,
          receiptUrl: receipt.url,
          receiptPublicId: receipt.publicId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not submit your payment details.");
      setDone(true);
      onDeclared?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your payment details.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="confirm-panel">
        <p>
          <strong>Payment received for checking.</strong>
        </p>
        <p className="ref">{reference}</p>
        <p className="confirm-note">
          The Secretariat checks the receipt against the conference account, normally within{" "}
          {REMITA.verificationDays} working days, and confirms by email and SMS. Nothing further is
          needed from you.
        </p>
        <p className="confirm-note">
          Keep the original receipt until you collect your delegate pack. You can check progress at
          any time on the <Link href="/register/payment">payment status page</Link>.
        </p>
      </div>
    );
  }

  return (
    <form className="declare-form" onSubmit={handleSubmit}>
      <div className="declare-head">
        <span className="declare-icon">
          <AcademicIcon name="upload" size={24} />
        </span>
        <div>
          <div className="eyebrow">Step 3 of 3</div>
          <h3>Confirm your payment</h3>
          <p>
            Once the bank has taken the money, enter the RRR from your slip and attach the receipt.
            {amountLabel ? ` We are expecting ${amountLabel}.` : ""}
          </p>
        </div>
      </div>

      <fieldset disabled={submitting} className="bare-fieldset">
        <div className="field">
          <label htmlFor="rrr">Remita Retrieval Reference (RRR)</label>
          <input
            id="rrr"
            className="mono"
            inputMode="numeric"
            placeholder="1234-5678-9012"
            value={rrr}
            maxLength={24}
            onChange={(e) => setRrr(e.target.value)}
            required
          />
          <span className={`hint ${rrrTyped && !rrrLooksValid ? "is-warning" : ""}`}>
            {rrrTyped && !rrrLooksValid
              ? "That is not 12 digits yet. Check the number printed on your slip."
              : "The 12 digit number on your payment slip. Dashes and spaces are fine."}
          </span>
        </div>

        <div className="field">
          <label>Receipt</label>
          <label className={`upload-zone ${uploading ? "dragging" : ""}`}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/heic,application/pdf"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <strong>
              {uploading
                ? "Uploading..."
                : receipt
                  ? receipt.fileName
                  : "Click to attach the bank or Remita receipt"}
            </strong>
            A clear photograph taken on your phone is fine, as long as the RRR and the amount are
            readable. PDF, JPEG, PNG or HEIC, up to 8 MB.
          </label>
          {uploadError && <div className="form-error">{uploadError}</div>}
        </div>

        {error && <div className="form-error">{error}</div>}

        <button
          className="btn solid"
          type="submit"
          disabled={submitting || uploading || !rrrLooksValid || !receipt}
        >
          {submitting ? "Submitting..." : "Submit payment for checking"}
        </button>
      </fieldset>
    </form>
  );
}
