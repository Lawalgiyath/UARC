import { NextResponse } from "next/server";
import { signUploadParams, cloudinaryConfig } from "@/lib/cloudinary";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const folder = typeof body.folder === "string" && body.folder.startsWith("uarc/") ? body.folder : "uarc/submissions";

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signUploadParams({ folder, timestamp });
  const { cloudName, apiKey } = cloudinaryConfig();

  return NextResponse.json({ timestamp, signature, apiKey, cloudName, folder });
}
