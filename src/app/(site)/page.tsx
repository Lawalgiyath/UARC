import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { ConferencePhotoHighlights } from "@/components/sections/ConferencePhotoHighlights";
import { getAbstractDeadline } from "@/lib/settings";
import { AcademicVine } from "@/components/AcademicVine";

// The abstract deadline is admin-editable at runtime (see /admin), so this
// page must be rendered per request rather than cached as a static build.
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const deadline = await getAbstractDeadline();

  return (
    <>
      <Hero abstractDeadlineIso={deadline.toISOString()} />

      <figure className="photo-band">
        <Image
          src="/images/conference-2026/thumbs/MG_0944.jpg"
          width={2100}
          height={1179}
          alt="19th UNILAG Annual Research Conference Plenary Hall at Jelili Adebisi Omotola Hall"
          sizes="100vw"
          style={{ objectFit: "cover", maxHeight: "28rem" }}
          priority
        />
        <figcaption>
          19th UNILAG Annual Research Conference: Plenary proceedings and delegates at Jelili Adebisi Omotola Hall.
          Photo by Michael Joshua / UNILAG Communication Unit.{" "}
          <Link href="/gallery" style={{ fontWeight: 600 }}>
            View Full Gallery (26 Photos) &rarr;
          </Link>
        </figcaption>
      </figure>

      {/* Featured Photo Highlights from the 19th Edition */}
      <ConferencePhotoHighlights />

      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Explore the Conference</div>
            <h2>Four ways into the 19th edition</h2>
          </div>
          <AcademicVine variant="horizontal" className="vine-horizontal" />
          <div className="landing-cards">
            <div className="landing-card">
              <span className="k">Call for papers</span>
              <h3>Submit an abstract</h3>
              <p>Choose one of eight subtheme tracks and submit through the online portal.</p>
              <Link className="btn ghost" href="/submit">Go to portal</Link>
            </div>
            <div className="landing-card">
              <span className="k">Attend</span>
              <h3>Register and pay</h3>
              <p>Regular, student and international rates, paid securely online with an instant receipt.</p>
              <Link className="btn ghost" href="/register">Go to registration</Link>
            </div>
            <div className="landing-card">
              <span className="k">Visual Archive</span>
              <h3>Photo Gallery</h3>
              <p>Explore 26 official photographs from the plenary addresses, dignitaries, and delegates.</p>
              <Link className="btn solid" href="/gallery">View 26 photos</Link>
            </div>
            <div className="landing-card">
              <span className="k">Archive</span>
              <h3>Past editions</h3>
              <p>Read the themes and outcomes of the 16th, 17th and 18th UNILAG Annual Research Conferences.</p>
              <Link className="btn ghost" href="/past-editions">Browse editions</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
