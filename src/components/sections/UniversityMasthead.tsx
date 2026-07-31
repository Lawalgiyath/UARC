import Link from "next/link";
import { UnilagLogo } from "@/components/UnilagLogo";
import { PhotoFrame } from "@/components/PhotoFrame";
import { IconPattern } from "@/components/IconPattern";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { CAMPUS_PHOTOS } from "@/lib/media";
import { UNIVERSITY, UNIVERSITY_FACTS } from "@/lib/university";
import { CRC } from "@/lib/conference";

// The university comes before the conference.
//
// The Secretariat's first instruction was "about the unilag right from the
// top": a visitor should land on the University of Lagos, at full crest size,
// and only then be told what it is convening. Everything about this block is
// the institution, not the event.

export function UniversityMasthead() {
  return (
    <section className="masthead">
      <IconPattern variant="dense" opacity={0.045} className="masthead-pattern" />

      <div className="wrap masthead-grid">
        <div className="masthead-body">
          <div className="masthead-crest">
            <UnilagLogo height={92} variant="plate" />
          </div>

          <h1 className="masthead-title">{UNIVERSITY.name}</h1>
          <p className="masthead-motto">
            <span className="mono">{UNIVERSITY.motto}</span>
            <span className="sep">&middot;</span>
            {UNIVERSITY.epithet}
          </p>

          <p className="masthead-summary">{UNIVERSITY.summary}</p>
          <p className="masthead-detail">{UNIVERSITY.detail}</p>

          <div className="fact-row">
            {UNIVERSITY_FACTS.map((fact) => (
              <div className="fact" key={fact.label}>
                <AcademicIcon name={fact.icon} size={22} className="fact-icon" />
                <div>
                  <div className="n tnum">{fact.value}</div>
                  <div className="l">
                    {fact.label}
                    {fact.asOf && <span className="as-of"> (as of {fact.asOf})</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="masthead-links">
            <a className="btn ghost small" href={UNIVERSITY.website} rel="noreferrer">
              unilag.edu.ng
            </a>
            <Link className="btn ghost small" href="/about">
              About this conference
            </Link>
          </div>
        </div>

        <div className="masthead-figure">
          <PhotoFrame
            photo={CAMPUS_PHOTOS.senateBuilding}
            caption="The Senate Building, University of Lagos, Akoka."
            sizes="(max-width: 980px) 100vw, 34vw"
            priority
          />
          <div className="crc-plate">
            <div className="crc-abbr mono">{CRC.abbr}</div>
            <div>
              <div className="crc-name">{CRC.name}</div>
              <p>{CRC.blurb}</p>
              <p className="crc-chair">Chaired by the {CRC.chairRole}.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
