/**
 * Demo data for local development.
 *
 * ============================ READ THIS BEFORE LAUNCH ============================
 * Every organisation, delegate and abstract below is INVENTED, so that the
 * sponsor wall, the delegate list, the exhibitor directory and the Secretariat
 * dashboard have something to show while the site is being reviewed.
 *
 * None of it is real. Run `npm run db:seed -- --clear` to wipe it, and make
 * sure that has been done before the site is pointed at a public domain.
 * ================================================================================
 *
 *   npm run db:seed              insert the demo data
 *   npm run db:seed -- --clear   delete it again
 */

import "./load-env";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const DEMO_MARKER = "DEMO";

async function clear() {
  // Certificates first: they reference registrations and submissions.
  await db.certificate.deleteMany({});
  await db.registration.deleteMany({});
  await db.submission.deleteMany({});
  await db.sponsor.deleteMany({});
  await db.exhibitor.deleteMany({});
  await db.rateLimit.deleteMany({});
  console.log("Cleared all submissions, registrations, sponsors, exhibitors and certificates.");
}

async function seed() {
  await clear();

  const submissions = await Promise.all(
    [
      {
        reference: "UARC26-1001",
        authorName: "Dr Adaeze Nwachukwu",
        email: "a.nwachukwu@unilag.edu.ng",
        phone: "+2348030000001",
        institution: "University of Lagos",
        track: "II. Biotechnology and Genomic Innovations for Food and Health Security",
        format: "Oral presentation",
        title: "Drought-tolerant cassava cultivars for the Nigerian south-west: a three-season field trial",
        abstractText:
          "Background. Cassava yields across the south-west have fallen with shortening rainy seasons. Methods. Four cultivars were trialled across three seasons at two sites. Results. Two cultivars held yield within eight per cent of baseline under a simulated late-onset season. Conclusion. Cultivar selection alone recovers a meaningful share of losses attributed to rainfall variability.",
        status: "ACCEPTED" as const,
      },
      {
        reference: "UARC26-1002",
        authorName: "Prof Ibrahim Danladi",
        email: "i.danladi@example.ac.ng",
        phone: "+2348030000002",
        institution: "Ahmadu Bello University",
        track: "III. AI, Data Science, Cybersecurity and Clean Tech Innovation",
        format: "Oral presentation",
        title: "Load forecasting for weak grids: a model trained on Nigerian distribution data",
        abstractText:
          "Background. Forecasting models trained on stable grids degrade sharply where supply is intermittent. Methods. A sequence model was trained on four years of distribution company data covering scheduled and unscheduled outages. Results. Mean absolute error fell by 31 per cent against the utility's existing method. Conclusion. Outage history is a stronger predictor than weather in this setting.",
        status: "ACCEPTED" as const,
      },
      {
        reference: "UARC26-1003",
        authorName: "Ms Folake Adeyemi",
        email: "folake.adeyemi@example.edu",
        phone: "+2348030000003",
        institution: "Obafemi Awolowo University",
        track: "VII. Smart Cities, Human Centered Urban Design and Environmental Resilience",
        format: "Poster presentation",
        title: "Drainage maintenance and flood depth in three Lagos mainland wards",
        abstractText:
          "Background. Flood modelling for Lagos usually assumes designed drainage capacity. Methods. Observed channel condition was surveyed across three wards and compared against recorded flood depths over two wet seasons. Results. Effective capacity averaged 46 per cent of design. Conclusion. Maintenance, not capacity, is the binding constraint in the wards studied.",
        status: "PENDING" as const,
      },
      {
        reference: "UARC26-1004",
        authorName: "Dr Emeka Okonkwo",
        email: "e.okonkwo@example.ac.uk",
        phone: "+2348030000004",
        institution: "University of Manchester",
        track: "V. Public Health, Drug Discovery, Therapeutics and Global Preparedness",
        format: "Oral presentation",
        title: "Antimicrobial resistance patterns in three Lagos teaching hospitals, 2022 to 2025",
        abstractText:
          "Background. National AMR surveillance has limited coverage of tertiary centres in Lagos. Methods. Isolates from three teaching hospitals were characterised over a thirty-six month window. Results. Carbapenem resistance rose year on year in two of the three sites. Conclusion. Site-level stewardship programmes are diverging in effectiveness and warrant direct comparison.",
        status: "PENDING" as const,
      },
      {
        reference: "UARC26-1005",
        authorName: "Mr Tunde Bakare",
        email: "tunde.bakare@live.unilag.edu.ng",
        phone: "+2348030000005",
        institution: "University of Lagos",
        track: "VI. Transformative Education and Capacity Building for Future Sustainability",
        format: "Poster presentation",
        title: "What graduates of Nigerian engineering programmes actually do in their first two years",
        abstractText:
          "Background. Curriculum reform debates rely on assumptions about early-career destinations. Methods. A cohort of 480 graduates from six programmes was surveyed at twelve and twenty-four months. Results. Under a third worked in the discipline they trained in. Conclusion. The gap between curriculum and destination is wider than programme reviews assume.",
        status: "PENDING" as const,
      },
    ].map((data) => db.submission.create({ data }))
  );

  const registrations = await Promise.all(
    [
      {
        reference: "UARC26-REG-2001",
        fullName: "Dr Adaeze Nwachukwu",
        email: "a.nwachukwu@unilag.edu.ng",
        phone: "+2348030000001",
        institution: "University of Lagos",
        category: "Early bird",
        amount: 30000,
        currency: "NGN",
        paystackRef: "UARC26-REG-2001",
        status: "PAID" as const,
        listPublicly: true,
        verification: "NOT_REQUIRED" as const,
        attended: true,
        attendedAt: new Date(),
      },
      {
        reference: "UARC26-REG-2002",
        fullName: "Prof Ibrahim Danladi",
        email: "i.danladi@example.ac.ng",
        phone: "+2348030000002",
        institution: "Ahmadu Bello University",
        category: "Regular",
        amount: 40000,
        currency: "NGN",
        paystackRef: "UARC26-REG-2002",
        status: "PAID" as const,
        listPublicly: true,
        verification: "NOT_REQUIRED" as const,
      },
      {
        reference: "UARC26-REG-2003",
        fullName: "Mr Tunde Bakare",
        email: "tunde.bakare@live.unilag.edu.ng",
        phone: "+2348030000005",
        institution: "University of Lagos",
        category: "Student early bird",
        amount: 10000,
        currency: "NGN",
        paystackRef: "UARC26-REG-2003",
        status: "PAID" as const,
        listPublicly: true,
        // Cleared automatically: live.unilag.edu.ng is a known academic domain.
        verification: "VERIFIED" as const,
        verifiedAt: new Date(),
        verificationNote:
          "Cleared automatically: live.unilag.edu.ng is a recognised academic domain. Student ID is still checked at the registration desk.",
        studentIdNumber: "190401055",
        studentInstitutionEmail: "tunde.bakare@live.unilag.edu.ng",
      },
      {
        reference: "UARC26-REG-2004",
        fullName: "Ms Chioma Eze",
        email: "chioma.eze@gmail.com",
        phone: "+2348030000006",
        institution: "Lagos State University",
        category: "Student regular",
        amount: 20000,
        currency: "NGN",
        paystackRef: "UARC26-REG-2004",
        status: "PAID" as const,
        listPublicly: false,
        // Held for review: a personal address, so it lands on the worklist.
        verification: "PENDING" as const,
        verificationNote:
          "Held for review: the address given is not on a recognised academic domain. The Secretariat will confirm the claim, usually within two working days.",
        studentIdNumber: "LASU/21/0442",
        studentInstitutionEmail: "chioma.eze@gmail.com",
      },
      {
        reference: "UARC26-REG-2005",
        fullName: "Dr Emeka Okonkwo",
        email: "e.okonkwo@example.ac.uk",
        phone: "+447700900000",
        institution: "University of Manchester",
        category: "International participant",
        amount: 50,
        currency: "USD",
        country: "United Kingdom",
        paystackRef: "UARC26-REG-2005",
        status: "PAID" as const,
        listPublicly: true,
        verification: "NOT_REQUIRED" as const,
      },
      {
        // Receipt sent, waiting on the Secretariat: this is what the
        // Payments queue in the dashboard is for.
        reference: "UARC26-REG-2006",
        fullName: "Ms Folake Adeyemi",
        email: "folake.adeyemi@example.edu",
        phone: "+2348030000003",
        institution: "Obafemi Awolowo University",
        category: "Early bird",
        amount: 30000,
        currency: "NGN",
        status: "DECLARED" as const,
        listPublicly: true,
        verification: "NOT_REQUIRED" as const,
        rrr: "3004-5247-0729",
        receiptUrl: "https://example.com/demo-receipt.jpg",
        declaredAt: new Date(),
      },
      {
        // Registered but has not been to the bank yet.
        reference: "UARC26-REG-2007",
        fullName: "Dr Salisu Yakubu",
        email: "s.yakubu@example.edu.ng",
        phone: "+2348030000007",
        institution: "University of Ibadan",
        category: "Regular",
        amount: 40000,
        currency: "NGN",
        status: "PENDING" as const,
        listPublicly: false,
        verification: "NOT_REQUIRED" as const,
      },
    ].map((data) => db.registration.create({ data }))
  );

  // One certificate already issued, for the delegate marked as attended, so
  // /certificates and /verify can be tried without checking anyone in first.
  const attended = registrations.find((r) => r.attended);
  if (attended) {
    await db.certificate.create({
      data: {
        code: "H4KM-9TR2-BXQ7",
        kind: "ATTENDANCE",
        recipientName: attended.fullName,
        institution: attended.institution,
        registrationId: attended.id,
      },
    });
  }

  const accepted = submissions.find((s) => s.status === "ACCEPTED");
  if (accepted) {
    await db.certificate.create({
      data: {
        code: "P2WD-6NCF-3JVA",
        kind: "PRESENTATION",
        recipientName: accepted.authorName,
        institution: accepted.institution,
        paperTitle: accepted.title,
        track: accepted.track,
        submissionId: accepted.id,
      },
    });
  }

  await Promise.all(
    [
      {
        reference: "UARC26-SPN-3001",
        organisation: `Lagoon Trust Bank (${DEMO_MARKER})`,
        contactName: "Mrs Nkechi Obi",
        email: "sponsorship@example.com",
        phone: "+2348040000001",
        tier: "Platinum partner",
        amount: 5_000_000,
        currency: "NGN",
        status: "CONFIRMED" as const,
        displayOnSite: true,
        websiteUrl: "https://example.com",
      },
      {
        reference: "UARC26-SPN-3002",
        organisation: `Akoka Life Sciences (${DEMO_MARKER})`,
        contactName: "Dr Segun Alabi",
        email: "partners@example.com",
        phone: "+2348040000002",
        tier: "Gold sponsor",
        amount: 2_500_000,
        currency: "NGN",
        status: "PAID" as const,
        displayOnSite: true,
      },
      {
        reference: "UARC26-SPN-3003",
        organisation: `Meridian Scholarly Press (${DEMO_MARKER})`,
        contactName: "Ms Hauwa Sule",
        email: "hello@example.com",
        phone: "+2348040000003",
        tier: "Silver sponsor",
        amount: 1_000_000,
        currency: "NGN",
        status: "PAID" as const,
        displayOnSite: true,
      },
      {
        reference: "UARC26-SPN-3004",
        organisation: `Faculty of Science Alumni Association (${DEMO_MARKER})`,
        contactName: "Mr Kunle Ogun",
        email: "alumni@example.com",
        phone: "+2348040000004",
        tier: "Supporter",
        amount: 150_000,
        currency: "NGN",
        status: "PAID" as const,
        displayOnSite: true,
      },
      {
        reference: "UARC26-SPN-3005",
        organisation: `Harmattan Energy (${DEMO_MARKER})`,
        contactName: "Mr Bode Fashola",
        email: "finance@example.com",
        phone: "+2348040000005",
        tier: "Bronze sponsor",
        amount: 500_000,
        currency: "NGN",
        // Awaiting a transfer, so it should NOT appear on the public wall.
        status: "AWAITING_PAYMENT" as const,
        displayOnSite: false,
      },
    ].map((data) => db.sponsor.create({ data }))
  );

  await Promise.all(
    [
      {
        reference: "UARC26-EXH-4001",
        organisation: `Meridian Scholarly Press (${DEMO_MARKER})`,
        contactName: "Ms Hauwa Sule",
        email: "hello@example.com",
        phone: "+2348040000003",
        packageKey: "Premium stand",
        amount: 750_000,
        currency: "NGN",
        status: "CONFIRMED" as const,
        standNumber: "A01",
        displayOnSite: true,
        description:
          "Academic publishing, journal submissions and open access options for Nigerian researchers. Editors on the stand across all three days.",
        websiteUrl: "https://example.com",
      },
      {
        reference: "UARC26-EXH-4002",
        organisation: `Department of Marine Sciences, UNILAG (${DEMO_MARKER})`,
        contactName: "Dr Ngozi Umeh",
        email: "marine@example.com",
        phone: "+2348040000006",
        packageKey: "Departmental and research group stand",
        amount: 100_000,
        currency: "NGN",
        status: "PAID" as const,
        standNumber: "C14",
        displayOnSite: true,
        description:
          "Lagoon water quality monitoring, the coastal erosion survey, and postgraduate research opportunities.",
      },
      {
        reference: "UARC26-EXH-4003",
        organisation: `Sahel Instruments (${DEMO_MARKER})`,
        contactName: "Mr Yusuf Bello",
        email: "sales@example.com",
        phone: "+2348040000007",
        packageKey: "Standard stand",
        amount: 450_000,
        currency: "NGN",
        status: "PAID" as const,
        standNumber: "B07",
        displayOnSite: true,
        description: "Laboratory instrumentation, servicing and calibration for university laboratories.",
      },
    ].map((data) => db.exhibitor.create({ data }))
  );

  console.log("");
  console.log("Demo data inserted:");
  console.log("  5 abstracts (2 accepted, 3 pending)");
  console.log("  7 registrations (3 paid, 1 receipt awaiting check, 1 unpaid)");
  console.log("  1 delegate checked in, with a certificate issued");
  console.log("  5 sponsorships (4 on the public wall, 1 awaiting payment)");
  console.log("  3 exhibitors");
  console.log("");
  console.log("Payment queue to try in the dashboard: UARC26-REG-2006 (receipt declared)");
  console.log("Payment page to try at /register/payment:");
  console.log("  UARC26-REG-2007  +  s.yakubu@example.edu.ng   (not paid yet)");
  console.log("");
  console.log("Payment queue to try in the dashboard: UARC26-REG-2006 (receipt declared)");
  console.log("Payment page to try at /register/payment:");
  console.log("  UARC26-REG-2007  +  s.yakubu@example.edu.ng   (not paid yet)");
  console.log("");
  console.log("Certificate codes to try at /verify:");
  console.log("  H4KM-9TR2-BXQ7   attendance");
  console.log("  P2WD-6NCF-3JVA   presentation");
  console.log("");
  console.log("At /certificates, look one up with:");
  console.log("  a.nwachukwu@unilag.edu.ng  +  UARC26-REG-2001");
  console.log("");
  console.log("!! This is invented demo data. Run `npm run db:seed -- --clear` before launch. !!");
}

const shouldClear = process.argv.includes("--clear");

(shouldClear ? clear() : seed())
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
