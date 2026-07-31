import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { UniversityMasthead } from "@/components/sections/UniversityMasthead";
import { BreakingNewsBand } from "@/components/sections/BreakingNewsBand";
import { SponsorWall } from "@/components/sections/SponsorWall";
import { PhotoFrame } from "@/components/PhotoFrame";
import { AcademicVine } from "@/components/AcademicVine";
import { AcademicIcon } from "@/components/icons/AcademicIcons";
import type { AcademicIconName } from "@/components/icons/AcademicIcons";
import { getAbstractDeadline } from "@/lib/settings";
import { getPublicSponsors } from "@/lib/publicData";
import { CAMPUS_PHOTOS } from "@/lib/media";
import { TRACKS } from "@/lib/tracks";
import { CONFERENCE } from "@/lib/conference";

// The abstract deadline is admin-editable at runtime (see /admin), and the
// sponsor wall changes as sponsors confirm, so this page renders per request
// rather than being cached as a static build.
export const dynamic = "force-dynamic";

const WAYS_IN: {
  icon: AcademicIconName;
  kicker: string;
  title: string;
  body: string;
  href: string;
  cta: string;
}[] = [
  {
    icon: "upload",
    kicker: "Call for papers",
    title: "Submit an abstract",
    body: `Choose one of eight subtheme tracks and submit through the online portal before ${CONFERENCE.abstractDeadlineLabel}. Accepted oral presentations go forward for publication in the UNILAG journals.`,
    href: "/submit",
    cta: "Go to the submission portal",
  },
  {
    icon: "ticket",
    kicker: "Attend",
    title: "Register and pay",
    body: "Early bird, regular, student and international rates, paid securely online with an instant receipt. Student rates are verified at the point of registration.",
    href: "/register",
    cta: "Go to registration",
  },
  {
    icon: "handshake",
    kicker: "Partner",
    title: "Sponsor the conference",
    body: "Five tiers, from headline partner to departmental supporter, each with a place in the programme, the book of abstracts and the sponsor wall.",
    href: "/sponsors",
    cta: "See sponsorship tiers",
  },
  {
    icon: "booth",
    kicker: "Exhibit",
    title: "Take a stand at the fair",
    body: "The research fair runs alongside all three days. Stands and table tops are available to firms, publishers, departments and student teams.",
    href: "/exhibit",
    cta: "Apply for a stand",
  },
  {
    icon: "bed",
    kicker: "Visiting",
    title: "Find somewhere to stay",
    body: "Accommodation on the Akoka campus and nearby, with guidance on airport transfers, Lagos traffic and visa support letters.",
    href: "/accommodation",
    cta: "View accommodation",
  },
  {
    icon: "seal",
    kicker: "Afterwards",
    title: "Collect your certificate",
    body: "Certificates are generated automatically once attendance is recorded, and carry a code anyone can verify against this site.",
    href: "/certificates",
    cta: "Go to certificates",
  },
];

export default async function HomePage() {
  const [deadline, sponsors] = await Promise.all([getAbstractDeadline(), getPublicSponsors()]);

  return (
    <>
      {/* 1. The university itself, before anything about the conference. */}
      <UniversityMasthead />

      {/* 2. The Central Research Committee, and what it is announcing. */}
      <BreakingNewsBand />

      {/* 3. The edition, its caption, then the theme. */}
      <Hero abstractDeadlineIso={deadline.toISOString()} />

      <PhotoFrame
        photo={CAMPUS_PHOTOS.entranceGate}
        caption="The main gate of the University of Lagos, Akoka, Yaba, Lagos."
        className="photo-band"
        sizes="100vw"
        maxHeight="26rem"
        priority
      />

      <section id="tracks">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">II. Subthemes</div>
            <h2>Eight tracks for the call for papers</h2>
            <p>
              Every submission is assigned to one track at the point of submission, and reviewers and
              session chairs are organised along the same lines. Each track below opens onto what it
              covers, the questions it wants and the disciplines it expects to hear from.
            </p>
          </div>
          <ul className="track-grid">
            {TRACKS.map((track) => (
              <li className="track-card" key={track.roman}>
                <Link href={`/about#track-${track.roman}`}>
                  <span className="track-icon">
                    <AcademicIcon name={track.icon} size={26} />
                  </span>
                  <span className="track-roman mono">{track.roman}</span>
                  <h3>{track.title}</h3>
                  <p>{track.body}</p>
                  <span className="track-more">
                    {track.topics.length} topic areas <span aria-hidden="true">&rarr;</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Take part</div>
            <h2>Six ways into the {CONFERENCE.edition} edition</h2>
          </div>
          <AcademicVine variant="horizontal" className="vine-horizontal" />
          <div className="landing-cards">
            {WAYS_IN.map((way) => (
              <div className="landing-card" key={way.href}>
                <span className="landing-icon">
                  <AcademicIcon name={way.icon} size={24} />
                </span>
                <span className="k">{way.kicker}</span>
                <h3>{way.title}</h3>
                <p>{way.body}</p>
                <Link className="btn ghost" href={way.href}>
                  {way.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SponsorWall sponsors={sponsors} />
    </>
  );
}
