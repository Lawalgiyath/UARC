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
 * Cloudinary's scheme: SHA-1 the path to be signed with the API secret
 * appended, base64url the digest, keep the first eight characters, and put it
 * in the URL as `s--XXXXXXXX--`.
 */
export function signedDeliveryUrl(input: {
  publicId: string;
  /** image, video or raw. PDFs and photographs are both `image`. */
  resourceType: string;
}): string {
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!apiSecret) throw new Error("CLOUDINARY_API_SECRET is not set");
  const { cloudName } = cloudinaryConfig();

  const signature = createHash("sha1")
    .update(input.publicId + apiSecret)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .slice(0, 8);

  return `https://res.cloudinary.com/${cloudName}/${input.resourceType}/authenticated/s--${signature}--/${input.publicId}`;
}

/**
 * Works out the resource type from the URL Cloudinary returned at upload time,
 * which is the only place we record it. The shape is
 * `https://res.cloudinary.com/<cloud>/<resourceType>/<type>/...`.
 */
export function resourceTypeFromUrl(url: string): string {
  const match = /res\.cloudinary\.com\/[^/]+\/([^/]+)\//.exec(url);
  return match?.[1] ?? "image";
}
