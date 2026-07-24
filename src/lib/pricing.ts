export type FeeCategory =
  | "EARLY_BIRD"
  | "REGULAR"
  | "STUDENT_EARLY_BIRD"
  | "STUDENT_REGULAR"
  | "INTERNATIONAL";

interface FeeDefinition {
  label: string;
  amount: number;
  currency: "NGN" | "USD";
}

// Server-side source of truth. The client only ever sends a category key,
// never an amount, so a delegate cannot alter the price paid by editing the form.
export const FEE_SCHEDULE: Record<FeeCategory, FeeDefinition> = {
  EARLY_BIRD: { label: "Early bird", amount: 30000, currency: "NGN" },
  REGULAR: { label: "Regular", amount: 40000, currency: "NGN" },
  STUDENT_EARLY_BIRD: { label: "Student early bird", amount: 10000, currency: "NGN" },
  STUDENT_REGULAR: { label: "Student regular", amount: 20000, currency: "NGN" },
  INTERNATIONAL: { label: "International participant", amount: 50, currency: "USD" },
};

export function isFeeCategory(value: string): value is FeeCategory {
  return value in FEE_SCHEDULE;
}
