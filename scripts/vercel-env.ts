/**
 * Set Vercel environment variables reliably.
 *
 * `vercel env add` reads its value from an interactive prompt. On Windows it
 * does not accept a piped or redirected value: it stores an empty string and
 * still reports success, which is how six variables silently ended up blank.
 * This talks to the REST API instead, and reads back what it wrote.
 *
 *   npm run vercel-env -- set NAME value [production|preview|development]
 *   npm run vercel-env -- list [target]
 *
 * It reuses the token the Vercel CLI already stored when you ran `vercel
 * login`, so there is nothing extra to authenticate.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ID = "prj_OYxNtqXtm61lWUpJyQAVB4KiGB7d";
const TEAM_ID = "team_FrTbSfNKWDMrPl7hyZWxYJIU";
const API = "https://api.vercel.com";

function token(): string {
  const candidates = [
    join(process.env.APPDATA ?? "", "xdg.data", "com.vercel.cli", "auth.json"),
    join(process.env.LOCALAPPDATA ?? "", "com.vercel.cli", "auth.json"),
    join(process.env.HOME ?? "", ".local", "share", "com.vercel.cli", "auth.json"),
    join(process.env.HOME ?? "", "Library", "Application Support", "com.vercel.cli", "auth.json"),
  ];
  for (const path of candidates) {
    try {
      const t = JSON.parse(readFileSync(path, "utf8")).token;
      if (t) return t as string;
    } catch {
      // Try the next location.
    }
  }
  throw new Error("Could not find the Vercel CLI token. Run `vercel login` first.");
}

const AUTH = { Authorization: `Bearer ${token()}`, "Content-Type": "application/json" };
const qs = `teamId=${TEAM_ID}`;

async function list(target: string) {
  const res = await fetch(`${API}/v9/projects/${PROJECT_ID}/env?${qs}&decrypt=true`, {
    headers: AUTH,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);

  const rows = (json.envs ?? []).filter((e: { target: string[] }) => e.target.includes(target));
  console.log(`\n${rows.length} variable(s) on ${target}:\n`);
  for (const e of rows) {
    const v: string = e.value ?? "";
    const shown = v.length === 0 ? "(EMPTY)" : v.length > 24 ? v.slice(0, 12) + "..." : v;
    console.log(`  ${e.key.padEnd(30)} ${String(v.length).padStart(4)} chars   ${shown}`);
  }
  console.log("");
}

async function set(key: string, value: string, target: string) {
  // Remove any existing entry for this target first; the API rejects a
  // duplicate key rather than replacing it.
  const existing = await fetch(`${API}/v9/projects/${PROJECT_ID}/env?${qs}`, { headers: AUTH }).then(
    (r) => r.json()
  );
  for (const e of existing.envs ?? []) {
    if (e.key === key && e.target.includes(target)) {
      await fetch(`${API}/v9/projects/${PROJECT_ID}/env/${e.id}?${qs}`, {
        method: "DELETE",
        headers: AUTH,
      });
    }
  }

  const res = await fetch(`${API}/v10/projects/${PROJECT_ID}/env?${qs}`, {
    method: "POST",
    headers: AUTH,
    body: JSON.stringify({ key, value, type: "encrypted", target: [target] }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? `HTTP ${res.status}`);

  // The API stores encrypted values, so reading one back over the API returns
  // ciphertext, not the plaintext to compare against. Confirmation is done in
  // bulk afterwards with `npm run vercel-env -- verify`, which goes through
  // `vercel env pull` and therefore decrypts.
  console.log(`  ${key} written to ${target} (${value.length} chars sent)`);
}

/**
 * Pulls the environment through the Vercel CLI, which decrypts, and reports
 * any variable that arrived empty. An empty value is the exact failure mode
 * that prompted this script.
 */
async function verify(target: string) {
  const { execFileSync } = await import("node:child_process");
  const { mkdtempSync, readFileSync, rmSync } = await import("node:fs");
  const { tmpdir } = await import("node:os");

  const dir = mkdtempSync(join(tmpdir(), "venv-"));
  const file = join(dir, ".env.check");
  try {
    try {
      execFileSync("vercel", ["env", "pull", `"${file}"`, `--environment=${target}`, "--yes"], {
        stdio: ["ignore", "ignore", "pipe"],
        shell: true,
      });
    } catch (err) {
      const stderr = (err as { stderr?: Buffer }).stderr?.toString() ?? "";
      throw new Error(`vercel env pull failed.\n${stderr.trim()}`);
    }
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    const ours = lines.filter(
      (l) => l && !l.startsWith("#") && !l.startsWith("VERCEL") && !l.startsWith("TURBO") && !l.startsWith("NX_")
    );
    let empty = 0;
    console.log(`
Decrypted values on ${target}:
`);
    for (const line of ours) {
      const key = line.slice(0, line.indexOf("="));
      const raw = line.slice(line.indexOf("=") + 1).replace(/^"|"$/g, "");
      if (raw.length === 0) empty++;
      console.log(`  ${raw.length === 0 ? "EMPTY " : "ok    "} ${key.padEnd(30)} ${String(raw.length).padStart(4)} chars`);
    }
    console.log("");
    if (empty > 0) {
      console.error(`${empty} variable(s) are empty and need setting.`);
      process.exitCode = 1;
    } else {
      console.log("All set.");
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);

  if (cmd === "list") {
    await list(rest[0] ?? "production");
    return;
  }
  if (cmd === "verify") {
    await verify(rest[0] ?? "production");
    return;
  }
  if (cmd === "set") {
    const [key, value, target = "production"] = rest;
    if (!key || value === undefined) {
      console.error('Usage: npm run vercel-env -- set NAME "value" [target]');
      process.exit(1);
    }
    await set(key, value, target);
    return;
  }

  console.error("Usage: npm run vercel-env -- (set NAME value [target] | list [target])");
  process.exit(1);
}

main().catch((err) => {
  console.error("Failed: " + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
