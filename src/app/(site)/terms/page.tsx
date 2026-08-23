import type { Metadata } from "next";
import Link from "next/link";
import { CONFERENCE } from "@/lib/conference";
import { TERMS } from "@/lib/terms";
import { AcademicVine } from "@/components/AcademicVine";

export const metadata: Metadata = {
  title: `Terms and conditions | ${CONFERENCE.edition} ${CONFERENCE.name}`,
  description:
    "The terms that apply when you register for, submit work to, sponsor or exhibit at the conference: fees, refunds, publication rights, certificates and liability.",
};

export default function TermsPage() {
  return (
    <div style={{ position: "relative" }}>
      <section className="section">
        <div className="wrap prose-page">
          <div className="eyebrow">Terms</div>
          <h1>Terms and conditions</h1>
          {TERMS.intro.map((paragraph) => (
            <p key={paragraph} className="lede">
              {paragraph}
            </p>
          ))}
          <p className="privacy-foot">Last updated {TERMS.lastUpdated}.</p>

          {TERMS.sections.map((section) => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>
              {section.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.points && (
                <ul className="privacy-rights">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          <p className="privacy-foot">
            Questions about any of this go to the Secretariat, at{" "}
            <a href={`mailto:${TERMS.contact.email}`}>{TERMS.contact.email}</a> or{" "}
            {TERMS.contact.phone}. How your data is handled is set out in the{" "}
            <Link href="/privacy">privacy notice</Link>.
          </p>
        </div>
      </section>
      <AcademicVine variant="corner" className="vine-corner bottom-right" flip />
    </div>
  );
}
