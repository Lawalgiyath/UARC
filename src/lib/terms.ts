import { CONFERENCE, CONTACT } from "@/lib/conference";
import { REMITA } from "@/lib/remita";

// The terms a delegate actually agrees to.
//
// Two things were missing before this file existed, and both matter.
//
// The first is publication. The conference collects abstracts and papers and
// reproduces them in the book of abstracts, the programme and the proceedings.
// An author owns the copyright in their own work the moment they write it, so
// publishing it needs their permission. Nothing on the site asked for that
// permission, which meant every abstract in the book would have been published
// without a licence. Section "Your abstract and your paper" is that licence,
// and the submission form now asks for it explicitly.
//
// The second is that a refund policy living only in an FAQ answer is guidance,
// not a term. Money changes hands here; what happens when someone cannot come,
// or when the conference itself moves, has to be written down somewhere a
// delegate agreed to.
//
// This is drafted to be honest and readable rather than defensive, and the
// University's legal office should read it before the conference opens. Where
// it states a fact about how the site behaves, that fact is true of the code:
// the payment section describes what lib/remita.ts actually does, and the
// certificate section describes what the certificate routes actually do.

export interface TermsSection {
  heading: string;
  /** Paragraphs, in order. */
  body: string[];
  /** Optional bulleted points after the paragraphs. */
  points?: string[];
}

export const TERMS = {
  lastUpdated: "23 August 2026",

  intro: [
    `These terms apply when you register for, submit work to, sponsor or exhibit at the ${CONFERENCE.edition} ${CONFERENCE.name}. They are between you and the University of Lagos, acting through the Conference Planning Committee Secretariat.`,
    "They are written to be read. Where something is a genuine obligation on you, it says so plainly; where the University is the one on the hook, that is stated just as plainly.",
  ],

  sections: [
    {
      heading: "Registering",
      body: [
        "Registering reserves your place. It is not confirmed until payment reaches the University, which is a separate step and can take a few days if you pay at a bank.",
        `Your registration is personal to you. If you cannot come, you may pass your place to a colleague from the same institution at no charge; see refunds below.`,
      ],
      points: [
        "You must give accurate details. Your name as registered is the name printed on your certificate.",
        "A reduced student rate requires a student number and an institutional email address, checked before the rate is granted.",
        "Claiming a student rate you are not entitled to means the difference falls due before you collect your delegate pack.",
      ],
    },
    {
      heading: "Fees and payment",
      body: [
        `All payments are made on the University of Lagos payment portal, operated by Remita. This website never sees or stores your card details, and it never holds your money: payment goes directly to the University's own account.`,
        `Where you pay at a bank and send us the receipt, the Secretariat checks it against the conference account. That normally takes up to ${REMITA.verificationDays} working days, and you are told the outcome by email.`,
      ],
      points: [
        "Fees are quoted in naira, except the international rate, which is quoted in US dollars.",
        "Bank charges, transfer fees and currency conversion are yours to bear.",
        "Your place is confirmed only when payment is verified. Until then it is reserved, not held indefinitely.",
      ],
    },
    {
      heading: "Refunds and transfers",
      body: [
        "Registration fees are non refundable after the date published on the fees page, but they are fully transferable to another delegate from the same institution at no charge, at any time before the conference opens. Write to the Secretariat with both names and the original reference.",
        "If you paid twice, or paid more than you owed, tell the Secretariat with your reference and the overpayment is returned.",
      ],
    },
    {
      heading: "If the conference changes",
      body: [
        `The University may change the programme, the speakers, the format or the venue where it has good reason to. Dates and venue are ${CONFERENCE.dates}, ${CONFERENCE.venueFull}, and any change is announced on this site and by email to everyone registered.`,
        "If the University cancels the conference outright, registration fees are refunded in full. The University is not able to refund your travel, visa or accommodation costs, which is why those should be arranged with that risk in mind.",
      ],
    },
    {
      heading: "Your abstract and your paper",
      body: [
        "You keep the copyright in everything you submit. Submitting it does not transfer ownership to the University, and you remain free to publish it elsewhere.",
        "What you do give the University is permission to use it for the conference: to review it, and if it is accepted, to reproduce it in the book of abstracts, the conference programme and the published proceedings, in print and online. That permission is non exclusive, has no time limit, and carries no fee. It is the only way a conference can print its own proceedings.",
      ],
      points: [
        "You confirm the work is yours, that it does not infringe anyone else's rights, and that any co-authors have agreed to it being submitted.",
        "You confirm any research involving people or animals was approved by the appropriate ethics committee.",
        "Acceptance may be withdrawn if work is found to be plagiarised, fabricated, or already published elsewhere without disclosure.",
      ],
    },
    {
      heading: "Certificates",
      body: [
        "Certificates of attendance and of presentation are issued automatically once you are checked in at the registration desk, and each carries a code that anyone can verify on this site.",
        "A certificate obtained by misrepresentation, or attached to a payment later found not to have been made, may be revoked. A revoked certificate fails verification, which is the point of the code.",
      ],
    },
    {
      heading: "Sponsorship and exhibition",
      body: [
        "Sponsorship and exhibition applications are offers, not bookings. A place is confirmed once payment is verified and the Secretariat has agreed the entitlements in writing, and stand numbers are allocated by the Secretariat.",
        "Logos and organisation names are published as supplied. Supplying them confirms you are entitled to use them.",
      ],
    },
    {
      heading: "Accommodation listed on this site",
      body: [
        "The hotels listed are published as information, at the request of the Secretariat, to save delegates the work of finding somewhere near campus. The University does not operate them, does not take a commission on them, and does not book on your behalf.",
        "Rates and availability are the hotel's to set and change. Your booking is a contract between you and the hotel, and any complaint about it is between you and them.",
      ],
    },
    {
      heading: "Using this website",
      body: [
        "Use it for what it is for. Do not attempt to gain access to the Secretariat's dashboard or to other delegates' records, do not submit anyone else's personal details as your own, and do not use automated tools to flood the forms.",
        "The site records the address a form was submitted from in order to rate limit it. How that is handled is set out in the privacy notice.",
      ],
    },
    {
      heading: "Liability",
      body: [
        "The University takes responsibility for running the conference it has advertised and for handling your data properly. It does not accept liability for your travel, visa, accommodation or personal arrangements, nor for loss of or damage to personal belongings brought to the venue.",
        "Nothing in these terms limits any liability that Nigerian law does not allow to be limited.",
      ],
    },
    {
      heading: "Law",
      body: [
        "These terms are governed by the laws of the Federal Republic of Nigeria, and disputes fall to the courts of Lagos State.",
        "Personal data is handled under the Nigeria Data Protection Act 2023; the privacy notice explains how.",
      ],
    },
    {
      heading: "Changes to these terms",
      body: [
        "If these terms change in a way that affects delegates already registered, everyone registered is told by email. The date at the top of this page is when it last changed.",
      ],
    },
  ] as TermsSection[],

  contact: {
    email: CONTACT.email,
    phone: CONTACT.phones[0].display,
  },
} as const;

/** Shown beside the consent box on the abstract form. */
export const SUBMISSION_CONSENT =
  "I confirm this work is my own, that any co-authors have agreed to it being submitted, and I give the University of Lagos permission to reproduce it in the book of abstracts, the programme and the conference proceedings. I keep the copyright.";
