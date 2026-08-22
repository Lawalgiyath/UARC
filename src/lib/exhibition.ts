// Exhibition stands at the research fair that runs alongside the conference.
// Same rule as everywhere else: the price is decided on the server from a
// package key, never accepted from the browser.

import type { AcademicIconName } from "@/components/icons/AcademicIcons";

export type ExhibitPackage = "PREMIUM" | "STANDARD" | "TABLE" | "ACADEMIC";

export interface ExhibitPackageDefinition {
  label: string;
  amount: number;
  currency: "NGN" | "USD";
  icon: AcademicIconName;
  size: string;
  summary: string;
  includes: string[];
  /** Stands of this type available across the three days. */
  capacity: number;
}

export const EXHIBIT_PACKAGES: Record<ExhibitPackage, ExhibitPackageDefinition> = {
  PREMIUM: {
    label: "Premium stand",
    amount: 750_000,
    currency: "NGN",
    icon: "booth",
    size: "3 m × 3 m, corner position",
    capacity: 8,
    summary: "Front of the fair, facing the main entrance to the hall.",
    includes: [
      "3 m × 3 m corner stand with back and side panels",
      "Fascia board with your organisation name",
      "Two tables, four chairs, power outlet and lighting",
      "Four exhibitor passes with full delegate access",
      "Listing in the exhibitor directory and on this website",
    ],
  },
  STANDARD: {
    label: "Standard stand",
    amount: 450_000,
    currency: "NGN",
    icon: "booth",
    size: "3 m × 2 m, in line",
    capacity: 24,
    summary: "The main exhibition run, alongside the plenary hall.",
    includes: [
      "3 m × 2 m stand with back panel",
      "Fascia board with your organisation name",
      "One table, two chairs, power outlet",
      "Two exhibitor passes with full delegate access",
      "Listing in the exhibitor directory and on this website",
    ],
  },
  TABLE: {
    label: "Table top",
    amount: 200_000,
    currency: "NGN",
    icon: "ticket",
    size: "One dressed table",
    capacity: 30,
    summary: "For publishers, startups and service providers with material to hand out.",
    includes: [
      "One dressed table with two chairs",
      "Name card on the table",
      "One exhibitor pass with full delegate access",
      "Listing in the exhibitor directory",
    ],
  },
  ACADEMIC: {
    label: "Departmental and research group stand",
    amount: 100_000,
    currency: "NGN",
    icon: "microscope",
    size: "One dressed table, research fair aisle",
    capacity: 40,
    summary:
      "Concessionary rate for university departments, research groups and student teams showing their work.",
    includes: [
      "One dressed table in the research fair aisle",
      "Poster board behind the table",
      "Two exhibitor passes",
      "Listing in the exhibitor directory",
      "Eligible for the research fair prize",
    ],
  },
};

export const EXHIBIT_PACKAGE_ORDER: ExhibitPackage[] = ["PREMIUM", "STANDARD", "TABLE", "ACADEMIC"];

export function isExhibitPackage(value: string): value is ExhibitPackage {
  return value in EXHIBIT_PACKAGES;
}

export const EXHIBITION = {
  venue: "Research Fair concourse, Jelili Adebisi Omotola Hall",
  buildUp: "Tuesday 13 October 2026, 10:00 to 18:00",
  open: "Wednesday 14 to Friday 16 October 2026, 08:30 to 17:00",
  breakDown: "Friday 16 October 2026, from 17:00",
  applicationCloses: "Friday 25 September 2026",
} as const;
