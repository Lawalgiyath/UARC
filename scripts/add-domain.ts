import "./load-env";

/**
 * Attaches conference.unilag.edu.ng to the Vercel project and reports exactly
 * what DNS records the university needs to add.
 *
 *   npm run add-domain                 (shows current state)
 *   npm run add-domain -- add          (attaches the domain)
 *
 * Adding the domain here changes nothing a visitor can see. It tells Vercel to
 * answer for that hostname and to get a certificate ready for it; until the
 * university points DNS at Vercel, the domain carries on resolving wherever it
 * resolves today. That order matters. Attach first and repoint second, and the
 * switch happens with a certificate already waiting, rather than every early
 * visitor meeting a browser warning while one is issued.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

const PROJECT_ID = "prj_OYxNtqXtm61lWUpJyQAVB4KiGB7d";
const TEAM_ID = "team_FrTbSfNKWDMrPl7hyZWxYJIU";
const DOMAIN = "conference.unilag.edu.ng";
const API = "https://api.vercel.com";

function token(): string {
  const candidates = [
    join(process.env.APPDATA ?? "", "xdg.data", "com.vercel.cli", "auth.json"),
    join(process.env.LOCALAPPDATA ?? "", "com.vercel.cli", "auth.json"),
    join(process.env.HOME ?? "", ".local", "share", "com.vercel.cli", "auth.json"),
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

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: AUTH,
    signal: AbortSignal.timeout(60_000),
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, json: json as Record<string, unknown> };
}

async function main() {
  if (process.argv[2] === "add") {
    console.log(`Attaching ${DOMAIN} to the project...`);
    const added = await api(`/v10/projects/${PROJECT_ID}/domains?${qs}`, {
      method: "POST",
      body: JSON.stringify({ name: DOMAIN }),
    });
    if (added.ok) {
      console.log("  Attached.\n");
    } else {
      const err = added.json.error as { code?: string; message?: string } | undefined;
      // Already attached is the state we want, not a failure.
      if (err?.code === "domain_already_in_use" || added.status === 409) {
        console.log("  Already attached.\n");
      } else {
        throw new Error(err?.message ?? `HTTP ${added.status}`);
      }
    }
  }

  const status = await api(`/v9/projects/${PROJECT_ID}/domains/${DOMAIN}?${qs}`);
  if (!status.ok) {
    console.log(`${DOMAIN} is not attached to the project yet.`);
    console.log("Run:  npm run add-domain -- add");
    return;
  }

  const verified = status.json.verified === true;
  const config = await api(`/v6/domains/${DOMAIN}/config?${qs}`);
  const misconfigured = config.json.misconfigured === true;

  console.log(`  domain:               ${DOMAIN}`);
  console.log(`  ownership verified:   ${verified}`);
  console.log(`  DNS points at Vercel: ${!misconfigured}\n`);

  // What Vercel wants proving, if anything. This record goes on the apex zone,
  // not on the subdomain, which is the part that trips people up.
  const challenges = (status.json.verification ?? []) as {
    type: string;
    domain: string;
    value: string;
  }[];
  if (!verified && challenges.length) {
    console.log("RECORD 1, proves the university controls the domain:\n");
    for (const c of challenges) {
      console.log(`    Type:   ${c.type.toUpperCase()}`);
      console.log(`    Name:   ${c.domain}`);
      console.log(`    Value:  ${c.value}`);
      console.log("    TTL:    300\n");
    }
  }

  if (misconfigured) {
    // Read the targets off Vercel rather than hardcoding them: it issues
    // project-specific hostnames now, and while the old generic one still
    // works it is not what Vercel would choose today.
    const cnames = (config.json.recommendedCNAME ?? []) as { rank: number; value: string }[];
    const ipv4 = (config.json.recommendedIPv4 ?? []) as { rank: number; value: string[] }[];
    const bestCname = [...cnames].sort((a, b) => a.rank - b.rank)[0]?.value;
    const bestIps = [...ipv4].sort((a, b) => a.rank - b.rank)[0]?.value ?? [];
    const current = (config.json.aValues ?? []) as string[];

    console.log("RECORD 2, sends visitors to the site.");
    if (current.length) console.log(`Replaces the existing record pointing at ${current.join(", ")}.\n`);

    console.log(`    Type:   CNAME`);
    console.log(`    Name:   conference          (conference.unilag.edu.ng)`);
    console.log(`    Value:  ${bestCname ?? "cname.vercel-dns.com."}`);
    console.log("    TTL:    300\n");

    if (bestIps.length) {
      console.log("If their DNS will not hold a CNAME on that name, A records instead:\n");
      for (const ip of bestIps) {
        console.log(`    A       conference          ${ip}          TTL 300`);
      }
      console.log("");
    }

    console.log("Note the existing zone TTL is about 10 hours, so resolvers that");
    console.log("already cached the old address may take that long to follow the");
    console.log("change. Lowering the TTL a day beforehand makes the cutover quick.");
  } else {
    console.log("DNS points at Vercel. The site is live on the domain.");
  }
}

main().catch((err) => {
  console.error("Failed: " + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
