import { buildTimeline, computeStatus } from "@/lib/timeline";

export function DatesSection({ abstractOpensAt, abstractClosesAt }: { abstractOpensAt: string; abstractClosesAt: string }) {
  const phases = buildTimeline(abstractOpensAt, abstractClosesAt);
  const now = new Date();

  return (
    <section id="dates">
      <div className="wrap">
        <div className="section-head">
          <div className="eyebrow">III. Key Dates</div>
          <h2>Timeline to the conference</h2>
          <p>
            Status updates automatically against today&apos;s date. The Secretariat can extend the abstract
            deadline from the admin panel without a developer.
          </p>
        </div>
        <div className="timeline">
          {phases.map((phase) => {
            const status = computeStatus(phase, now);
            return (
              <div className="tl-row" key={phase.title}>
                <div className="phase">
                  {phase.title}
                  <span className="sub">{phase.sub}</span>
                </div>
                <div className="date tnum">{phase.dateLabel}</div>
                <div className={`status-chip ${status}`}>
                  {status === "open" ? "Open" : status === "closed" ? "Closed" : "Upcoming"}
                </div>
              </div>
            );
          })}
        </div>
        <p className="fee-note">
          Provisional dates for early bird and regular registration cutoffs are shown above and should be
          confirmed by the Secretariat before launch.
        </p>
      </div>
    </section>
  );
}
