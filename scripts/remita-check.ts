/**
 * Proves the Remita integration works, using Remita's public demo merchant.
 *
 * The university's own credentials are not out yet, so what can be tested
 * today is everything except whose account the money lands in: the hash
 * construction, the Authorization header, the shape of Remita's replies, how
 * it answers a status query, and what it does with a repeated order. Those are
 * the parts that go wrong.
 *
 *   npm run remita-check
 *
 * The credentials below are Remita's own sandbox values, published in their
 * integration samples. They point at demo.remita.net and move no real money.
 * Nothing here writes to our database.
 */

process.env.REMITA_MERCHANT_ID ||= "2547916";
process.env.REMITA_SERVICE_TYPE_ID ||= "4430731";
process.env.REMITA_API_KEY ||= "1946";
process.env.REMITA_ENV = "demo";

async function main() {
  const { generateRrr, checkRrrStatus, remitaApiConfigured, DUPLICATE_ORDER } = await import(
    "../src/lib/remitaApi"
  );

  console.log("Remita integration check (sandbox)\n");
  console.log(`  configured: ${remitaApiConfigured()}`);

  // A fresh order id each run, so we exercise generation rather than reuse.
  const orderId = `UARCCHECK${Date.now()}`;
  console.log(`  orderId:    ${orderId}\n`);

  const payer = {
    amount: 40000,
    payerName: "Giyath Lawal",
    payerEmail: "lawalgiyath200716@gmail.com",
    payerPhone: "08030001111",
    description: "Full delegate registration (UARC26-REG-TEST)",
  };

  console.log("1. Asking Remita for an RRR...");
  const issued = await generateRrr({ orderId, ...payer });
  console.log(`   RRR:      ${issued.rrr}`);
  console.log(`   code:     ${issued.statusCode}`);
  console.log(`   message:  ${issued.message}\n`);

  console.log("2. Asking Remita whether it has been paid...");
  const status = await checkRrrStatus(issued.rrr);
  console.log(`   paid:     ${status.paid}`);
  console.log(`   code:     ${status.statusCode}`);
  console.log(`   message:  ${status.message}`);
  console.log(`   amount:   ${status.amount ?? "-"}\n`);

  // A brand new reference must read as unpaid. If this ever said "paid", the
  // success codes would be wrong and registrations would settle themselves.
  if (status.paid) {
    console.error("FAIL: a reference nobody has paid came back as paid.");
    process.exitCode = 1;
    return;
  }

  console.log("3. Asking again with the same orderId (Remita must refuse)...");
  try {
    await generateRrr({ orderId, ...payer });
    console.error("FAIL: Remita accepted a repeated order, so one payment could raise two demands.");
    process.exitCode = 1;
    return;
  } catch (err) {
    const name = (err as Error).name;
    console.log(`   refused:  ${name}\n`);
    if (name !== DUPLICATE_ORDER) {
      console.error(`FAIL: expected ${DUPLICATE_ORDER}, got ${name}.`);
      process.exitCode = 1;
      return;
    }
  }

  console.log("All three passed. Hashing, headers, reply parsing and status all work.");
  console.log("Swap in the university's merchant id, service type id and API key to go live.");
}

main().catch((err) => {
  console.error("\nFailed: " + (err instanceof Error ? err.message : String(err)));
  process.exit(1);
});
