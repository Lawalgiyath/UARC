"use client";

import { FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

interface ManuscriptUpload {
  url: string;
  publicId: string;
  fileName: string;
}

export function SubmitSection({
  abstractDeadlineIso,
  subthemeOptions,
}: {
  abstractDeadlineIso: string;
  subthemeOptions: string[];
}) {
  const searchParams = useSearchParams();
  const allowPreviewToggle = searchParams.get("preview") === "1";
  const [previewClosed, setPreviewClosed] = useState(false);

  const deadline = useMemo(() => new Date(abstractDeadlineIso), [abstractDeadlineIso]);
  const isClosed = previewClosed || new Date() > deadline;

  const [abstractText, setAbstractText] = useState("");
  const wordCount = abstractText.trim().length === 0 ? 0 : abstractText.trim().split(/\s+/).length;

  const [manuscript, setManuscript] = useState<ManuscriptUpload | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function handleFile(file: File) {
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
        body: JSON.stringify({ folder: "uarc/submissions" }),
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
      setManuscript({ url: uploaded.secure_url, publicId: uploaded.public_id, fileName: file.name });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);

    setSubmitting(true);
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: formData.get("authorName"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          institution: formData.get("institution"),
          track: formData.get("track"),
          format: formData.get("format"),
          title: formData.get("title"),
          abstractText,
          manuscriptUrl: manuscript?.url,
          manuscriptPublicId: manuscript?.publicId,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong, please try again.");
      setReference(json.reference);
      form.reset();
      setAbstractText("");
      setManuscript(null);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="submit">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">V. Submit an Abstract</div>
          <h2>Abstract submission portal</h2>
          <p>
            Replaces email and paper form submission. Manuscripts upload directly to secure storage, and
            every submission receives an emailed and texted reference code the moment it is received.
          </p>
        </div>

        <div className={`status-banner ${isClosed ? "is-closed" : "is-open"}`}>
          <div className="txt">
            <strong>{isClosed ? "Submissions are closed" : "Submissions are open"}</strong>
            <span>
              {isClosed
                ? "The window closed 24 August 2026 at 11:59 pm. Contact the Secretariat directly for exceptions."
                : "The window closes 24 August 2026 at 11:59 pm. Late submissions are not accepted."}
            </span>
          </div>
          {allowPreviewToggle && (
            <label className="preview-toggle">
              <input type="checkbox" checked={previewClosed} onChange={(e) => setPreviewClosed(e.target.checked)} />
              Secretariat preview: simulate after deadline
            </label>
          )}
        </div>

        {!reference && (
          <div className="panel">
            {submitError && <div className="form-error">{submitError}</div>}
            <form onSubmit={handleSubmit}>
              <fieldset disabled={isClosed || submitting} style={{ border: "none", padding: 0, margin: 0 }}>
                <div className="field-grid">
                  <div className="field">
                    <label htmlFor="authorName">Presenting author</label>
                    <input id="authorName" name="authorName" type="text" required />
                  </div>
                  <div className="field">
                    <label htmlFor="email">Email address</label>
                    <input id="email" name="email" type="email" required />
                  </div>
                  <div className="field">
                    <label htmlFor="phone">Phone number</label>
                    <input id="phone" name="phone" type="tel" required />
                    <span className="hint">Confirmation and status updates are sent here by SMS.</span>
                  </div>
                  <div className="field">
                    <label htmlFor="institution">Institution</label>
                    <input id="institution" name="institution" type="text" required />
                  </div>
                  <div className="field">
                    <label htmlFor="track">Subtheme track</label>
                    <select id="track" name="track" required defaultValue="">
                      <option value="" disabled>Select a track</option>
                      {subthemeOptions.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="format">Presentation preference</label>
                    <select id="format" name="format" defaultValue="Oral presentation">
                      <option>Oral presentation</option>
                      <option>Poster presentation</option>
                      <option>No preference</option>
                    </select>
                  </div>
                  <div className="field full">
                    <label htmlFor="title">Abstract title</label>
                    <input id="title" name="title" type="text" required />
                  </div>
                  <div className="field full">
                    <label htmlFor="abstractText">Abstract (300 to 500 words)</label>
                    <textarea
                      id="abstractText"
                      value={abstractText}
                      onChange={(e) => setAbstractText(e.target.value)}
                      required
                    />
                    <div className={`counter-row ${wordCount > 500 ? "over" : ""}`}>
                      {wordCount} words &middot; 500 max
                    </div>
                  </div>
                  <div className="field full">
                    <label>Full manuscript, optional at this stage</label>
                    <label className={`upload-zone ${uploading ? "dragging" : ""}`}>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                      />
                      <strong>
                        {uploading ? "Uploading..." : manuscript ? manuscript.fileName : "Click to choose a PDF or Word file"}
                      </strong>
                      Uploads stream directly to cloud storage, so nothing sits on the conference server. 10 MB limit.
                    </label>
                    {uploadError && <div className="form-error">{uploadError}</div>}
                  </div>
                </div>
                <button className="btn solid" type="submit" disabled={isClosed || submitting}>
                  {submitting ? "Submitting..." : "Submit Abstract"}
                </button>
              </fieldset>
            </form>
          </div>
        )}

        {reference && (
          <div className="confirm-panel">
            <p><strong>Submission received.</strong> Your reference code is:</p>
            <p className="ref">{reference}</p>
            <p style={{ marginTop: "0.75rem", color: "var(--text-muted)", fontSize: "0.9375rem" }}>
              A copy of this reference has been sent to your email and phone number. Use it below to track
              your status at any time, or quote it in correspondence with the Secretariat.
            </p>
          </div>
        )}

        <SubmissionTracker />
      </div>
    </section>
  );
}

function SubmissionTracker() {
  const [email, setEmail] = useState("");
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<{ title: string; track: string; status: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function check() {
    setError(null);
    setResult(null);
    setChecking(true);
    try {
      const res = await fetch(`/api/submissions/track?email=${encodeURIComponent(email)}&reference=${encodeURIComponent(ref)}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not find that submission.");
      setResult(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find that submission.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div>
      <div className="tracker-row">
        <div className="field">
          <label htmlFor="trackEmail">Track a submission &middot; email</label>
          <input id="trackEmail" type="email" placeholder="you@institution.edu" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="trackRef">Reference code</label>
          <input id="trackRef" type="text" placeholder="UARC26-0000" value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>
        <button className="btn ghost" type="button" onClick={check} disabled={checking || !email || !ref}>
          {checking ? "Checking..." : "Check Status"}
        </button>
      </div>
      {error && <div className="form-error" style={{ marginTop: "1rem" }}>{error}</div>}
      {result && (
        <div className="confirm-panel" style={{ marginTop: "1rem" }}>
          <p><strong>{result.title}</strong></p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginTop: "0.35rem" }}>{result.track}</p>
          <p style={{ marginTop: "0.5rem" }}>Status: <strong>{result.status}</strong></p>
        </div>
      )}
    </div>
  );
}
