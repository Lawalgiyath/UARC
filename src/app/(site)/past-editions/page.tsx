import Image from "next/image";
import type { Metadata } from "next";
import { AcademicVine } from "@/components/AcademicVine";
import { CAMPUS_PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Past Editions | 19th UNILAG Annual Research Conference",
};

const EDITIONS = [
  {
    ordinal: "18th",
    year: "2025",
    dates: "October 15-17, 2025",
    theme: "The Future of Work, Education and Wellbeing in the AI Age",
    summary:
      "Organised into six subtheme tracks spanning education, environmental monitoring, business, and public health, with oral and poster sessions across the sciences and humanities. Over 120 participants attended. Professor Solomon Okunuga, Chairman of the Conference Planning Committee and Director of the Research Management Office, delivered the official communique, and Professor Bola Oboh, Deputy Vice-Chancellor (Academic and Research), gave the closing remarks.",
    photo: CAMPUS_PHOTOS.library,
    sourceLabel: "unilag.edu.ng",
    sourceUrl:
      "https://unilag.edu.ng/unilags-18th-annual-research-conference-ends-showcasing-ais-transformative-power-across-disciplines/",
  },
  {
    ordinal: "17th",
    year: "2024",
    dates: "October 22-24, 2024",
    theme: "Digital Transformation for Inclusive Higher Education",
    summary:
      "Held at the Tayo Aderinokun Hall alongside the university's 4th International Week, themed \"Inclusive Digital Transformation and the University Promise.\" Abstract submission closed August 23, 2024, with full papers due September 20, 2024.",
    photo: CAMPUS_PHOTOS.jpClarkCenter,
    sourceLabel: "conference.unilag.edu.ng",
    sourceUrl: "https://conference.unilag.edu.ng/",
  },
  {
    ordinal: "16th",
    year: "2023",
    dates: "October 10-12, 2023",
    theme: "Unlocking the Future: Rethinking Higher Education",
    summary:
      "An international conference of the humanities and sciences, closing with a communique from the Local Organising Committee summarising the conference's recommendations to the university.",
    photo: CAMPUS_PHOTOS.sofoluwePark,
    sourceLabel: "unilag.edu.ng",
    sourceUrl:
      "https://unilag.edu.ng/communique-of-the-16th-university-of-lagos-annual-research-conference-and-fair-an-international-conference-of-the-humanities-and-sciences-held-on-10th-12th-october-2023/",
  },
];

export default function PastEditionsPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">The Archive</div>
          <h1 style={{ fontFamily: "'Iowan Old Style', Palatino, Georgia, serif", fontSize: "clamp(1.9rem, 1.5rem + 1.6vw, 2.75rem)", marginTop: "0.6rem" }}>
            Past editions
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.9rem", fontSize: "1.0625rem", maxWidth: "44rem" }}>
            A running record of prior conferences, each held on the University of Lagos campus. Campus
            photography below illustrates the setting rather than the specific event.
          </p>
        </div>
      </section>

      <section style={{ position: "relative" }}>
        <div className="wrap">
          <div className="past-grid">
            {EDITIONS.map((ed) => (
              <div className="past-card" key={ed.ordinal}>
                <div className="plate">
                  <Image src={ed.photo.src} width={ed.photo.width} height={ed.photo.height} alt={ed.photo.alt} sizes="(max-width: 600px) 100vw, 33vw" />
                </div>
                <div className="body">
                  <div className="yr tnum">{ed.ordinal} Edition &middot; {ed.year}</div>
                  <h3>{ed.theme}</h3>
                  <p>{ed.summary}</p>
                  <p className="photo-credit-list">
                    Source: <a href={ed.sourceUrl}>{ed.sourceLabel}</a>. Campus photo by{" "}
                    <a href={ed.photo.sourceUrl}>{ed.photo.credit}</a>, CC BY-SA 4.0.
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="archive-note">
            The 19th edition will be added to this archive after the conference concludes in October 2026,
            drawing on the same submissions and registrations recorded through this site.
          </p>
        </div>
        <AcademicVine variant="corner" className="vine-corner bottom-right" />
      </section>
    </>
  );
}
