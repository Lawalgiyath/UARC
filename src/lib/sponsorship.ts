// Sponsorship tiers and what each one buys.
//
// Prices live on the server, exactly like the delegate fee schedule: the
// browser only ever sends a tier key, never an amount, so a sponsor cannot
// change what they are charged by editing the form.

import type { AcademicIconName } from "@/components/icons/AcademicIcons";

export type SponsorTier = "PLATINUM" | "GOLD" | "SILVER" | "BRONZE" | "SUPPORTER";

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
