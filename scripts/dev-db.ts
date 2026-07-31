/**
 * Local development database.
 *
 * Runs a real PostgreSQL server as an ordinary child process, using binaries
 * that ship with the `embedded-postgres` package. No Docker, no VM, no
 * service to install, and no cloud account: the same Postgres the site runs
 * in production, including the enums the schema depends on.
 *
 *   npm run db:start     start it, and keep it running
 *   npm run db:stop      stop it
 *
 * The cluster's files live in `.pgdata/`, which is gitignored, so the data
 * survives restarts. Delete that folder to start from nothing.
 *
 * Port 5433 rather than the default 5432, so this never collides with a
 * Postgres someone already has installed.
 */

import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const DATA_DIR = resolve(process.cwd(), ".pgdata");

const pg = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: "uarc",
  password: "uarc_local_dev",
  port: 5433,
  persistent: true,
});

async function start() {
  // `initialise` creates the cluster the first time and is a no-op once the
  // data directory exists, so this script is safe to run repeatedly.
  await pg.initialise();
  await pg.start();

  try {
    await pg.createDatabase("uarc");
    console.log("Created the 'uarc' database.");
  } catch {
    // Already there, which is the normal case after the first run.
  }

  console.log("");
  console.log("Postgres is running on localhost:5433.");
  console.log('DATABASE_URL="postgresql://uarc:uarc_local_dev@localhost:5433/uarc?schema=public"');
  console.log("");
  console.log("Leave this process running. Press Ctrl+C to stop the database.");

  const shutdown = async () => {
    console.log("\nStopping Postgres...");
    await pg.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Hold the process open; the server dies with it.
  await new Promise(() => {});
}

async function stop() {
  await pg.stop();
  console.log("Postgres stopped.");
}

async function destroy() {
  try {
    await pg.stop();
  } catch {
    // Not running, which is fine, we only care that the files go.
  }
  await rm(DATA_DIR, { recursive: true, force: true });
  console.log("Postgres stopped and its data directory deleted.");
}

const action = process.argv[2] ?? "start";

const actions: Record<string, () => Promise<void>> = { start, stop, destroy };
const run = actions[action];

if (!run) {
  console.error(`Unknown action '${action}'. Use start, stop or destroy.`);
  process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
