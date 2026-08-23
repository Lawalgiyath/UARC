import "./load-env";

/**
 * Checks the accessibility basics on every page.
 *
 * This is not only good manners. The Discrimination Against Persons with
 * Disabilities (Prohibition) Act 2018 obliges public institutions in Nigeria
 * to make their services usable by disabled people, and a university
 * conference site is exactly that. The failures below are also the ones that
 * make a site unusable with a screen reader or a keyboard, which for a
 * research conference means a delegate who cannot register at all.
 *
 *   npm run a11y-check                    (against localhost:3000)
 *   npm run a11y-check -- https://...
 *
 * It checks what can be checked mechanically and honestly. Colour contrast and
 * reading order need a person; these do not.
 */

import { chromium } from "playwright";

const PAGES = [
  "/", "/about", "/register", "/register/payment", "/dates-and-fees",
  "/accommodation", "/sponsors", "/exhibit", "/submit", "/verify",
  "/delegates", "/committee", "/faq", "/contact", "/past-editions",
  "/certificates", "/privacy", "/terms", "/admin/login",
];

async function main() {
  const base = (process.argv[2] || "http://localhost:3000").replace(/\/$/, "");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } } as never);

  // tsx compiles this file with esbuild, which rewrites every function it can
  // name into a __name(fn, "label") call for better stack traces. That helper
  // exists in Node and not in the page, so anything evaluated in the browser
  // dies on the first function it declares. Defining it as a passthrough in
  // the page is the smallest fix and keeps the checks readable.
  await page.addInitScript("globalThis.__name = globalThis.__name || ((fn) => fn);");
  let total = 0;

  console.log(`Accessibility check on ${PAGES.length} pages, ${base}\n`);

  for (const path of PAGES) {
    try {
      // Not networkidle: the dev server holds an HMR socket open, so the
      // network never goes idle and every page after the first few times out.
      await page.goto(base + path, { waitUntil: "domcontentloaded", timeout: 45000 });
      await page.waitForTimeout(400);
    } catch {
      console.log(`  ${path}  did not load`);
      total++;
      continue;
    }

    const found = await page.evaluate(() => {
      const problems: string[] = [];
      // Deliberately not a helper function: tsx compiles named functions with
      // an esbuild __name shim that does not exist inside the page, so this is
      // written inline everywhere it is needed.
      const describe = (el: Element): string =>
        el.tagName.toLowerCase() +
        (el.id ? "#" + el.id : "") +
        (typeof el.className === "string" && el.className
          ? "." + el.className.trim().split(/\s+/)[0]
          : "");

      // A screen reader needs the document language to pick a voice.
      const lang = document.documentElement.getAttribute("lang");
      if (!lang) problems.push("<html> has no lang attribute");

      // An image with no alt is invisible to a screen reader; alt="" is a
      // deliberate "this is decorative" and is correct, so it passes.
      for (const img of Array.from(document.images)) {
        if (img.getAttribute("alt") === null) problems.push(`image with no alt: ${img.src.slice(-60)}`);
      }

      // Every control a person must fill in needs a name they can hear.
      for (const el of Array.from(document.querySelectorAll("input, select, textarea"))) {
        const input = el as HTMLInputElement;
        if (input.type === "hidden") continue;
        const hasLabel =
          (input.id && document.querySelector(`label[for="${CSS.escape(input.id)}"]`)) ||
          input.closest("label") ||
          input.getAttribute("aria-label") ||
          input.getAttribute("aria-labelledby") ||
          input.getAttribute("title");
        if (!hasLabel) problems.push(`form control with no label: ${describe(input)}`);
      }

      // A button announced as "button" tells the user nothing.
      for (const el of Array.from(document.querySelectorAll("button, a"))) {
        const text = (el.textContent ?? "").trim();
        const named = text || el.getAttribute("aria-label") || el.getAttribute("title");
        if (!named) {
          // An icon-only control is fine if it is hidden from the tree.
          if (el.getAttribute("aria-hidden") === "true") continue;
          problems.push(`${el.tagName.toLowerCase()} with no accessible name: ${describe(el)}`);
        }
      }

      // Two elements sharing an id breaks every label-for and aria reference.
      const seen = new Set<string>();
      for (const el of Array.from(document.querySelectorAll("[id]"))) {
        if (seen.has(el.id)) problems.push(`duplicate id: ${el.id}`);
        seen.add(el.id);
      }

      // Exactly one h1 per page, and headings that do not skip levels: this is
      // how a screen reader user navigates a long page.
      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
      const h1s = headings.filter((h) => h.tagName === "H1").length;
      if (h1s === 0) problems.push("no h1 on the page");
      if (h1s > 1) problems.push(`${h1s} h1 elements, expected one`);
      let prev = 0;
      for (const h of headings) {
        const level = Number(h.tagName[1]);
        if (prev && level > prev + 1) {
          problems.push(`heading jumps h${prev} to h${level}: "${(h.textContent ?? "").trim().slice(0, 40)}"`);
        }
        prev = level;
      }

      return problems;
    });

    if (found.length === 0) {
      console.log(`  ok    ${path}`);
    } else {
      total += found.length;
      console.log(`  ${String(found.length).padStart(2)}    ${path}`);
      for (const f of found) console.log(`        ${f}`);
    }
  }

  await browser.close();
  console.log(total === 0 ? "\nNo mechanical accessibility failures." : `\n${total} finding(s).`);
  if (total > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
