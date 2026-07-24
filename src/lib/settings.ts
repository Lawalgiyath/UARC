import { db } from "@/lib/db";

const ABSTRACT_DEADLINE_KEY = "abstractDeadline";

export async function getAbstractDeadline(): Promise<Date> {
  const fallback = process.env.ABSTRACT_DEADLINE_FALLBACK ?? "2026-08-24T23:59:00+01:00";

  // No point asking Prisma to connect if there's nowhere to connect to yet
  // (local preview before DATABASE_URL is configured); this avoids a thrown
  // PrismaClientInitializationError surfacing in the Next.js dev overlay for
  // an expected, not exceptional, situation.
  if (!process.env.DATABASE_URL) return new Date(fallback);

  try {
    const row = await db.setting.findUnique({ where: { key: ABSTRACT_DEADLINE_KEY } });
    return new Date(row?.value ?? fallback);
  } catch (err) {
    // The public homepage shows a countdown even if the database is briefly
    // unreachable, rather than failing to render entirely.
    console.error("[settings] could not read abstractDeadline, using fallback", err);
    return new Date(fallback);
  }
}

export async function setAbstractDeadline(iso: string): Promise<void> {
  await db.setting.upsert({
    where: { key: ABSTRACT_DEADLINE_KEY },
    create: { key: ABSTRACT_DEADLINE_KEY, value: iso },
    update: { value: iso },
  });
}
