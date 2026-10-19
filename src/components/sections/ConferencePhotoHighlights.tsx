import Image from "next/image";
import Link from "next/link";
import { FEATURED_HOMEPAGE_PHOTOS } from "@/lib/conferencePhotos";
import { AcademicVine } from "@/components/AcademicVine";

export function ConferencePhotoHighlights() {
  const previewPhotos = FEATURED_HOMEPAGE_PHOTOS.slice(0, 6);

  return (
    <section className="conference-highlights-section">
      <div className="wrap">
        <div className="highlights-header">
          <div>
            <div className="eyebrow">Moments from the 19th Edition</div>
            <h2>Conference Photo Highlights</h2>
            <p>
              Glimpses of plenary addresses, academic leadership, and cross-disciplinary
              collaboration at Jelili Adebisi Omotola Hall.
            </p>
          </div>
          <div className="highlights-header-cta">
            <Link href="/gallery" className="btn solid">
              View All 26 Photos &rarr;
            </Link>
          </div>
        </div>

        <AcademicVine variant="horizontal" className="vine-horizontal" />

        <div className="highlights-grid">
          {previewPhotos.map((photo, i) => (
            <Link
              key={photo.id}
              href="/gallery"
              className={`highlights-card ${i === 0 ? "featured-hero-card" : ""}`}
            >
              <div className="highlights-thumb-wrap">
                <Image
                  src={photo.thumbSrc}
                  alt={photo.title}
                  width={photo.width}
                  height={photo.height}
                  className="highlights-img"
                  sizes={
                    i === 0
                      ? "(max-width: 900px) 100vw, 66vw"
                      : "(max-width: 600px) 100vw, 33vw"
                  }
                />
                <div className="highlights-overlay">
                  <span className="highlights-cat">{photo.category}</span>
                  <span className="highlights-view-tag">View in Gallery &rarr;</span>
                </div>
              </div>
              <div className="highlights-caption">
                <h4>{photo.title}</h4>
                <p>{photo.caption}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="highlights-footer-bar">
          <div className="highlights-news-snippet">
            <span className="label">Plenary Milestone:</span>
            <span>
              Gambian Varsity VC Prof. Nazmat Toyin Surajudeen-Bakinde applauds UNILAG’s EIBIC
              entrepreneurship certification during the keynote address.
            </span>
          </div>
          <Link href="/gallery" className="btn ghost small">
            Explore All 26 Photos &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
