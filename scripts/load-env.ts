/**
 * Puts .env into process.env for the command line scripts.
 *
 * Next.js does this for the app, but a script run through tsx gets nothing,
 * which is why `npm run test-email` reported no mail route configured while
 * the site itself sent mail perfectly well. There is no dotenv in this project
 * and it does not need one: the file is a few lines of key=value.
 *
 * The one subtlety is the backslash. Next reads .env through dotenv-expand,
 * which treats `$NAME` as a variable to substitute, so a bcrypt hash written
 * plainly gets eaten at the first `$12`. The file escapes those as `\$`, and
 * this has to undo the escape the same way, or a script would see a different
 * value from the one the running site sees.
 *
 * Import it for its side effect, before anything that reads process.env:
 *
 *     import "./load-env";
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";

function load(file: string): void {
  let raw: string;
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return; // No .env is a legitimate state, e.g. on a deployed server.
  }

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;

    const key = trimmed.slice(0, eq).trim();
    // A real value already in the environment wins, so a variable set on the
    // command line can override the file for one run.
    if (process.env[key] !== undefined) continue;

    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value.replace(/\\\$/g, "$");
  }
}

load(join(process.cwd(), ".env"));
