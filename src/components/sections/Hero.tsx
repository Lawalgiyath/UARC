import Link from "next/link";
import { Countdown } from "@/components/Countdown";

const TOC = [
  { num: "I", label: "Conference Theme", pg: "Theme", href: "/about" },
  { num: "II", label: "Subthemes", pg: "8 tracks", href: "/about#subthemes" },
  { num: "III", label: "Key Dates", pg: "Timeline", href: "/dates-and-fees" },
  { num: "IV", label: "Registration Fees", pg: "Pricing", href: "/dates-and-fees#fees" },
  { num: "V", label: "Submit an Abstract", pg: "Portal", href: "/submit" },
  { num: "VI", label: "Register & Pay", pg: "Portal", href: "/register" },
  { num: "VII", label: "Past Editions", pg: "Archive", href: "/past-editions" },
  { num: "VIII", label: "Committee", pg: "Roles", href: "/committee" },
  { num: "IX", label: "Questions", pg: "FAQ", href: "/faq" },
];

export function Hero({ abstractDeadlineIso }: { abstractDeadlineIso: string }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <div className="edition-badge">19th Edition <strong className="mono">&middot;</strong> October 20&ndash;22, 2026</div>
          <h1 className="headline">
            Sustainable Frontiers: integrating systems for{" "}
            <span className="theme-word">food security, health, housing</span> and humanity
          </h1>
          <p className="dek">
            The University of Lagos convenes researchers, policymakers and practitioners to confront global
            challenges through eight interdisciplinary tracks, from biotechnology to social policy. Held in
            person at the Jelili Adebisi Omotola Hall.
          </p>
          <div className="hero-ctas">
            <Link className="btn solid" href="/submit">Submit an Abstract</Link>
            <Link className="btn ghost" href="/register">Register &amp; Pay</Link>
          </div>
          <div className="ledger-strip">
            <div><span className="k">Dates</span><span className="v tnum">Oct 20&ndash;22, 2026</span></div>
            <div><span className="k">Venue</span><span className="v">Omotola Hall, UNILAG</span></div>
            <div><span className="k">Format</span><span className="v">In person, 3 days</span></div>
          </div>
          <Countdown deadlineIso={abstractDeadlineIso} label="Time remaining to submit an abstract" />
        </div>
        <div className="contents-box">
          <div className="head">In this edition</div>
          <ol>
            {TOC.map((item) => (
              <li key={item.num}>
                <Link href={item.href}>
                  <span className="num">{item.num}</span>
                  <span>{item.label}</span>
                  <span className="leader" />
                  <span className="pg">{item.pg}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
