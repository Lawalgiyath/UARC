import { CONFERENCE, CONTACT } from "@/lib/conference";

// What the site does with people's data, written down.
//
// The Nigeria Data Protection Act 2023 requires anyone collecting personal
// data to say, in terms an ordinary person can follow, what they collect, why,
// on what legal basis, who else sees it, where it goes, how long it is kept,
// and what the person can demand. A conference registration form collects
// names, phone numbers, institutional affiliations and student identifiers, so
// the Act applies squarely.
//
// Two things are worth understanding before editing this file.
//
// The controller is the University of Lagos, not whoever built or runs the
// site. That matters: the obligations, and the liability, sit with the
// institution. The Secretariat must confirm the university's Data Protection
// Officer before this goes live, because naming the wrong contact is worse
// than naming none.
//
// And the data leaves Nigeria. The application, the database and the uploaded
// receipts are hosted abroad. Section 41 of the Act allows that, but only if
// the transfer is disclosed and rests on a proper basis, and the NDPC's
// guidance is explicit that a notice must name where data goes rather than
// gesture at "our service providers". So the table below names them.
//
// Everything here must stay true of what the code actually does. If a field is
// added to a form, or a new processor is introduced, it belongs in this file
// in the same commit.

/** How long each kind of record is kept, and why that long. */
export interface RetentionRule {
  what: string;
  howLong: string;
  why: string;
}

/** A third party that necessarily sees some of this data. */
export interface Processor {
  name: string;
  role: string;
  where: string;
}

