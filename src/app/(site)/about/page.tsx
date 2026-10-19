import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Subthemes } from "@/components/sections/Subthemes";
import { AcademicVine } from "@/components/AcademicVine";
import { CAMPUS_PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Theme and Subthemes | 19th UNILAG Annual Research Conference",
};

export default function AboutPage() {
  const photo = CAMPUS_PHOTOS.senateBuilding;

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Conference Theme</div>
          <h1 style={{ fontFamily: "'Iowan Old Style', Palatino, Georgia, serif", fontSize: "clamp(1.9rem, 1.5rem + 1.6vw, 2.75rem)", marginTop: "0.6rem" }}>
            Sustainable Frontiers
          </h1>
        </div>
      </section>

      <section>
        <div className="wrap editorial-grid">
          <div>
            <AcademicVine variant="horizontal" className="vine-horizontal vine-slot" />
            <h2 style={{ marginBottom: "1rem" }}>Why this theme, why now</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.0625rem", marginBottom: "1rem" }}>
              Food systems, public health, housing and human security are converging crises rather than
              separate fields. The 19th edition asks researchers across the sciences, humanities and policy
              schools to bring evidence to bear on problems that no single discipline can solve alone, and to
              publish that evidence where it can be used.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "1.0625rem" }}>
              Sessions run across three days at the Jelili Adebisi Omotola Hall, organised into eight
              subtheme tracks below. Abstracts accepted for oral presentation will be considered for
              publication in the University of Lagos Journals.
            </p>
            <div className="stat-row">
              <div><div className="n tnum">19th</div><div className="l">Edition since inception</div></div>
              <div><div className="n tnum">8</div><div className="l">Subtheme tracks</div></div>
              <div><div className="n tnum">3</div><div className="l">Days of sessions</div></div>
              <div><div className="n tnum">2</div><div className="l">Unilag Journals open to accepted abstracts</div></div>
            </div>
          </div>
          <figure>
            <Image src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} sizes="(max-width: 920px) 100vw, 40vw" />
            <figcaption className="photo-credit-list">
              The Senate Building, University of Lagos. Photo by <a href={photo.sourceUrl}>{photo.credit}</a>, CC BY-SA 4.0.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 19th Edition Plenary Lecture Spotlight */}
      <section style={{ background: "var(--bg-raised)" }}>
        <div className="wrap editorial-grid" style={{ alignItems: "center" }}>
          <figure>
            <Image
              src="/images/conference-2026/thumbs/MG_0895.jpg"
              width={2100}
              height={1179}
              alt="Prof. Nazmat Toyin Surajudeen-Bakinde delivering the 19th UARC Plenary Address"
              sizes="(max-width: 920px) 100vw, 45vw"
              style={{ border: "1px solid var(--line-strong)", borderRadius: "4px" }}
            />
            <figcaption className="photo-credit-list">
              Prof. Nazmat Toyin Surajudeen-Bakinde (VC, USET The Gambia) presenting at Jelili Omotola Hall. Photo: Michael Joshua / UNILAG Communication Unit.
            </figcaption>
          </figure>
          <div>
            <div className="eyebrow">19th Edition Plenary Address</div>
            <h2 style={{ marginBottom: "1rem", marginTop: "0.5rem" }}>
              The Role of Engineering, Innovation &amp; Universities in Tackling Global Challenges
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.0625rem", marginBottom: "1rem" }}>
              Delivered by the Vice-Chancellor of the University of Applied Science, Engineering and
              Technology (USET), The Gambia, <strong>Professor Nazmat Toyin Surajudeen-Bakinde</strong>.
              During the plenary presentation, she commended UNILAG for institutionalising entrepreneurship
              certification through the EIBIC model, advocating for deeper integration of engineering education
              with enterprise solutions across Africa.
            </p>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
              <Link href="/gallery" className="btn solid small">
                Explore Conference Photo Gallery &rarr;
              </Link>
              <a
                href="https://unilag.edu.ng/19th-unilag-research-conference-gambian-varsity-vc-applauds-unilags-milestone-in-entrepreneurship-education/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn ghost small"
              >
                Read Official UNILAG Report
              </a>
            </div>
          </div>
        </div>
      </section>

      <Subthemes />
    </>
  );
}
