import { db } from "@/lib/db";

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  // Excel and Sheets treat a leading =, +, - or @ as a formula. Prefixing an
  // apostrophe keeps an exported field that starts with one from being
  // executed when the Secretariat opens the file.
  const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
  if (/[",\n]/.test(safe)) return `"${safe.replace(/"/g, '""')}"`;
  return safe;
}

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((col) => toCsvValue(row[col])).join(","));
  return [header, ...lines].join("\n");
}

const EXPORTS = {
  submissions: {
    columns: [
      "reference",
      "authorName",
      "email",
      "phone",
      "institution",
      "track",
      "format",
      "title",
      "status",
      "createdAt",
    ],
    load: () => db.submission.findMany({ orderBy: { createdAt: "desc" } }),
  },
  registrations: {
    columns: [
      "reference",
      "fullName",
      "email",
      "phone",
      "institution",
      "country",
      "category",
      "amount",
      "currency",
      "status",
      "verification",
      "studentIdNumber",
      "studentInstitutionEmail",
      "attended",
      "listPublicly",
      "createdAt",
    ],
    load: () => db.registration.findMany({ orderBy: { createdAt: "desc" } }),
  },
  sponsors: {
    columns: [
      "reference",
      "organisation",
      "contactName",
      "email",
      "phone",
      "tier",
      "amount",
      "currency",
      "status",
      "displayOnSite",
      "websiteUrl",
      "createdAt",
    ],
    load: () => db.sponsor.findMany({ orderBy: { createdAt: "desc" } }),
  },
  exhibitors: {
    columns: [
      "reference",
      "organisation",
      "contactName",
      "email",
      "phone",
      "packageKey",
      "amount",
      "currency",
      "status",
      "standNumber",
      "displayOnSite",
      "createdAt",
    ],
    load: () => db.exhibitor.findMany({ orderBy: { createdAt: "desc" } }),
  },
  certificates: {
    columns: [
      "code",
      "kind",
      "recipientName",
      "institution",
      "paperTitle",
      "track",
      "issuedAt",
      "revokedAt",
      "revokedReason",
    ],
    load: () => db.certificate.findMany({ orderBy: { issuedAt: "desc" } }),
  },
} as const;

type ExportType = keyof typeof EXPORTS;

function isExportType(value: string | null): value is ExportType {
  return value !== null && value in EXPORTS;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requested = searchParams.get("type");
  const type: ExportType = isExportType(requested) ? requested : "submissions";

  const { columns, load } = EXPORTS[type];
  const rows = (await load()) as unknown as Record<string, unknown>[];
  const csv = toCsv(rows, [...columns]);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="uarc-${type}.csv"`,
    },
  });
}
