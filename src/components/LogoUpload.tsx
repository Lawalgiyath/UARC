"use client";

import { useState } from "react";

// Logo upload for sponsors and exhibitors. Goes straight from the browser to
// Cloudinary using a signature this app mints, the same route the manuscript
// upload takes, so artwork never passes through the conference server.

export interface UploadedLogo {
  url: string;
  publicId: string;
  fileName: string;
}

const MAX_BYTES = 4 * 1024 * 1024;

export function LogoUpload({
  folder,
  value,
  onChange,
  label = "Organisation logo, optional",
}: {
  folder: "uarc/sponsors" | "uarc/exhibitors";
  value: UploadedLogo | null;
  onChange: (logo: UploadedLogo | null) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > MAX_BYTES) {
      setError("That file is larger than the 4 MB limit.");
      return;
    }

    setUploading(true);
    try {
      const signRes = await fetch("/api/uploads/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!signRes.ok) throw new Error("Could not prepare the upload.");
      const { timestamp, signature, apiKey, cloudName, folder: signedFolder } = await signRes.json();

      const form = new FormData();
      form.append("file", file);
      form.append("api_key", apiKey);
      form.append("timestamp", String(timestamp));
      form.append("signature", signature);
      form.append("folder", signedFolder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) throw new Error("Upload to cloud storage failed.");
      const uploaded = await uploadRes.json();

      onChange({ url: uploaded.secure_url, publicId: uploaded.public_id, fileName: file.name });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed, please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="field full">
      <label>{label}</label>
      <label className={`upload-zone ${uploading ? "dragging" : ""}`}>
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <strong>
          {uploading ? "Uploading..." : value ? value.fileName : "Click to choose a PNG, SVG or JPEG"}
        </strong>
        A transparent PNG or an SVG at least 600 pixels wide reproduces best on the sponsor wall and
        in print. 4 MB limit.
      </label>
      {value && (
        <button type="button" className="link-button" onClick={() => onChange(null)}>
          Remove {value.fileName}
        </button>
      )}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}
