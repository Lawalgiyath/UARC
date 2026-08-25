import type { Metadata } from "next";
import Link from "next/link";
import { CONFERENCE } from "@/lib/conference";
import { PRIVACY } from "@/lib/privacy";
import { AcademicVine } from "@/components/AcademicVine";

export const metadata: Metadata = {
  title: `Privacy notice | ${CONFERENCE.edition} ${CONFERENCE.name}`,
  description:
    "What the conference does with your personal data, why, where it is held, how long it is kept, and what you can ask for.",
};

export default function PrivacyPage() {
  const { controller } = PRIVACY;

  return (
    <div style={{ position: "relative" }}>
      <section className="section">
        <div className="wrap prose-page">
          <div className="eyebrow">Data protection</div>
          <h1>Privacy notice</h1>
          <p className="lede">
            This says what happens to the information you give this website, in plain terms. It is
            written to meet the Nigeria Data Protection Act 2023. Last updated {PRIVACY.lastUpdated}.
          </p>

          <h2>Who is responsible</h2>
          <p>
            The data controller is the <strong>{controller.name}</strong>, acting through the
            Conference Planning Committee Secretariat for {controller.on}. That means the University
            decides what is collected and why, and answers for it.
          </p>
          <address className="privacy-address">
            {controller.addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
            <span>
              <a href={`mailto:${controller.email}`}>{controller.email}</a> &middot; {controller.phone}
            </span>
          </address>

          <h2>What is collected, and why</h2>
          <p>
            Only what the conference actually needs. Each row says what we take, what it is for, and
            what entitles us to hold it.
          </p>
          <div className="table-scroll">
            <table className="privacy-table">
              <thead>
                <tr>
                  <th>What</th>
                  <th>Why</th>
                  <th>Lawful basis</th>
                </tr>
              </thead>
              <tbody>
                {PRIVACY.collected.map((row) => (
                  <tr key={row.what}>
                    <td>{row.what}</td>
                    <td>{row.why}</td>
                    <td>{row.basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Your card details</h2>
          <p className="privacy-callout">{PRIVACY.cardsNotice}</p>

          <h2>Who else sees it, and where it is held</h2>
          <p>
            Running a website means using other people&rsquo;s computers. These are the only
            organisations involved, what each one does, and which country the data sits in. Most of
            them are outside Nigeria, which the Act permits so long as you are told, and this is us
            telling you.
          </p>
          <div className="table-scroll">
            <table className="privacy-table">
              <thead>
                <tr>
                  <th>Who</th>
                  <th>What they do</th>
                  <th>Where</th>
                </tr>
              </thead>
              <tbody>
                {PRIVACY.processors.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.role}</td>
                    <td>{row.where}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Your data is never sold, and it is never given to anyone for marketing. Your name
            appears on the public delegate list only if you ticked the box asking for it.
          </p>

          <h2>Why it may lawfully be held outside Nigeria</h2>
          {PRIVACY.transferBasis.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}

          <h2>How long it is kept</h2>
          <div className="table-scroll">
            <table className="privacy-table">
              <thead>
                <tr>
                  <th>What</th>
                  <th>How long</th>
                  <th>Why that long</th>
                </tr>
              </thead>
              <tbody>
                {PRIVACY.retention.map((row) => (
                  <tr key={row.what}>
                    <td>{row.what}</td>
                    <td>{row.howLong}</td>
                    <td>{row.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Cookies</h2>
          <p>{PRIVACY.cookiesNotice}</p>

          <h2>The map on the contact page</h2>
          <p>{PRIVACY.mapNotice}</p>

          <h2>What you can ask for</h2>
          <ul className="privacy-rights">
            {PRIVACY.rights.map((right) => (
              <li key={right}>{right}</li>
            ))}
          </ul>
          <p>
            Write to <a href={`mailto:${controller.email}`}>{controller.email}</a> with your
            registration reference. We will answer within 30 days. There is no charge.
          </p>

          <h2>If something goes wrong</h2>
          <p>{PRIVACY.breach}</p>
          <p>
            You can also complain directly to the Nigeria Data Protection Commission, which
            regulates this and does not need our permission to hear from you.
          </p>

          <p className="privacy-foot">
            Questions about any of this go to the Secretariat, at{" "}
            <a href={`mailto:${controller.email}`}>{controller.email}</a>. See also our{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </div>
      </section>
      <AcademicVine variant="corner" className="vine-corner bottom-right" flip />
    </div>
  );
}
