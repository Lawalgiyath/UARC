import { createHash } from "crypto";

/**
 * Signs a set of upload params the way Cloudinary expects: every param except
 * file, cloud_name, resource_type, api_key and signature itself, sorted
 * alphabetically as key=value pairs joined by &, with the API secret appended
 * directly (no separator) before taking the SHA-1 hex digest.
 */
export function signUploadParams(params: Record<string, string | number>): string {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) throw new Error("CLOUDINARY_API_SECRET is not set");

  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(toSign + apiSecret).digest("hex");
}

export function cloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  if (!cloudName || !apiKey) throw new Error("Cloudinary env vars are not set");
  return { cloudName, apiKey };
}

/**
 * Receipts are not public documents.
 *
 * A Cloudinary upload is world readable by default: anyone holding the URL can
 * open it, with no sign-in and no expiry. A conference receipt carries the
 * payer's name, their bank, the amount and the RRR, and the URL is stored in
 * our database and emailed to the Secretariat, so it travels. Leaving that on
 * an open URL is the sort of thing that becomes a reportable breach.
 *
 * Uploading them as `authenticated` makes Cloudinary refuse the plain URL and
 * serve the asset only when the request carries a signature that can be
 * produced by whoever holds the API secret, which is this server and nobody
 * else. The Secretariat still opens receipts in one click; the difference is
 * that a leaked link is no longer a leaked receipt.
 */
export const PRIVATE_FOLDERS = new Set(["uarc/receipts"]);

/**
 * Builds a signed delivery URL for an asset uploaded as `authenticated`.
 *
 * Cloudinary's scheme, established by uploading a file and comparing what it
 * handed back: SHA-1 over `<public_id>.<format><api_secret>`, base64url the
 * digest, keep the first eight characters, and place it in the path as
 * `s--XXXXXXXX--`. The extension is part of what is signed. Leaving it out
 * produces a signature Cloudinary rejects with a 401, which is exactly what
 * the first version of this function did.
 */
export function signedDeliveryUrl(input: {
  publicId: string;
  /** image, video or raw. PDFs and photographs are both `image`. */
  resourceType: string;
  /** png, jpg, pdf. Signed along with the id, so it cannot be guessed wrong. */
  format: string;
}): string {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) throw new Error("CLOUDINARY_API_SECRET is not set");
  const { cloudName } = cloudinaryConfig();

  const path = `${input.publicId}.${input.format}`;
  const signature = createHash("sha1")
    .update(path + apiSecret)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .slice(0, 8);

  return `https://res.cloudinary.com/${cloudName}/${input.resourceType}/authenticated/s--${signature}--/${path}`;
}

/**
 * Cloudinary returns an already-signed URL for an authenticated upload, and
 * that signature does not expire. Storing it would defeat the point: the
 * database row and the alert email would each carry a working link to a
 * stranger's receipt. This removes the signature, leaving a URL that records
 * where the file is and returns 401 to anybody who opens it.
 */
export function stripSignature(secureUrl: string): string {
  return secureUrl.replace(/\/s--[^/]+--\//, "/");
}

/**
 * Works out the resource type from a stored delivery URL, which is the only
 * place we record it. The shape is
 * `https://res.cloudinary.com/<cloud>/<resourceType>/<type>/...`.
 */
export function resourceTypeFromUrl(url: string): string {
  const match = /res\.cloudinary\.com\/[^/]+\/([^/]+)\//.exec(url);
  return match?.[1] ?? "image";
}

/** The file extension off the end of a stored delivery URL. */
export function formatFromUrl(url: string): string {
  const match = /\.([a-zA-Z0-9]{1,5})(?:\?|$)/.exec(url);
  return match?.[1] ?? "";
}
