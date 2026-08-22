// Payment by Remita, which is how the University of Lagos actually collects
// money for the conference.
//
// The university's portal is run by Tranzgate, and its InitiatePayment page
// accepts the payer's details as query parameters. That is what lets this app
// hand a delegate a single link that opens the official portal with the name,
// mobile, email, payment item and amount already filled in, leaving nothing to
// do but press Continue. The parameter names were established by probing the
// live page:
//
//     clientid=25              University of Lagos (Others)
//     paymentcode=19           "Research Conference & Fair"
//     name / Email / Mobile    the payer's details
//     Amount                   worked out here from the fee schedule
//
// Money still moves through Remita and lands in the university's account, as
// it must: nothing here takes a payment or touches card details. What has gone
// is the part delegates got wrong, which was picking the right payment item
// out of sixty-six and typing the right amount.
//
// The manual steps are kept underneath the button, because a portal that is
// down or a link that a mail client mangles should not leave anybody stuck.

import type { AcademicIconName } from "@/components/icons/AcademicIcons";

export const REMITA = {
  /**
   * The university's live payment portal, run by Tranzgate. Verified against
   * the link published on conference.unilag.edu.ng/payment-info.
   */
  portalUrl: "https://pay.tranzgate.com.ng/InitiatePayment.aspx",
  portalHost: "pay.tranzgate.com.ng",

  /** Identifies University of Lagos (Others) on the portal. */
  clientId: "25",
  /** The "Research Conference & Fair" item in the portal's payment list. */
  paymentCode: "19",
  paymentItem: "Research Conference & Fair",
  customerCategory: "Others",

  /** Fallback for the written steps, if someone has to navigate by hand. */
  siteUrl: "https://unilag.edu.ng",
  siteLabel: "www.unilag.edu.ng",
  portalLinkText: "Unilag payment portal",

  /** Where a stuck delegate should turn. */
  whatsApp: { e164: "+2347042015134", display: "+234 704 201 5134" },

  /** How long the Secretariat takes to check a receipt, in working days. */
  verificationDays: 2,
} as const;

/**
 * The portal expects a Nigerian mobile in local 0-prefixed form; we store
 * numbers in international form so they dial from anywhere.
 */
export function localMobile(phone: string): string {
  const digits = phone.replace(/[^0-9+]/g, "");
  if (digits.startsWith("+234")) return "0" + digits.slice(4);
  if (digits.startsWith("234")) return "0" + digits.slice(3);
  return digits;
}

/**
 * A link straight into the university's portal with everything filled in.
 *
 * The amount goes in as a plain integer: the portal's Amount box rejects
 * grouping separators and a currency symbol.
 */
export function portalPaymentUrl(input: {
  payerName: string;
  email: string;
  phone: string;
  amount: number;
}): string {
  const params = new URLSearchParams({
    clientid: REMITA.clientId,
    remita: "1",
    create: "1",
    customerid: "OneTimeCustomer",
    name: input.payerName,
    Email: input.email,
    Mobile: localMobile(input.phone),
    Amount: String(Math.round(input.amount)),
    paymentcode: REMITA.paymentCode,
  });
  return `${REMITA.portalUrl}?${params.toString()}`;
}

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
  afterDeclaring: `Your place is held as soon as you submit the receipt. The Secretariat verifies it, normally within ${REMITA.verificationDays} working days, and you receive a confirmation by email. Nothing further is needed from you in the meantime.`,
  keepReceipt:
    "Keep the original receipt until you have collected your delegate pack at the registration desk.",
};
