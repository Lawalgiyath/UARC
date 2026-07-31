import { NextResponse } from "next/server";
import { signUploadParams, cloudinaryConfig } from "@/lib/cloudinary";
import { guardPublicWrite } from "@/lib/security";

// Hands out a short lived signature so a browser can upload straight to
// Cloudinary. Because a signature is a credential, this route is same-origin
// only and rate limited: without that, the endpoint is an open invitation to
// fill the university's storage account.

const ALLOWED_FOLDERS = new Set(["uarc/submissions", "uarc/sponsors", "uarc/exhibitors"]);

export async function POST(request: Request) {
  const blocked = await guardPublicWrite(request, "upload");
  if (blocked) return blocked;

  const body = await request.json().catch(() => ({}));
  const requested = typeof body.folder === "string" ? body.folder : "";
  const folder = ALLOWED_FOLDERS.has(requested) ? requested : "uarc/submissions";

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUploadParams({ folder, timestamp });
  const { cloudName, apiKey } = cloudinaryConfig();

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder });
}
