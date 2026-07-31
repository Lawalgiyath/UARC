import type { FeeCategory } from "@/lib/pricing";

// Student verification.
//
// The student rate is a third of the regular one, so it needs a check, but the
// check has to be one a genuine student from any institution can pass at 11pm
// the night before the deadline. The compromise: an institutional email
// address and a student number are required at the point of registration, an
// address on a recognisably academic domain clears automatically, and anything
// else goes to the Secretariat for a look. Nobody is turned away by the form —
// they are queued.
//
// Physical ID is still checked at the registration desk. This system exists to
// stop casual abuse of the discount and to give the Secretariat a worklist,
// not to be the last line of defence.

export const STUDENT_CATEGORIES: FeeCategory[] = ["STUDENT_EARLY_BIRD", "STUDENT_REGULAR"];

export function requiresStudentVerification(category: FeeCategory): boolean {
  return STUDENT_CATEGORIES.includes(category);
}

/**
 * Academic domain suffixes recognised worldwide. `.edu` covers the United
 * States; the `ac`/`edu` second level pattern covers Nigeria (unilag.edu.ng),
 * the United Kingdom (.ac.uk), South Africa (.ac.za), India, Japan and most
 * of the Commonwealth.
 */
const ACADEMIC_SUFFIX = /(?:\.edu|\.(?:ac|edu)\.[a-z]{2,3})$/i;

/** Institutions whose addresses we know, listed to keep the common case fast. */
const KNOWN_ACADEMIC_DOMAINS = new Set([
  "unilag.edu.ng",
  "live.unilag.edu.ng",
  "student.unilag.edu.ng",
]);

export function isAcademicEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1];
  if (!domain) return false;
  if (KNOWN_ACADEMIC_DOMAINS.has(domain)) return true;
  return ACADEMIC_SUFFIX.test(domain);
}

/**
 * A student number is six to twenty characters of letters, digits, slashes and
 * hyphens: loose enough for the formats used across Nigerian and foreign
 * institutions, tight enough to reject someone typing "n/a".
 */
const STUDENT_ID = /^[A-Z0-9][A-Z0-9/\-.]{4,19}$/i;

export function isPlausibleStudentId(value: string): boolean {
  const trimmed = value.trim();
  if (!STUDENT_ID.test(trimmed)) return false;
  // Reject strings with no digit at all: every matriculation scheme we have
  // seen numbers its students somehow.
  return /\d/.test(trimmed);
}

export type StudentCheckOutcome =
  | { status: "NOT_REQUIRED" }
  | { status: "INVALID"; error: string }
  | { status: "VERIFIED"; reason: string }
  | { status: "PENDING"; reason: string };

/**
 * Decides what happens to a student claim at the moment of registration.
 * Returns INVALID only when the form is unusable; a claim that simply cannot
 * be auto-cleared comes back PENDING, and the delegate still completes payment.
 */
export function checkStudentClaim(input: {
  category: FeeCategory;
  studentIdNumber?: string | null;
  studentInstitutionEmail?: string | null;
}): StudentCheckOutcome {
  if (!requiresStudentVerification(input.category)) return { status: "NOT_REQUIRED" };

  const id = (input.studentIdNumber || "").trim();
  const email = (input.studentInstitutionEmail || "").trim();

  if (!id || !email) {
    return {
      status: "INVALID",
      error:
        "Student rates need your matriculation or student number and your institutional email address.",
    };
  }

  if (!isPlausibleStudentId(id)) {
    return {
      status: "INVALID",
      error: "That does not look like a matriculation or student number. Please check and try again.",
    };
  }

  if (isAcademicEmail(email)) {
    return {
      status: "VERIFIED",
      reason: `Cleared automatically: ${email.split("@")[1]} is a recognised academic domain. Student ID is still checked at the registration desk.`,
    };
  }

  return {
    status: "PENDING",
    reason:
      "Held for review: the address given is not on a recognised academic domain. The Secretariat will confirm the claim, usually within two working days.",
  };
}

export const STUDENT_VERIFICATION_COPY = {
  heading: "Student verification",
  intro:
    "Student rates are checked. Give the matriculation or student number on your ID card and the email address your institution issued you.",
  autoCleared:
    "Institutional addresses (unilag.edu.ng, any .edu or .ac address) clear immediately. Anything else is reviewed by the Secretariat, usually within two working days, and you will still be able to pay now.",
  atTheDesk:
    "Bring your student ID card to the registration desk. Delegates who cannot show a valid card are asked to pay the difference up to the regular rate.",
};
