import { PrismaClient } from "@prisma/client";
import * as fs from "fs";

const db = new PrismaClient();

async function main() {
  console.log("Querying database for registrations with payment claims...");
  
  // People who claim they paid: they either have an uploaded receipt,
  // or their status is already PAID.
  const claims = await db.registration.findMany({
    where: {
      OR: [
        { receiptUrl: { not: null } },
        { status: "PAID" }
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  const headers = ["Reference", "Full Name", "Email", "Phone", "Institution", "Category", "Amount", "Currency", "Status", "Receipt URL"];
  const rows = claims.map(c => [
    c.reference,
    `"${c.fullName.replace(/"/g, '""')}"`,
    c.email,
    c.phone,
    `"${c.institution.replace(/"/g, '""')}"`,
    c.category,
    c.amount,
    c.currency,
    c.status,
    c.receiptUrl || "N/A"
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const outputPath = "C:\\Users\\hp\\.gemini\\antigravity-ide\\brain\\7366ae6e-636a-4eeb-97f9-3a2109603823\\payment-claims.csv";
  fs.writeFileSync(outputPath, csvContent, "utf8");
  console.log(`Successfully exported ${claims.length} records to ${outputPath}`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
