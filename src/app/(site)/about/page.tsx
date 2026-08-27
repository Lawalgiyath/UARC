import type { Metadata } from "next";
import Link from "next/link";
import { Subthemes } from "@/components/sections/Subthemes";
import { AcademicVine } from "@/components/AcademicVine";
import { PhotoFrame } from "@/components/PhotoFrame";
import { IconPattern } from "@/components/IconPattern";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { CAMPUS_PHOTOS } from "@/lib/media";
import { AUTHOR_PROMISES, VISIBILITY_CHANNELS } from "@/lib/university";
import { CONFERENCE, HIGHLIGHTS } from "@/lib/conference";

export const metadata: Metadata = {
  title: "Theme and Subthemes | 19th UNILAG Annual Research Conference",
  description:
    "The theme of the 19th UNILAG Annual Research Conference, the eight subtheme tracks, what the conference promises authors, and where accepted work is published.",
};

export default function AboutPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Conference Theme</div>
          <h1 className="page-title">{CONFERENCE.themeShort}</h1>
          <p className="page-lede">{CONFERENCE.theme}</p>
        </div>
      </section>

      <section>
        <div className="wrap editorial-grid">
          <div>
            <AcademicVine variant="horizontal" className="vine-horizontal vine-slot" />
            <h2>Why this theme, why now</h2>
            <p className="editorial-para">
              Food systems, public health, housing and human security are converging crises rather
              than separate fields. The {CONFERENCE.edition} edition asks researchers across the
              sciences, humanities and policy schools to bring evidence to bear on problems that no
              single discipline can solve alone, and to publish that evidence where it can be used.
            </p>
            <p className="editorial-para">
              Sessions run across three days at the {CONFERENCE.venue}, organised into the eight
              subtheme tracks set out below. A research fair runs alongside the sessions for all
              three days, so work in progress and commercial research have somewhere to stand too.
            </p>
            <div className="stat-row">
              <div>
                <div className="n tnum">19th</div>
                <div className="l">Edition since inception</div>
              </div>
              <div>
                <div className="n tnum">8</div>
                <div className="l">Subtheme tracks</div>
              </div>
              <div>
                <div className="n tnum">3</div>
                <div className="l">Days of sessions</div>
              </div>
              <div>
                <div className="n tnum">2</div>
                <div className="l">UNILAG journals open to accepted abstracts</div>
              </div>
            </div>
          </div>
          <PhotoFrame
            photo={CAMPUS_PHOTOS.senateArchitectural}
            caption="The Senate Building, University of Lagos."
            sizes="(max-width: 920px) 100vw, 40vw"
          />
        </div>
      </section>

      {/* What an author gets in return for the work of writing and presenting.
          Asked for as "a kind of a promise for those submitting papers". */}
      <section id="promise" className="promise-section">
        <IconPattern variant="dense" opacity={0.06} className="section-pattern" />
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Our undertaking to authors</div>
            <h2>What you get for submitting</h2>
            <p>
              Submitting a paper costs you weeks of work, so this is what the conference commits to
              in return. These are not aspirations: each one is something the Secretariat is
              accountable for, and the dates are the ones published in the call for abstracts.
            </p>
          </div>

          <ol className="promise-list">
            {AUTHOR_PROMISES.map((promise, index) => (
              <li className="promise-item" key={promise.title}>
                <span className="promise-index mono">{String(index + 1).padStart(2, "0")}</span>
                <span className="promise-icon">
                  <AcademicIcon name={promise.icon} size={24} />
                </span>
                <div>
                  <h3>{promise.title}</h3>
                  <p>{promise.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="promise-cta">
            <Link className="btn solid" href="/submit">
              Submit an abstract
            </Link>
            <span className="promise-deadline">
              Abstracts close {CONFERENCE.abstractDeadlineLabel}. Decisions by 21 September 2026.
            </span>
          </div>
        </div>
      </section>

      {/* The visibility question, answered explicitly. */}
      <section id="visibility">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Visibility</div>
            <h2>Where your work surfaces afterwards</h2>
            <p>
              A conference presentation that ends when the session ends is a poor return on a
              research project. Work presented here reaches print, policy and the public record
              through five separate channels, and every one of them stays online under the
              university&rsquo;s own domain.
            </p>
          </div>

          <ul className="visibility-list">
            {VISIBILITY_CHANNELS.map((channel) => (
              <li key={channel.label}>
                <span className="visibility-icon">
                  <AcademicIcon name={channel.icon} size={22} />
                </span>
                <div>
                  <h3>{channel.label}</h3>
                  <p>{channel.body}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="archive-note">
            Presenting does not transfer copyright. Authors keep their work, and publication in a
            UNILAG journal follows that journal&rsquo;s own peer review, on its own timetable.
          </p>
        </div>
      </section>

      <section id="highlights" className="highlights-section">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Alongside the papers</div>
            <h2>Conference highlights</h2>
            <p className="section-lede">{CONFERENCE.openTo}</p>
          </div>
          <div className="highlight-grid">
            {HIGHLIGHTS.map((h) => (
              <article className="highlight-card" key={h.title}>
                <span className="highlight-icon">
                  <AcademicIcon name={h.icon} size={26} />
                </span>
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Subthemes />
    </>
  );
}
