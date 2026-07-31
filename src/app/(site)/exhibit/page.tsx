import type { Metadata } from "next";
import Image from "next/image";
import { ExhibitorApply } from "@/components/sections/ExhibitorApply";
import { IconPattern } from "@/components/IconPattern";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import { getPublicExhibitors, getExhibitAvailability } from "@/lib/publicData";
import { EXHIBITION } from "@/lib/exhibition";
import { CONFERENCE, CONTACT } from "@/lib/conference";

export const metadata: Metadata = {
  title: "Exhibition Stands | 19th UNILAG Annual Research Conference",
  description:
    "Apply for an exhibition stand at the research fair alongside the 19th UNILAG Annual Research Conference, and pay online.",
};

export const dynamic = "force-dynamic";

const SCHEDULE = [
  { label: "Build up", value: EXHIBITION.buildUp, icon: "calendar" as const },
  { label: "Open to delegates", value: EXHIBITION.open, icon: "booth" as const },
  { label: "Break down", value: EXHIBITION.breakDown, icon: "calendar" as const },
  { label: "Applications close", value: EXHIBITION.applicationCloses, icon: "ticket" as const },
];

export default async function ExhibitPage() {
  const [exhibitors, taken] = await Promise.all([getPublicExhibitors(), getExhibitAvailability()]);

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Research fair</div>
          <h1 className="page-title">Exhibition stands</h1>
          <p className="page-lede">
            The research fair runs alongside all three days of the {CONFERENCE.edition}{" "}
            {CONFERENCE.name}, on the concourse the delegates walk through between every session.
            Stands are open to firms, publishers, funders, university departments and student
            research teams.
          </p>
        </div>
      </section>

      <section className="schedule-section">
        <IconPattern variant="dense" opacity={0.05} className="section-pattern" />
        <div className="wrap">
          <ul className="schedule-row">
            {SCHEDULE.map((item) => (
              <li key={item.label}>
                <AcademicIcon name={item.icon} size={20} />
                <div>
                  <div className="k">{item.label}</div>
                  <div className="v">{item.value}</div>
                </div>
              </li>
            ))}
          </ul>
          <p className="schedule-note">
            Venue: {EXHIBITION.venue}. Stands are allocated in order of confirmed payment, and stand
            numbers are issued by the Secretariat two weeks before build up.
          </p>
        </div>
      </section>

      {exhibitors.length > 0 && (
        <section id="directory">
          <div className="wrap">
            <div className="section-head">
              <div className="eyebrow">Who is exhibiting</div>
              <h2>Exhibitor directory</h2>
              <p>
                Confirmed exhibitors for this edition. The directory is also printed in the delegate
                pack with a floor plan.
              </p>
            </div>
            <ul className="exhibitor-list">
              {exhibitors.map((exhibitor) => (
                <li key={exhibitor.id}>
                  {exhibitor.logoUrl ? (
                    <Image
                      src={exhibitor.logoUrl}
                      alt={exhibitor.organisation}
                      width={160}
                      height={64}
                      className="exhibitor-logo"
                    />
                  ) : (
                    <span className="exhibitor-mark">
                      <AcademicIcon name="booth" size={22} />
                    </span>
                  )}
                  <div>
                    <h3>
                      {exhibitor.websiteUrl ? (
                        <a href={exhibitor.websiteUrl} target="_blank" rel="noreferrer noopener">
                          {exhibitor.organisation}
                        </a>
                      ) : (
                        exhibitor.organisation
                      )}
                    </h3>
                    <div className="exhibitor-meta mono">
                      {exhibitor.standNumber ? `Stand ${exhibitor.standNumber}` : "Stand to be allocated"}
                      <span className="sep">&middot;</span>
                      {exhibitor.packageKey}
                    </div>
                    {exhibitor.description && <p>{exhibitor.description}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Apply</div>
            <h2>Book a stand</h2>
            <p>
              Stands are finite, so the counts below are live: a package that reads as fully booked
              has no space left, and the Secretariat keeps a waiting list. Pay online now, or ask for
              an invoice and your stand is held for fourteen days.
            </p>
          </div>

          <ExhibitorApply taken={taken} />

          <p className="archive-note">
            Bringing something that needs three phase power, a vehicle, or space taller than two
            metres? Write to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> before applying
            so the fair floor can be planned around it.
          </p>
        </div>
      </section>
    </>
  );
}
