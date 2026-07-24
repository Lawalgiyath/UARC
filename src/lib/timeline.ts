export type PhaseStatus = "open" | "closed" | "upcoming";

export interface TimelinePhase {
  title: string;
  sub: string;
  dateLabel: string;
  opensAt: string;
  closesAt: string;
}

export function computeStatus(phase: TimelinePhase, now: Date = new Date()): PhaseStatus {
  const opens = new Date(phase.opensAt);
  const closes = new Date(phase.closesAt);
  if (now < opens) return "upcoming";
  if (now > closes) return "closed";
  return "open";
}

// Fixed milestones from the conference flyer, plus two provisional registration
// cutoffs the Secretariat should confirm before launch (flagged in the UI note).
export const FIXED_PHASES: Omit<TimelinePhase, "opensAt" | "closesAt">[] = [
  { title: "Review and notification of acceptance", sub: "Decisions sent by email with reference code", dateLabel: "Mon, 21 Sep 2026" },
  { title: "Early bird registration", sub: "Discounted fee, see pricing below", dateLabel: "Closes 25 Sep 2026" },
  { title: "Regular registration", sub: "Standard fee applies", dateLabel: "Closes 16 Oct 2026" },
  { title: "Conference sessions", sub: "Jelili Adebisi Omotola Hall, UNILAG", dateLabel: "20 - 22 Oct 2026" },
];

export function buildTimeline(abstractOpensAt: string, abstractClosesAt: string): TimelinePhase[] {
  return [
    {
      title: "Abstract submission window",
      sub: "Open now through the portal below",
      dateLabel: "15 Jun - 24 Aug 2026",
      opensAt: abstractOpensAt,
      closesAt: abstractClosesAt,
    },
    { ...FIXED_PHASES[0], opensAt: "2026-08-25T00:00:00+01:00", closesAt: "2026-09-21T23:59:00+01:00" },
    { ...FIXED_PHASES[1], opensAt: "2026-06-15T00:00:00+01:00", closesAt: "2026-09-25T23:59:00+01:00" },
    { ...FIXED_PHASES[2], opensAt: "2026-09-26T00:00:00+01:00", closesAt: "2026-10-16T23:59:00+01:00" },
    { ...FIXED_PHASES[3], opensAt: "2026-10-20T00:00:00+01:00", closesAt: "2026-10-22T23:59:00+01:00" },
  ];
}
