/**
 * Inspect or clear the rate limit buckets.
 *
 * Useful during development and on the day: if the Secretariat locks itself
 * out of /admin by mistyping the password five times, this clears the counter
 * without waiting fifteen minutes.
 *
 *   npm run rate-limit           show every live bucket
 *   npm run rate-limit -- --clear  clear them all
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  if (process.argv.includes("--clear")) {
    const { count } = await db.rateLimit.deleteMany({});
    console.log(`Cleared ${count} rate limit bucket(s).`);
    return;
  }

  const rows = await db.rateLimit.findMany({ orderBy: { resetAt: "asc" } });
  if (rows.length === 0) {
    console.log("No active rate limit buckets.");
    return;
  }

  console.log("key".padEnd(44), "count".padEnd(7), "resets");
  for (const row of rows) {
    console.log(row.key.padEnd(44), String(row.count).padEnd(7), row.resetAt.toISOString());
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
