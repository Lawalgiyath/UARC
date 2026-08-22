import { NextResponse } from "next/server";
import { signUploadParams, cloudinaryConfig, PRIVATE_FOLDERS } from "@/lib/cloudinary";
import { guardPublicWrite } from "@/lib/security";

// Hands out a short lived signature so a browser can upload straight to
// Cloudinary. Because a signature is a credential, this route is same-origin
// only and rate limited: without that, the endpoint is an open invitation to
// fill the university's storage account.

const ALLOWED_FOLDERS = new Set([
  "uarc/submissions",
  "uarc/sponsors",
  "uarc/exhibitors",
  "uarc/receipts",
]);

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "upload");
  if (blocked) return blocked;

  const body = await request.json().catch(() => ({}));
  const requested = typeof body.folder === "string" ? body.folder : "";
  const folder = ALLOWED_FOLDERS.has(requested) ? requested : "uarc/submissions";

  const timestamp = Math.floor(Date.now() / 1000);
  // Receipts go up as `authenticated`, so Cloudinary will not serve them from
  // a plain URL. The browser has to send the same value it was signed with, or
  // Cloudinary rejects the upload, which is why it is returned here too.
  const type = PRIVATE_FOLDERS.has(folder) ? "authenticated" : "upload";
  const signature = signUploadParams(
    type === "authenticated" ? { folder, timestamp, type } : { folder, timestamp }
  );
  const { cloudName, apiKey } = cloudinaryConfig();

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder, type });
}
