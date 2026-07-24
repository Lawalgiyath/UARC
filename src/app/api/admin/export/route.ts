import { db } from "@/lib/db";

function toCsvValue(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((col) => toCsvValue(row[col])).join(","));
  return [header, ...lines].join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "registrations" ? "registrations" : "submissions";

  let csv: string;
  if (type === "registrations") {
    const rows = await db.registration.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(rows, ["reference", "fullName", "email", "phone", "institution", "category", "amount", "currency", "status", "createdAt"]);
  } else {
    const rows = await db.submission.findMany({ orderBy: { createdAt: "desc" } });
    csv = toCsv(rows, ["reference", "authorName", "email", "phone", "institution", "track", "format", "title", "status", "createdAt"]);
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="uarc-${type}.csv"`,
    },
  });
}
