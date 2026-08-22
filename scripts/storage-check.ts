import "./load-env";

/**
 * Proves receipts upload privately and can still be read back by us.
 *
 * This is the check that could not be run when the private-receipt change was
 * written, because there were no Cloudinary credentials. What it has to
 * establish is not that an upload succeeds, but that the plain URL is refused
 * to the public while the signed one works for the Secretariat. Getting that
 * backwards means every receipt is readable by anyone holding a link.
 *
 *   npm run storage-check
 *
 * It uploads a small placeholder to uarc/receipts, tests it both ways, and
 * deletes it again.
 */

import { createHash } from "node:crypto";
import {
  signUploadParams,
  cloudinaryConfig,
  signedDeliveryUrl,
  resourceTypeFromUrl,
  formatFromUrl,
  stripSignature,
} from "../src/lib/cloudinary";

// A 1x1 PNG, so nothing real is uploaded.
const PIXEL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function main() {
  const { cloudName, apiKey } = cloudinaryConfig();
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  console.log(`Cloudinary storage check on "${cloudName}"\n`);

  const folder = "uarc/receipts";
  const timestamp = Math.floor(Date.now() / 1000);
  const type = "authenticated";
  const signature = signUploadParams({ folder, timestamp, type });

  const form = new FormData();
  form.append("file", PIXEL);
  form.append("api_key", apiKey);
  form.append("timestamp", String(timestamp));
  form.append("signature", signature);
  form.append("folder", folder);
  form.append("type", type);

  console.log("1. Uploading a placeholder receipt as `authenticated`...");
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: form,
  });
  const json = (await res.json()) as Record<string, string>;
  if (!res.ok) throw new Error(`upload rejected: ${JSON.stringify(json)}`);

  const publicId = json.public_id;
  console.log(`   public_id:    ${publicId}`);
  console.log(`   type:         ${json.type}`);
  console.log(`   secure_url:   ${json.secure_url}\n`);

  if (json.type !== "authenticated") {
    throw new Error(`FAIL: uploaded as "${json.type}", so this receipt would be public.`);
  }

  try {
    // What actually gets stored: Cloudinary's URL with the signature removed.
    // This is the string that ends up in the database and in emails, so this
    // is the one a stranger might come across.
    const stored = stripSignature(json.secure_url);
    console.log("2. Fetching the URL we store, the way a stranger would...");
    console.log(`   ${stored}`);
    const plain = await fetch(stored, { redirect: "manual" });
    console.log(`   HTTP ${plain.status}`);
    if (plain.ok) {
      throw new Error("FAIL: the receipt opened without a signature. It is public.");
    }
    console.log("   Refused, which is the point.");

    console.log("3. Signing it the way the dashboard does...");
    const signed = signedDeliveryUrl({
      publicId,
      resourceType: resourceTypeFromUrl(stored),
      format: formatFromUrl(stored),
    });
    console.log(`   ${signed}`);
    const ok = await fetch(signed);
    console.log(`   HTTP ${ok.status}`);
    if (!ok.ok) {
      throw new Error("FAIL: the Secretariat cannot open receipts. Check the signature scheme.");
    }
    console.log("   Opened.");

    console.log("PASS: receipts are private to everyone but a signed-in Secretariat.");
  } finally {
    // Tidy up whatever happened above.
    const ts = Math.floor(Date.now() / 1000);
    const toSign = `public_id=${publicId}&timestamp=${ts}&type=authenticated`;
    const sig = createHash("sha1").update(toSign + apiSecret).digest("hex");
    const del = new FormData();
    del.append("public_id", publicId);
    del.append("timestamp", String(ts));
    del.append("type", "authenticated");
    del.append("api_key", apiKey);
    del.append("signature", sig);
    const gone = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: "POST",
      body: del,
    });
    console.log(`\ncleanup: ${JSON.stringify(await gone.json())}`);
  }
}

main().catch((err) => {
  console.error("\n" + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
