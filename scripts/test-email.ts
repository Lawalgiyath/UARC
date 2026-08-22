/**
 * Proves the mail route works, without walking a whole registration.
 *
 *   npm run test-email -- you@example.com
 *
 * Checks the credentials first, then sends one real message. If nothing is
 * configured it says exactly what is missing rather than failing quietly.
 */

import "./load-env";
import { sendEmail, verifyEmailTransport } from "../src/lib/email";
import { CONFERENCE, CONTACT } from "../src/lib/conference";

const to = process.argv[2];

if (!to) {
  console.error('Usage: npm run test-email -- "you@example.com"');
  process.exit(1);
}

async function main() {
  console.log("Checking the mail route...");
  const status = await verifyEmailTransport();
  console.log("  " + status + "\n");

  console.log(`Sending a test message to ${to} ...`);
  await sendEmail({
    to: to!,
    subject: `Test message from the ${CONFERENCE.edition} ${CONFERENCE.shortName} site`,
    text: `This is a test.

If you are reading this in your inbox, the conference site can send email: registration confirmations, abstract acknowledgements, payment receipts and certificate links will all reach delegates.

Sent from the ${CONFERENCE.edition} ${CONFERENCE.name} site.
Secretariat: ${CONTACT.email}, ${CONTACT.phones[0].display}`,
  });

  console.log("\nDone. Check the inbox, and the spam folder if it is not there.");
}

main().catch((err) => {
  console.error("\nFailed: " + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
