import Image from "next/image";
import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { getAbstractDeadline } from "@/lib/settings";
import { CAMPUS_PHOTOS } from "@/lib/media";
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
          src={CAMPUS_PHOTOS.entranceGate.src}
          width={CAMPUS_PHOTOS.entranceGate.width}
          height={CAMPUS_PHOTOS.entranceGate.height}
          alt={CAMPUS_PHOTOS.entranceGate.alt}
          sizes="100vw"
          style={{ objectFit: "cover", maxHeight: "26rem" }}
          priority
        />
        <figcaption>
          The main gate of the University of Lagos, Akoka, Yaba, Lagos. Photo by{" "}
          <a href={CAMPUS_PHOTOS.entranceGate.sourceUrl}>{CAMPUS_PHOTOS.entranceGate.credit}</a>, CC BY-SA 4.0.
        </figcaption>
      </figure>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Take part</div>
            <h2>Three ways into the 19th edition</h2>
          </div>
          <AcademicVine variant="horizontal" className="vine-horizontal" />
          <div className="landing-cards">
            <div className="landing-card">
              <span className="k">Call for papers</span>
              <h3>Submit an abstract</h3>
              <p>Choose one of eight subtheme tracks and submit through the online portal before 24 August 2026.</p>
              <Link className="btn ghost" href="/submit">Go to the submission portal</Link>
            </div>
            <div className="landing-card">
              <span className="k">Attend</span>
              <h3>Register and pay</h3>
              <p>Early bird, regular, student and international rates, paid securely online with an instant receipt.</p>
              <Link className="btn ghost" href="/register">Go to registration</Link>
            </div>
            <div className="landing-card">
              <span className="k">Archive</span>
              <h3>Past editions</h3>
              <p>Read the themes and outcomes of the 16th, 17th and 18th UNILAG Annual Research Conferences.</p>
              <Link className="btn ghost" href="/past-editions">Browse past editions</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
