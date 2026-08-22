import "./load-env";

/**
 * Measures whether any page scrolls sideways, at the widths people actually use.
 *
 * Horizontal overflow is the failure that makes a site feel broken on a phone,
 * and it is invisible on a laptop: one element a few pixels too wide drags the
 * whole document with it. Rather than eyeballing pages, this loads each one at
 * each width and compares the document's scroll width against the viewport,
 * then names the widest element responsible so the fix is one rule, not a hunt.
 *
 *   npm run responsive-check                    (against localhost:3000)
 *   npm run responsive-check -- https://...     (against anything else)
 *
 * 360px is a common Android phone, 390px an iPhone, 768px a tablet portrait.
 */

import { chromium } from "playwright";

const WIDTHS = [320, 360, 390, 768, 1024];

const PAGES = [
  "/",
  "/about",
  "/register",
  "/register/payment",
  "/dates-and-fees",
  "/accommodation",
  "/sponsors",
  "/exhibit",
  "/submit",
  "/verify",
  "/delegates",
  "/committee",
  "/faq",
  "/contact",
  "/past-editions",
  "/certificates",
  "/privacy",
  "/admin/login",
];

async function main() {
  const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
  const browser = await chromium.launch();
  let failures = 0;

  console.log(`Checking ${PAGES.length} pages at ${WIDTHS.join(", ")}px on ${base}\n`);

  for (const width of WIDTHS) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      deviceScaleFactor: 2,
      isMobile: width < 700,
      hasTouch: width < 700,
    });
    const page = await context.newPage();
    const bad: string[] = [];

    for (const path of PAGES) {
      try {
        await page.goto(base + path, { waitUntil: "networkidle", timeout: 45000 });
      } catch {
        bad.push(`${path}  (did not load)`);
        continue;
      }

      const result = await page.evaluate(() => {
        const doc = document.documentElement;
        const over = doc.scrollWidth - doc.clientWidth;
        if (over <= 0) return null;

        // Name the widest offender, so the fix is obvious. An element is only
        // to blame if it reaches past the viewport itself; a wide child inside
        // something that scrolls on purpose is fine.
        let worst = { tag: "", right: 0 };
        for (const el of Array.from(document.querySelectorAll<HTMLElement>("body *"))) {
          const rect = el.getBoundingClientRect();
          if (rect.width === 0) continue;
          let scrollable = false;
          for (let p = el.parentElement; p; p = p.parentElement) {
            const overflowX = getComputedStyle(p).overflowX;
            if (overflowX === "auto" || overflowX === "scroll") { scrollable = true; break; }
          }
          if (scrollable) continue;
          if (rect.right > worst.right) {
            const id = el.id ? `#${el.id}` : "";
            const cls = el.className && typeof el.className === "string"
              ? "." + el.className.trim().split(/\s+/).slice(0, 2).join(".")
              : "";
            worst = { tag: `${el.tagName.toLowerCase()}${id}${cls}`, right: rect.right };
          }
        }
        return { over, worst };
      });

      if (result) {
        bad.push(`${path}  overflows by ${result.over}px  ->  ${result.worst.tag} reaches ${Math.round(result.worst.right)}px`);
      }
    }

    if (bad.length === 0) {
      console.log(`  ${String(width).padStart(4)}px   all ${PAGES.length} pages fit`);
    } else {
      failures += bad.length;
      console.log(`  ${String(width).padStart(4)}px   ${bad.length} problem(s):`);
      for (const line of bad) console.log(`           ${line}`);
    }
    await context.close();
  }

  await browser.close();
  console.log(failures === 0 ? "\nNo horizontal overflow anywhere." : `\n${failures} problem(s) to fix.`);
  if (failures > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