export const PRIVACY = {
  /**
   * The date the notice last changed. Update it whenever the substance does,
   * because a data subject is entitled to know which version they were shown.
   */
  lastUpdated: "22 August 2026",

  controller: {
    name: "University of Lagos",
    on: `the ${CONFERENCE.edition} ${CONFERENCE.name}`,
    addressLines: CONTACT.addressLines,
    email: CONTACT.email,
    phone: CONTACT.phones[0].display,
  },

  collected: [
    {
      what: "Your name, email address, phone number and institution",
      why: "To register you, to write to you about your registration, and to know who is at the conference.",
      basis: "Performance of a contract: you asked us to register you.",
    },
    {
      what: "Your country of residence",
      why: "So that international delegates can be sent visa letters and dial-in details.",
      basis: "Performance of a contract.",
    },
    {
      what: "Your student number and institutional email address, if you claim a student rate",
      why: "To check that the reduced fee is properly claimed, before it is granted rather than after you have paid.",
      basis: "Performance of a contract. Only collected if you select a student category.",
    },
    {
      what: "Your payment reference, the amount you say you paid, the date on your receipt, and the receipt itself",
      why: "To match your payment against the conference account and confirm your place.",
      basis: "Performance of a contract, and our legal obligation to keep proper financial records.",
    },
    {
      what: "Your abstract or paper, and the details of its authors",
      why: "To review it and, if accepted, to place it in the programme.",
      basis: "Performance of a contract.",
    },
    {
      what: "Whether you agreed to appear on the public delegate list",
      why: "So that your name is published only if you asked for it to be.",
      basis: "Consent, which you can withdraw at any time.",
    },
    {
      what: "The IP address a form was submitted from",
      why: "To rate limit the forms. Without it, the site can be flooded by anyone with a script.",
      basis: "Legitimate interest in keeping the site working.",
    },
  ],

  /**
   * Named rather than described. The NDPC's guidance treats a vague reference
   * to "service providers" as not disclosing a transfer at all.
   */
  processors: [
    {
      name: "Vercel",
      role: "Runs the website itself",
      where: "European Union (Frankfurt), pinned in vercel.json",
    },
    { name: "Neon", role: "Holds the database of registrations and payments", where: "European Union" },
    { name: "Cloudinary", role: "Stores uploaded receipts and logos", where: "European Union" },
    {
      name: "Google (Gmail)",
      role: "Delivers the emails the Secretariat sends you about your registration",
      where: "United States and the European Union",
    },
    {
      name: "Google Maps",
      role: "Draws the venue map on the contact page, and only if you press the button asking for it",
      where: "United States and the European Union",
    },
    {
      name: "Remita and Tranzgate",
      role: "Take the payment on the university's behalf. Payment happens on their systems, not ours",
      where: "Nigeria",
    },
  ] as Processor[],

  retention: [
    {
      what: "Registration and payment records",
      howLong: "Six years after the conference",
      why: "Financial records supporting a university account have to be available for audit.",
    },
    {
      what: "Uploaded receipts",
      howLong: "Six years after the conference",
      why: "They are the evidence behind a payment record, and are useless separated from it.",
    },
    {
      what: "Abstracts and papers",
      howLong: "Indefinitely, as part of the conference proceedings",
      why: "The proceedings are a permanent scholarly record. Author names stay attached to their work.",
    },
    {
      what: "Certificates",
      howLong: "Indefinitely",
      why: "A certificate must remain verifiable years later, which is the point of issuing one.",
    },
    {
      what: "Rate limiting records",
      howLong: "Cleared automatically once the window passes",
      why: "They serve no purpose after that.",
    },
  ] as RetentionRule[],

  rights: [
    "Ask what personal data we hold about you, and get a copy of it.",
    "Have anything inaccurate corrected.",
    "Ask us to delete your data, where we are not required to keep it.",
    "Object to processing that rests on our legitimate interest.",
    "Withdraw consent, where consent is what we relied on. Taking your name off the public delegate list takes effect immediately and does not affect your registration.",
    "Ask for your data in a portable form.",
    "Complain to the Nigeria Data Protection Commission if you think we have got this wrong.",
  ],

  /**
   * The one thing the site deliberately does not do, stated plainly because it
   * is the question people actually have when a website asks them to pay.
   */
  cardsNotice:
    "This site never sees your card. Payment is made on the University of Lagos payment portal, operated by Remita, and card details are entered there. Nothing about your card reaches this website, and none of it is stored here.",

  /** Session cookie only; no analytics, no advertising, no third-party tracking. */
  cookiesNotice:
    "The public pages of this site set no cookies at all. There is no analytics, no advertising and no third-party tracking. The Secretariat's own dashboard sets one cookie so that staff stay signed in; it does nothing else and is deleted when they sign out.",

  /**
   * The one third party a visitor can invite onto the page, and only by
   * pressing a button. Spelled out because a map that loads itself is exactly
   * how a no-tracking claim quietly stops being true.
   */
  mapNotice:
    "The contact page offers a map of the venue, which comes from Google. It is not loaded until you press the button asking for it. If you do, Google sets its own cookies and can see that you requested the map, under Google's terms rather than ours. If you would rather not, the direction links beside it open Google or Apple Maps in a new tab and load nothing into this page.",

  /**
   * Why the data may lawfully sit outside Nigeria.
   *
   * Section 41 of the NDPA permits a transfer where an adequate level of
   * protection is ensured, and section 43 lists the grounds a transfer may
   * otherwise rest on, including that it is necessary to perform a contract
   * with the data subject. Both apply here, and both are named, because
   * "we use cloud hosting" is not a legal basis.
   */
  transferBasis: [
    "The application and the database both run inside the European Union, in Frankfurt, and uploaded receipts are stored in the European Union as well. The EU's data protection regime is among the strictest in the world, which is the adequacy section 41 is concerned with.",
    "The transfer is also necessary to perform the contract you entered into when you registered. The conference cannot register you, take your payment or issue your certificate without processing your details somewhere, and this is where.",
    "The site was moved to Frankfurt deliberately. It previously ran in the United States while the database sat in Frankfurt, which put two jurisdictions in the path of every query instead of one, and sent every lookup across the Atlantic and back.",
    "Payment itself never leaves Nigeria. Remita and Tranzgate handle it on the University's own portal, so card details are processed in Nigeria under Nigerian rules and never reach this site at all.",
    "If the University later requires this data to be held in Nigeria, it can be moved. Nothing here depends on a particular provider and the database is ordinary PostgreSQL.",
  ],

  breach:
    "If personal data held for this conference is ever exposed, the University will report it to the Nigeria Data Protection Commission within 72 hours of becoming aware of it, and will tell the people affected directly where the risk to them is significant.",
} as const;
