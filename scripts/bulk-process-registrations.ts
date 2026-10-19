/**
 * bulk-process-registrations.ts
 *
 * Run on the server with:
 *   set -a && source /opt/uarc/shared.env && set +a
 *   cd /opt/uarc/app && npx tsx scripts/bulk-process-registrations.ts
 *
 * What it does:
 *  - Deduplicates by email (keeps the most recent registration per email address)
 *  1. Finds PENDING registrations WITH a receipt uploaded → marks them PAID + sends confirmation email.
 *  2. Finds PENDING registrations WITHOUT a receipt       → sends a reminder email with their reference number.
 */

import { PrismaClient, Registration } from "@prisma/client";
import * as nodemailer from "nodemailer";

const db = new PrismaClient();

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://conference.unilag.edu.ng";
const FROM_NAME = process.env.MAIL_FROM_NAME || "UNILAG Annual Research Conference";
const FROM_ADDR = process.env.MAIL_FROM_ADDRESS || "";
const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";

if (!FROM_ADDR || !SMTP_USER || !SMTP_PASS) {
  console.error("Missing SMTP environment variables. Source /opt/uarc/shared.env first.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: false,
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

async function sendMail(to: string, subject: string, text: string) {
  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_ADDR}>`,
    to,
    subject,
    text,
  });
}

/** Keep only the most recent registration per email address */
function deduplicateByEmail(registrations: Registration[]): Registration[] {
  const map = new Map<string, Registration>();
  for (const reg of registrations) {
    const existing = map.get(reg.email);
    if (!existing || reg.createdAt > existing.createdAt) {
      map.set(reg.email, reg);
    }
  }
  return Array.from(map.values());
}

async function main() {
  // ── 1. Verify: DECLARED status (receipt uploaded, awaiting admin approval) ──
  const pendingWithReceipt = await db.registration.findMany({
    where: { status: "DECLARED" },
    orderBy: { createdAt: "desc" },
  });

  const toVerify = deduplicateByEmail(pendingWithReceipt);

  console.log(`\nFound ${pendingWithReceipt.length} DECLARED registrations (${toVerify.length} unique emails to verify).`);

  for (const reg of toVerify) {
    await db.registration.update({ where: { id: reg.id }, data: { status: "PAID" } });
    console.log(`  ✔ Marked PAID: ${reg.reference} — ${reg.fullName} <${reg.email}>`);

    try {
      await sendMail(
        reg.email,
        `Registration confirmed — ${reg.reference}`,
        `Dear ${reg.fullName},

Your registration for the 19th UNILAG Annual Research Conference has been verified and confirmed.

  Reference:  ${reg.reference}
  Category:   ${reg.category}
  Amount paid: ${reg.currency} ${Number(reg.amount).toLocaleString()}

Please bring this reference number (or this email) to the registration desk at the Jelili Adebisi Omotola Hall on 20–22 October 2026.

We look forward to seeing you at the conference!

UNILAG Annual Research Conference Secretariat
${SITE_URL}`
      );
      console.log(`  ✉  Confirmation sent to ${reg.email}`);
    } catch (e) {
      console.error(`  ✗  Failed to send confirmation to ${reg.email}:`, e);
    }
  }

  // ── 2. Remind: PENDING with NO receipt ───────────────────────────────────
  const pendingNoReceipt = await db.registration.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });

  const toRemind = deduplicateByEmail(pendingNoReceipt);

  console.log(`\nFound ${pendingNoReceipt.length} PENDING without receipts (${toRemind.length} unique emails to remind).`);

  for (const reg of toRemind) {
    try {
      await sendMail(
        reg.email,
        `Action required: Complete your registration — ${reg.reference}`,
        `Dear ${reg.fullName},

Thank you for registering for the 19th UNILAG Annual Research Conference.

Your registration is not yet complete. To secure your place, please:

  1. Make your payment using your unique reference number:

         ${reg.reference}

  2. Visit the registration portal and upload your payment receipt:

         ${SITE_URL}/register

Your registration details:
  Reference:  ${reg.reference}
  Category:   ${reg.category}
  Amount due: ${reg.currency} ${Number(reg.amount).toLocaleString()}

If you have already paid, please return to the portal and upload your receipt so we can verify and confirm your registration.

For questions, reply to this email.

UNILAG Annual Research Conference Secretariat
${SITE_URL}`
      );
      console.log(`  ✉  Reminder sent to ${reg.email} (${reg.reference})`);
    } catch (e) {
      console.error(`  ✗  Failed to send to ${reg.email}:`, e);
    }
  }

  console.log("\n✅ Done.");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
