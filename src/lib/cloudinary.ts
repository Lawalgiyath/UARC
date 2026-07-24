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
