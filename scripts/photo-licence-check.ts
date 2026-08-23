import "./load-env";

/**
 * Checks every campus photograph against Wikimedia Commons.
 *
 * The site states, in the footer and under each image, that these are CC BY-SA
 * 4.0 and names an author. Both halves are legally load-bearing: a share-alike
 * licence is only satisfied if the attribution is right and the licence named
 * is the licence granted. Getting either wrong is infringement, and a claim in
 * the footer that does not match Commons is worse than no claim, because it
 * looks deliberate.
 *
 *   npm run photo-licences
 *
 * It asks Commons for the licence and author it actually holds for each file
 * and reports any that disagree with what we publish, plus any that no longer
 * resolve.
 */

import { CAMPUS_PHOTOS } from "../src/lib/media";

const API = "https://commons.wikimedia.org/w/api.php";

/**
 * Wikimedia asks automated clients to identify themselves and rate limits
 * those that do not. Without this the thumbnail checks come back 429 and look
 * like broken images rather than a badly behaved script.
 */
const UA = "UARC2026-licence-check/1.0 (https://uarc-2026.vercel.app; conference site compliance)";
const pause = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Commons returns author as HTML; the licence line wants a plain name. */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .trim();
}

function fileNameFromSourceUrl(url: string): string | null {
  const m = /\/wiki\/File:(.+)$/.exec(url);
  return m ? decodeURIComponent(m[1]) : null;
}

interface Claim {
  key: string;
  credit: string;
  sourceUrl: string;
  src: string;
}

async function main() {
  const claims: Claim[] = [];
  for (const [key, p] of Object.entries(CAMPUS_PHOTOS)) {
    claims.push({ key, credit: p.credit, sourceUrl: p.sourceUrl, src: p.src });
  }
  // The past editions page reuses these same photographs, so checking
  // CAMPUS_PHOTOS covers every image on the site.

  console.log(`Checking ${claims.length} photograph(s) against Wikimedia Commons\n`);
  let problems = 0;

  for (const claim of claims) {
    await pause(400); // Courtesy to Commons, and it keeps us under their limit.
    const file = fileNameFromSourceUrl(claim.sourceUrl);
    if (!file) {
      console.log(`  BAD SOURCE URL  ${claim.key}: ${claim.sourceUrl}`);
      problems++;
      continue;
    }

    const url =
      `${API}?action=query&format=json&origin=*&prop=imageinfo&iiprop=extmetadata` +
      `&titles=${encodeURIComponent("File:" + file)}`;

    let info: Record<string, { value?: string }> | undefined;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(25_000),
      });
      const json = (await res.json()) as {
        query?: { pages?: Record<string, { imageinfo?: { extmetadata?: Record<string, { value?: string }> }[]; missing?: string }> };
      };
      const page = Object.values(json.query?.pages ?? {})[0];
      if (!page || "missing" in page) {
        console.log(`  MISSING ON COMMONS  ${claim.key}: ${file}`);
        problems++;
        continue;
      }
      info = page.imageinfo?.[0]?.extmetadata;
    } catch (err) {
      console.log(`  COULD NOT CHECK  ${claim.key}: ${(err as Error).message}`);
      problems++;
      continue;
    }

    const licence = stripHtml(info?.LicenseShortName?.value ?? "");
    const author = stripHtml(info?.Artist?.value ?? "");
    const restrictions = stripHtml(info?.Restrictions?.value ?? "");

    const licenceOk = /CC BY-SA 4\.0/i.test(licence);
    // The rendered credit needs to identify the author; Commons often wraps
    // the name in a user-page link, so a containment test is the fair one.
    const authorOk =
      author.toLowerCase().includes(claim.credit.toLowerCase()) ||
      claim.credit.toLowerCase().includes(author.toLowerCase());

    // Hotlinking only works if Commons still serves the thumbnail.
    let served = 0;
    try {
      served = (
        await fetch(claim.src, {
          method: "HEAD",
          headers: { "User-Agent": UA },
          signal: AbortSignal.timeout(20_000),
        })
      ).status;
    } catch {
      served = 0;
    }

    const flags: string[] = [];
    if (!licenceOk) flags.push(`licence is "${licence}", we publish "CC BY-SA 4.0"`);
    if (!authorOk) flags.push(`author is "${author}", we credit "${claim.credit}"`);
    if (restrictions) flags.push(`restrictions: ${restrictions}`);
    if (served !== 200) flags.push(`thumbnail returns ${served || "no response"}`);

    if (flags.length) {
      problems++;
      console.log(`  PROBLEM  ${claim.key}`);
      for (const f of flags) console.log(`           ${f}`);
    } else {
      console.log(`  ok       ${claim.key.padEnd(22)} ${licence}, ${author}`);
    }
  }

  console.log(
    problems === 0
      ? "\nEvery photograph is CC BY-SA 4.0, credited to the right author, and still served."
      : `\n${problems} problem(s). Each is a licence claim the site makes that Commons does not support.`
  );
  if (problems > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
