import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { CONFERENCE } from "@/lib/conference";
import type { AcademicIconName } from "@/components/icons/AcademicIcons";

const TOC: { num: string; label: string; pg: string; href: string; icon: AcademicIconName }[] = [
  { num: "I", label: "Conference Theme", pg: "Theme", href: "/about", icon: "book" },
  { num: "II", label: "Subthemes", pg: "8 tracks", href: "/about#subthemes", icon: "laurel" },
  { num: "III", label: "Key Dates", pg: "Timeline", href: "/dates-and-fees", icon: "calendar" },
  { num: "IV", label: "Registration Fees", pg: "Pricing", href: "/dates-and-fees#fees", icon: "ticket" },
  { num: "V", label: "Submit an Abstract", pg: "Portal", href: "/submit", icon: "upload" },
  { num: "VI", label: "Register & Pay", pg: "Portal", href: "/register", icon: "users" },
  { num: "VII", label: "Sponsorship", pg: "Tiers", href: "/sponsors", icon: "handshake" },
  { num: "VIII", label: "Exhibition Stands", pg: "Fair", href: "/exhibit", icon: "booth" },
  { num: "IX", label: "Accommodation", pg: "Hotels", href: "/accommodation", icon: "bed" },
  { num: "X", label: "Certificates", pg: "Issue & verify", href: "/certificates", icon: "seal" },
];

export function Hero({ abstractDeadlineIso }: { abstractDeadlineIso: string }) {
  return (
    <section className="hero">
      <div className="wrap hero-grid">
        <div>
          <div className="edition-badge">
            {CONFERENCE.edition} Edition <strong className="mono">&middot;</strong> {CONFERENCE.dates}
          </div>
          {/* The caption the Secretariat asked to sit directly under the
              "19th Edition" line, before the theme itself. */}
          <p className="edition-caption">{CONFERENCE.editionCaption}</p>

          <div className="theme-label eyebrow">Conference theme</div>
          <h2 className="headline">
            Sustainable Frontiers: integrating systems for{" "}
            <span className="theme-word">food security, health, housing</span> and humanity for
            combating global challenges
          </h2>
          <p className="dek">
            The University of Lagos convenes researchers, policymakers and practitioners to confront
            global challenges through eight interdisciplinary tracks, from biotechnology to social
            policy. Held in person at the {CONFERENCE.venue}.
          </p>
          <div className="hero-ctas">
            <Link className="btn solid" href="/submit">
              Submit an Abstract
            </Link>
            <Link className="btn ghost" href="/register">
              Register &amp; Pay
            </Link>
          </div>
          <div className="ledger-strip">
            <div>
              <span className="k">Dates</span>
              <span className="v tnum">{CONFERENCE.datesShort}</span>
            </div>
            <div>
              <span className="k">Venue</span>
              <span className="v">Omotola Halls, UNILAG</span>
            </div>
            <div>
              <span className="k">Starts</span>
              <span className="v">{CONFERENCE.dailyStart}</span>
            </div>
            <div>
              <span className="k">Format</span>
              <span className="v">In person, 3 days</span>
            </div>
          </div>
          <Countdown deadlineIso={abstractDeadlineIso} label="Time remaining to submit an abstract" />
        </div>

        <div className="contents-box">
          <div className="head">In this edition</div>
          <ol>
            {TOC.map((item) => (
              <li key={item.num}>
                <Link href={item.href}>
                  <AcademicIcon name={item.icon} size={16} className="toc-icon" />
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
