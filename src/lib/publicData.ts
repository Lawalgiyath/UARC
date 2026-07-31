import { db } from "@/lib/db";

// Read-only queries behind the public pages.
//
// Each one follows the same rule as `settings.ts`: if there is no database
// configured yet, or the database is briefly unreachable, return an empty
// result and let the page render its "nothing here yet" state. A conference
// site that 500s because the sponsor table could not be read is worse than one
// that shows an empty sponsor wall for thirty seconds.

function databaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export interface PublicSponsor {
  id: string;
  organisation: string;
  tier: string;
  websiteUrl: string | null;
  logoUrl: string | null;
}

export async function getPublicSponsors(): Promise<PublicSponsor[]> {
  if (!databaseConfigured()) return [];
  try {
    return await db.sponsor.findMany({
      where: { displayOnSite: true, status: { in: ["PAID", "CONFIRMED"] } },
      select: { id: true, organisation: true, tier: true, websiteUrl: true, logoUrl: true },
      orderBy: { createdAt: "asc" },
    });
  } catch (err) {
    console.error("[publicData] could not read sponsors", err);
    return [];
  }
}

export interface PublicExhibitor {
  id: string;
  organisation: string;
  packageKey: string;
  standNumber: string | null;
  description: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
}

export async function getPublicExhibitors(): Promise<PublicExhibitor[]> {
  if (!databaseConfigured()) return [];
  try {
    return await db.exhibitor.findMany({
      where: { displayOnSite: true, status: { in: ["PAID", "CONFIRMED"] } },
      select: {
        id: true,
        organisation: true,
        packageKey: true,
        standNumber: true,
        description: true,
        websiteUrl: true,
        logoUrl: true,
      },
      orderBy: [{ standNumber: "asc" }, { createdAt: "asc" }],
    });
  } catch (err) {
    console.error("[publicData] could not read exhibitors", err);
    return [];
  }
}

export interface PublicDelegate {
  id: string;
  fullName: string;
  institution: string;
  country: string | null;
}

/**
 * The public list of registered delegates.
 *
 * Only delegates who both paid and ticked the consent box appear. No email
 * address, phone number, fee category or amount is selected, so nothing on
 * this list can be traced back to what someone paid or how to contact them
 * privately — a register of names and institutions, which is what a conference
 * programme has always printed, and nothing more.
 */
export async function getPublicDelegates(): Promise<PublicDelegate[]> {
  if (!databaseConfigured()) return [];
  try {
    return await db.registration.findMany({
      where: { listPublicly: true, status: "PAID" },
      select: { id: true, fullName: true, institution: true, country: true },
      orderBy: { fullName: "asc" },
    });
  } catch (err) {
    console.error("[publicData] could not read the delegate list", err);
    return [];
  }
}

export interface DelegateCounts {
  listed: number;
  total: number;
  institutions: number;
}

export async function getDelegateCounts(): Promise<DelegateCounts> {
  if (!databaseConfigured()) return { listed: 0, total: 0, institutions: 0 };
  try {
    const [listed, total, institutions] = await Promise.all([
      db.registration.count({ where: { listPublicly: true, status: "PAID" } }),
      db.registration.count({ where: { status: "PAID" } }),
      db.registration
        .findMany({ where: { status: "PAID" }, select: { institution: true }, distinct: ["institution"] })
        .then((rows) => rows.length),
    ]);
    return { listed, total, institutions };
  } catch (err) {
    console.error("[publicData] could not count delegates", err);
    return { listed: 0, total: 0, institutions: 0 };
  }
}

/** How many stands of each package remain, for the exhibition page. */
export async function getExhibitAvailability(): Promise<Record<string, number>> {
  if (!databaseConfigured()) return {};
  try {
    const rows = await db.exhibitor.groupBy({
      by: ["packageKey"],
      where: { status: { in: ["PENDING", "AWAITING_TRANSFER", "PAID", "CONFIRMED"] } },
      _count: { _all: true },
    });
    return Object.fromEntries(rows.map((row) => [row.packageKey, row._count._all]));
  } catch (err) {
    console.error("[publicData] could not read stand availability", err);
    return {};
  }
}
