import { PrismaClient } from "@prisma/client";
import { sendEmail } from "../src/lib/email";

const db = new PrismaClient();

async function main() {
  console.log("Looking for pending registrations without receipts...");

  const pendingRegistrations = await db.registration.findMany({
    where: {
      status: "PENDING",
      receiptUrl: null,
    },
  });

  if (pendingRegistrations.length === 0) {
    console.log("No pending registrations require a reminder.");
    return;
  }

  console.log(`Found ${pendingRegistrations.length} registrations to remind.`);

  for (const reg of pendingRegistrations) {
    console.log(`Sending reminder to ${reg.email} (${reg.reference})...`);
    
    const subject = `UNILAG ARC Payment Reminder: Please upload your receipt (${reg.reference})`;
    const text = `Dear ${reg.fullName},

We noticed that you have generated a payment reference (${reg.reference}) for the UNILAG Annual Research Conference, but we have not yet received your payment receipt.

If you have already made your payment, please return to the conference portal and upload your payment receipt to complete your registration.
If you have not paid yet, kindly do so using your reference number and upload the receipt.

Thank you,
The UNILAG ARC Secretariat`;

    try {
      await sendEmail({ to: reg.email, subject, text });
      console.log(`Sent reminder to ${reg.email}`);
    } catch (e) {
      console.error(`Failed to send reminder to ${reg.email}:`, e);
    }
  }

  console.log("Done sending reminders.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
