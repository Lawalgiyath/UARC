"use client";

import { FormEvent, useState } from "react";
import { FEE_SCHEDULE, type FeeCategory } from "@/lib/pricing";

const CATEGORY_ORDER: FeeCategory[] = [
  "REGULAR",
  "STUDENT_REGULAR",
  "INTERNATIONAL",
];

function formatAmount(amount: number, currency: string) {
  return currency === "USD" ? `$${amount}` : `₦${amount.toLocaleString("en-NG")}`;
}

interface ReceiptUpload {
  url: string;
  publicId: string;
  fileName: string;
}

export function RegisterSection() {
  const [category, setCategory] = useState<FeeCategory>("REGULAR");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fee = FEE_SCHEDULE[category];
  
  const [reference, setReference] = useState<string | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [receiptUploaded, setReceiptUploaded] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptUpload | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);
    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.get("fullName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          institution: formData.get("institution"),
          category,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not generate reference.");
      setReference(json.reference);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start payment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFile(file: File) {
    if (!reference) return;
    setUploadError(null);
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File is larger than the 10 MB limit.");
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
      
      const receiptData = { url: uploaded.secure_url, publicId: uploaded.public_id, fileName: file.name };
      setReceipt(receiptData);

      // Now save the receipt to the backend
      const saveRes = await fetch("/api/registrations/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference,
          receiptUrl: receiptData.url,
          receiptPublicId: receiptData.publicId,
        }),
      });
      if (!saveRes.ok) throw new Error("Could not save the receipt to your registration.");

      setReceiptUploaded(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section id="register">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">VI. Register &amp; Pay</div>
          <h2>Registration and payment</h2>
          <p>
            Select a category to generate a payment reference. Please proceed to the University of Lagos
            payment platform to pay using this reference, then return here to upload your receipt for verification.
          </p>
        </div>

        {!reference && (
          <div className="panel">
            {error && <div className="form-error">{error}</div>}
            <form onSubmit={handleSubmit}>
              <fieldset disabled={submitting} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="fullName">Full name</label>
                    <input id="fullName" name="fullName" type="text" required />
                  </div>
                  <div className="field">
                    <label htmlFor="regEmail">Email address</label>
                    <input id="regEmail" name="email" type="email" required />
                  </div>
                  <div className="field">
                    <label htmlFor="regPhone">Phone number</label>
                    <input id="regPhone" name="phone" type="tel" required />
                  </div>
                  <div className="field">
                    <label htmlFor="regInst">Institution or organisation</label>
                    <input id="regInst" name="institution" type="text" required />
                  </div>
                  <div className="field full">
                    <label htmlFor="category">Category</label>
                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as FeeCategory)}
                    >
                      {CATEGORY_ORDER.map((key) => (
                        <option key={key} value={key}>
                          {FEE_SCHEDULE[key].label}, {formatAmount(FEE_SCHEDULE[key].amount, FEE_SCHEDULE[key].currency)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="price-out">
                  <span>Amount due</span>
                  <span className="amt tnum">{formatAmount(fee.amount, fee.currency)}</span>
                </div>

                <button className="btn solid" type="submit" disabled={submitting}>
                  {submitting ? "Generating reference..." : "Generate Payment Reference"}
                </button>
              </fieldset>
            </form>
          </div>
        )}

        {reference && !receiptUploaded && (
          <div className="confirm-panel">
            <p><strong>Registration saved.</strong> Your unique payment reference is:</p>
            <p className="ref">{reference}</p>
            <p style={{ marginTop: "0.75rem", marginBottom: "1.5rem", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              Please use this reference number when making your payment at the Unilag payment platform. 
              Once your payment is successful, upload your receipt below to complete your registration.
            </p>
            
            <div className="field full">
              <label>Upload Payment Receipt (PDF or Image)</label>
              <label className={`upload-zone ${uploading ? "dragging" : ""}`}>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                <strong>
                  {uploading ? "Uploading..." : receipt ? receipt.fileName : "Click to choose a file"}
                </strong>
                Supported formats: PDF, JPEG, PNG. Max size: 10MB.
              </label>
              {uploadError && <div className="form-error" style={{ marginTop: "0.5rem" }}>{uploadError}</div>}
            </div>
          </div>
        )}
        
        {reference && receiptUploaded && (
          <div className="confirm-panel">
            <p><strong>Receipt uploaded successfully.</strong></p>
            <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              Thank you for your payment. We have received your receipt for reference <strong>{reference}</strong> and it is currently pending verification. You will receive an email confirmation once it is approved.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

