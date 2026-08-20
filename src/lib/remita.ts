// Payment by Remita, which is how the University of Lagos actually collects
// money for the conference.
//
// There is no payment API in this flow. A delegate generates a Remita
// Retrieval Reference (RRR) on the university's payment portal, walks into a
// commercial bank to pay it, and comes back with a receipt. Until Paystack
// credentials arrive, this is the only live route, and it is the one the
// Secretariat has run for years, previously through a Google Form.
//
// What the site automates is everything around that walk to the bank: it works
// out the exact amount owed from the fee schedule, issues a reference to quote,
// spells out the portal steps with the delegate's own figures filled in,
// captures the RRR and the receipt in one place, and gives the Secretariat a
// queue to verify against rather than a spreadsheet of form responses.

import type { AcademicIconName } from "@/components/icons/AcademicIcons";

export const REMITA = {
  /**
   * The Secretariat's instruction is to start at the university home page and
   * follow the "Unilag payment portal" link. The deeper URL that circulates
   * online, unilag.edu.ng/remita/, currently returns a server error, so
   * sending delegates straight there would strand them. If the Secretariat
   * confirms a working direct link, set `directPortalUrl` and the steps below
   * pick it up automatically.
   */
  siteUrl: "https://unilag.edu.ng",
  siteLabel: "www.unilag.edu.ng",
  portalLinkText: "Unilag payment portal",
  directPortalUrl: null as string | null,

  /** Chosen on the portal's first screen. Delegates are not students or staff. */
  customerCategory: "Others",
  /** Picked from the portal's payment item drop-down. Must match exactly. */
  paymentItem: "Research Conference Fair",

  /** Where a stuck delegate should turn. */
  whatsApp: { e164: "+2347042015134", display: "+234 704 201 5134" },

  /** How long the Secretariat takes to check a receipt, in working days. */
  verificationDays: 2,
} as const;

export interface RemitaStep {
  n: number;
  icon: AcademicIconName;
  title: string;
  body: string;
  /** Rendered as a labelled value the delegate copies into the portal. */
  fields?: { label: string; value: string; copyable?: boolean }[];
}

/**
 * The portal steps, with the delegate's own figures already filled in. Passing
 * the amount and reference is the whole point: the old Google Form left people
 * to work out what they owed and what to write in the payment item field.
 */
export function remitaSteps(input: {
  amountLabel: string;
  payerName: string;
  reference: string;
  email: string;
  phone: string;
}): RemitaStep[] {
  return [
    {
      n: 1,
      icon: "globe",
      title: `Open ${REMITA.siteLabel}`,
      body: `Go to the university website and click the "${REMITA.portalLinkText}" link.`,
    },
    {
      n: 2,
      icon: "users",
      title: "Choose the customer category",
      body: `Select "${REMITA.customerCategory}". You are not paying as a student or a member of staff, even if you are one: this is a conference fee, not a school fee.`,
    },
    {
      n: 3,
      icon: "quill",
      title: "Fill in the form with these exact details",
      body: "Copy them across as they appear here. The payment item must match, or the money lands against the wrong account and takes weeks to trace.",
      fields: [
        { label: "Name of payee", value: input.payerName, copyable: true },
        { label: "Mobile number", value: input.phone, copyable: true },
        { label: "Email address", value: input.email, copyable: true },
        { label: "Payment item", value: REMITA.paymentItem, copyable: true },
        { label: "Amount", value: input.amountLabel, copyable: true },
      ],
    },
    {
      n: 4,
      icon: "scroll",
      title: "Print the slip and note the RRR",
      body: "The portal generates a slip carrying a 12 digit Remita Retrieval Reference. Keep it: it is the only way to trace the payment afterwards.",
    },
    {
      n: 5,
      icon: "city",
      title: "Pay at any commercial bank",
      body: "Take the printed slip to any commercial bank and pay it. Keep the bank receipt or the Remita receipt, and photograph or scan it.",
    },
    {
      n: 6,
      icon: "upload",
      title: "Come back here and confirm",
      body: `Return to this page, enter your RRR and upload the receipt. The Secretariat checks it, usually within ${REMITA.verificationDays} working days, and your registration is confirmed. Quote reference ${input.reference} in any correspondence.`,
    },
  ];
}

/**
 * An RRR is twelve digits, conventionally written 1234-5678-9012. Delegates
 * copy it off a printed slip, so accept it with spaces, dashes or neither, and
 * store it in one canonical form.
 */
export function normaliseRrr(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 12) return null;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
}

export function isValidRrr(input: string): boolean {
  return normaliseRrr(input) !== null;
}

/** Whether card payment is available, i.e. whether Paystack has been configured. */
export function cardPaymentAvailable(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

export const REMITA_COPY = {
  heading: "Payment by Remita",
  lede: `All conference payments go through Remita, on the University of Lagos payment portal. You generate a payment reference on the portal, pay it at any commercial bank, then come back here with the receipt.`,
  whyManual:
    "The bank step cannot be skipped: this is the university's own collection route, and a payment made any other way cannot be reconciled against the conference account.",
  afterDeclaring: `Your place is held as soon as you submit the receipt. The Secretariat verifies it, normally within ${REMITA.verificationDays} working days, and you receive a confirmation by email and SMS. Nothing further is needed from you in the meantime.`,
  keepReceipt:
    "Keep the original receipt until you have collected your delegate pack at the registration desk.",
};
