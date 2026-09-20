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

// Early bird registration and abstract submission were both extended to Monday
// 14 September 2026. Notification of acceptance is Monday 21 September 2026,
// the date given on the Secretariat's flyer of 18 September. That leaves one
// week between the close of submissions and the decisions going out, which is
// tight for peer review; the Secretariat has been asked to confirm it.
//
// The regular registration cutoff below is still provisional and is flagged as
// such in the UI note on the dates page.
export const FIXED_PHASES: Omit<TimelinePhase, "opensAt" | "closesAt">[] = [
  { title: "Notification of acceptance", sub: "Decisions sent by email with reference code", dateLabel: "21 Sep 2026" },
  { title: "Early bird registration", sub: "Discounted fee, see pricing below", dateLabel: "Closes 14 Sep 2026" },
  { title: "Regular registration", sub: "Standard fee applies", dateLabel: "Closes 10 Oct 2026" },
  { title: "Conference sessions", sub: "Jelili Adebisi Omotola Hall, UNILAG", dateLabel: "14 to 16 Oct 2026" },
];

export function buildTimeline(abstractOpensAt: string, abstractClosesAt: string): TimelinePhase[] {
  return [
    {
      title: "Abstract submission window",
      sub: "Open now through the portal below",
      dateLabel: "15 Jun - 14 Sep 2026",
      opensAt: abstractOpensAt,
      closesAt: abstractClosesAt,
    },
    { ...FIXED_PHASES[0], opensAt: "2026-09-15T00:00:00+01:00", closesAt: "2026-09-21T23:59:00+01:00" },
    { ...FIXED_PHASES[1], opensAt: "2026-06-15T00:00:00+01:00", closesAt: "2026-09-14T23:59:00+01:00" },
    { ...FIXED_PHASES[2], opensAt: "2026-09-15T00:00:00+01:00", closesAt: "2026-10-10T23:59:00+01:00" },
    { ...FIXED_PHASES[3], opensAt: "2026-10-14T00:00:00+01:00", closesAt: "2026-10-16T23:59:00+01:00" },
  ];
}
