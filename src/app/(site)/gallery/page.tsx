import type { Metadata } from "next";
import { ConferenceGallery } from "@/components/ConferenceGallery";
import { AcademicVine } from "@/components/AcademicVine";
import { CONFERENCE_NEWS_INFO } from "@/lib/conferencePhotos";

export const metadata: Metadata = {
  title: "Photo Gallery | 19th UNILAG Annual Research Conference",
  description:
    "Explore official high-resolution photographs from the 19th UNILAG Annual Research Conference at Jelili Adebisi Omotola Hall.",
};

export default function GalleryPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">19th Edition &middot; October 2026</div>
          <h1
            style={{
              fontFamily: "'Iowan Old Style', Palatino, Georgia, serif",
              fontSize: "clamp(2rem, 1.6rem + 1.8vw, 2.9rem)",
              marginTop: "0.6rem",
              lineHeight: 1.15,
            }}
          >
            Conference Photo Gallery
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.9rem",
              fontSize: "1.0625rem",
              maxWidth: "46rem",
              lineHeight: 1.6,
            }}
          >
            Moments, deliberations, and dignitaries from the 19th UNILAG Annual Research Conference,
            held at the Jelili Adebisi Omotola Hall, University of Lagos.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: "2.5rem", paddingBottom: "4.5rem" }}>
        <div className="wrap">
          {/* Editorial News Highlight Card */}
          <div className="gallery-news-card">
            <div className="gallery-news-badge">Conference Feature</div>
            <h3>Gambian Varsity VC Applauds UNILAG’s Milestone in Entrepreneurship Education</h3>
            <p>
              The Vice-Chancellor of the University of Applied Science, Engineering and Technology
              (USET), The Gambia, <strong>Professor Nazmat Toyin Surajudeen-Bakinde</strong>, delivered
              the keynote plenary lecture, commending UNILAG’s Entrepreneurship, Innovation and
              Business Incubation Certification (EIBIC) programme adopted as a national model. She was
              welcomed by Deputy Vice-Chancellor (Management Services), <strong>Professor Muyiwa Falaiye</strong>,
              representing Vice-Chancellor <strong>Professor Folasade Ogunsola, FAS</strong>, along with
              faculty deans, directors, and scholars.
            </p>
            <div className="gallery-news-footer">
              <span>
                Photography by <strong>{CONFERENCE_NEWS_INFO.photoCredit}</strong> &middot; Report by {CONFERENCE_NEWS_INFO.reportBy}
              </span>
              <a
                href={CONFERENCE_NEWS_INFO.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="gallery-source-link"
              >
                Read full UNILAG report &rarr;
              </a>
            </div>
          </div>

          <div style={{ margin: "2rem 0" }}>
            <AcademicVine variant="horizontal" className="vine-horizontal" />
          </div>

          {/* Interactive Filterable Gallery */}
          <ConferenceGallery />
        </div>
      </section>
    </>
  );
}
