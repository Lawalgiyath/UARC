// Sponsorship tiers and what each one buys.
//
// Prices live on the server, exactly like the delegate fee schedule: the
// browser only ever sends a tier key, never an amount, so a sponsor cannot
// change what they are charged by editing the form.

import type { AcademicIconName } from "@/components/icons/AcademicIcons";

/**
 * The smallest sponsorship the Secretariat will process on a named figure, in
 * naira. It sits deliberately above Silver: below this the fixed tiers already
 * describe what a sponsor gets, and there is nothing to negotiate.
 */
export const CUSTOM_SPONSORSHIP_MINIMUM = 2_000_000;
/**
 * An upper bound, so a typo cannot raise an invoice for a billion naira and
 * sit in the queue looking like a real pledge.
 */
export const CUSTOM_SPONSORSHIP_MAXIMUM = 500_000_000;

export type SponsorTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "SUPPORTER" | "CUSTOM";

export interface SponsorTierDefinition {
  label: string;
  amount: number;
  currency: "NGN" | "USD";
  icon: AcademicIconName;
  summary: string;
  benefits: string[];
  /** Controls how large the logo is rendered on the sponsor wall. */
  logoScale: 1 | 2 | 3;
  /** Complimentary delegate passes bundled with the tier. */
  passes: number;
  /**
   * A tier whose amount the sponsor names themselves. Everything else has a
   * fixed price decided here; this one is a floor, and what they are billed is
   * whatever they pledge above it.
   */
  custom?: true;
}

export const SPONSOR_TIERS: Record<SponsorTier, SponsorTierDefinition> = {
  PLATINUM: {
    label: "Platinum partner",
    amount: 5_000_000,
    currency: "NGN",
    icon: "laurel",
    logoScale: 3,
    passes: 10,
    summary: "Headline partner of the 19th edition, named in the opening ceremony and the communique.",
    benefits: [
      "Named as headline partner across the conference programme, banners and this website",
      "Address from the podium at the opening ceremony",
      "Premium exhibition stand at the research fair, front position",
      "Full page in the book of abstracts",
      "Ten complimentary delegate passes",
      "Logo on all delegate certificates",
    ],
  },
  GOLD: {
    label: "Gold sponsor",
    amount: 2_500_000,
    currency: "NGN",
    icon: "seal",
    logoScale: 2,
    passes: 6,
    summary: "Named sponsor of a plenary session or a subtheme track.",
    benefits: [
      "Named sponsor of one plenary session or one subtheme track",
      "Logo on the sponsor wall, the programme and session backdrops",
      "Standard exhibition stand at the research fair",
      "Half page in the book of abstracts",
      "Six complimentary delegate passes",
    ],
  },
  SILVER: {
    label: "Silver sponsor",
    amount: 1_000_000,
    currency: "NGN",
    icon: "book",
    logoScale: 2,
    passes: 4,
    summary: "Supports the research fair, the book of abstracts or the delegate pack.",
    benefits: [
      "Logo on the sponsor wall, the programme and the delegate pack",
      "Shared exhibition table at the research fair",
      "Quarter page in the book of abstracts",
      "Four complimentary delegate passes",
    ],
  },
  BRONZE: {
    label: "Bronze sponsor",
    amount: 500_000,
    currency: "NGN",
    icon: "handshake",
    logoScale: 1,
    passes: 2,
    summary: "Supports delegate hospitality and the student paper prizes.",
    benefits: [
      "Logo on the sponsor wall and in the programme",
      "Acknowledgement in the closing remarks",
      "Two complimentary delegate passes",
    ],
  },
  CUSTOM: {
    label: "Choose your own amount",
    // Not a price: the least the Secretariat will process as a sponsorship.
    // Anything smaller is better handled as a donation to the faculty.
    amount: CUSTOM_SPONSORSHIP_MINIMUM,
    currency: "NGN",
    icon: "quill",
    logoScale: 2,
    // Matched to Silver, the tier immediately below the floor. Whatever is
    // agreed on top of this is agreed with the Secretariat, but nobody paying
    // more than a Silver sponsor should receive less than one.
    passes: 4,
    custom: true,
    summary:
      "For an organisation giving between the tiers, or more than platinum. Name the figure and the Secretariat will agree the benefits against it before anything is announced.",
    benefits: [
      "Benefits agreed with the Secretariat against the amount pledged",
      "Never less than the Silver sponsor package",
      "Logo on the sponsor wall and in the book of abstracts",
    ],
  },
  SUPPORTER: {
    label: "Supporter",
    amount: 150_000,
    currency: "NGN",
    icon: "star",
    logoScale: 1,
    passes: 1,
    summary: "For alumni, departments, small firms and individuals backing the conference.",
    benefits: [
      "Name or logo listed on the sponsor wall",
      "Acknowledgement in the book of abstracts",
      "One complimentary delegate pass",
    ],
  },
};

export const SPONSOR_TIER_ORDER: SponsorTier[] = [
  "PLATINUM",
  "GOLD",
  "SILVER",
  "BRONZE",
  "SUPPORTER",
  "CUSTOM",
];

export function isSponsorTier(value: string): value is SponsorTier {
  return value in SPONSOR_TIERS;
}

/**
 * Sponsorships can also be settled by bank transfer or by an internal
 * university journal voucher, which is how most institutional sponsors will
 * actually pay. Those applications are recorded as AWAITING_TRANSFER and
 * confirmed by the Secretariat in the admin panel.
 */
export type SponsorPaymentMethod = "ONLINE" | "TRANSFER";

export const SPONSOR_BANK_DETAILS = {
  // Filled in by the Secretariat before launch. Left explicitly blank rather
  // than invented, so nobody transfers money to a placeholder account.
  accountName: "",
  accountNumber: "",
  bank: "",
  note:
    "Bank details are issued on the sponsorship invoice sent by the Secretariat once an application is received.",
} as const;

/**
 * What a sponsor is actually billed.
 *
 * Every fixed tier ignores whatever the browser sent, which is the rule this
 * file has always followed. CUSTOM is the single exception, and it is bounded
 * on both sides: below the floor the Secretariat would rather take it as a
 * donation, and above the ceiling it is almost certainly a mistyped figure.
 */
export function resolveSponsorAmount(
  tier: SponsorTier,
  requested: number | undefined
): { ok: true; amount: number } | { ok: false; error: string } {
  const definition = SPONSOR_TIERS[tier];
  if (!definition.custom) return { ok: true, amount: definition.amount };

  if (requested === undefined || !Number.isFinite(requested)) {
    return { ok: false, error: "Please say how much you would like to sponsor." };
  }
  const amount = Math.round(requested);
  if (amount < CUSTOM_SPONSORSHIP_MINIMUM) {
    return {
      ok: false,
      error: `The smallest sponsorship we can process is ₦${CUSTOM_SPONSORSHIP_MINIMUM.toLocaleString(
        "en-NG"
      )}. For anything below that, please write to the Secretariat instead.`,
    };
  }
  if (amount > CUSTOM_SPONSORSHIP_MAXIMUM) {
    return {
      ok: false,
      error: "That figure looks like a mistake. Please contact the Secretariat directly.",
    };
  }
  return { ok: true, amount };
}
