import type { Metadata } from "next";
import { SocialLinks } from "@/components/SocialLinks";
import { GettingHere } from "@/components/GettingHere";
import { IconPattern } from "@/components/IconPattern";
import { AcademicIcon, IconMail, IconPhone, IconPin } from "@/components/icons/AcademicIcons";
import { CONFERENCE, CONTACT, CRC, SOCIALS, SOCIAL_HASHTAGS } from "@/lib/conference";
import { UNIVERSITY } from "@/lib/university";

export const metadata: Metadata = {
  title: "Contact the Secretariat | 19th UNILAG Annual Research Conference",
  description:
    "Phone numbers in international format, email and postal address for the Secretariat of the 19th UNILAG Annual Research Conference, plus official social media handles.",
};

const ROUTES = [
  {
    icon: "upload" as const,
    heading: "About an abstract",
    body: "Quote your submission reference. Status questions are answered fastest through the tracker on the submission page.",
  },
  {
    icon: "ticket" as const,
    heading: "About registration or payment",
    body: "Quote your registration reference and the email address you used. Receipts are reissued on request.",
  },
  {
    icon: "handshake" as const,
    heading: "Sponsorship, exhibition and press",
    body: "Sponsorship tiers, exhibition stands, invoices and media accreditation all go through the Secretariat.",
  },
];

export default function ContactPage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Get in touch</div>
          <h1 className="page-title">Contact the Secretariat</h1>
          <p className="page-lede">
            The {CRC.secretariat} answers for the {CONFERENCE.edition} {CONFERENCE.name}. Every
            number below is written in international form, so it works whether you are dialling from
            Akoka or from abroad.
          </p>
        </div>
      </section>

      <section className="contact-section">
        <IconPattern variant="dense" opacity={0.05} className="section-pattern" />
        <div className="wrap">
          <div className="contact-grid">
            <div className="contact-card">
              <h2>
                <IconPhone size={18} /> By phone
              </h2>
              <ul className="contact-phones">
                {CONTACT.phones.map((phone) => (
                  <li key={phone.e164}>
                    <a href={`tel:${phone.e164}`} className="contact-number">
                      {phone.display}
                    </a>
                    <span className="contact-label">{phone.label}</span>
                    <span className="contact-local mono">
                      Within Nigeria: {phone.local}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="contact-note">
                Office hours are 09:00 to 16:00, Monday to Friday, {CONTACT.timezone}. WhatsApp
                messages to this number are read but answered more slowly than email.
              </p>
            </div>

            <div className="contact-card">
              <h2>
                <IconMail size={18} /> By email
              </h2>
              <a className="contact-email" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
              <p className="contact-note">
                The fastest route for anything with a reference code attached. Please put the
                reference in the subject line. Email is answered within two working days.
              </p>

              <h2 className="contact-social-heading">Follow the conference</h2>
              <SocialLinks socials={SOCIALS} size={20} withLabels />
              <p className="contact-hashtags mono">{SOCIAL_HASHTAGS.join("   ")}</p>
              <p className="contact-note">
                These are the official {UNIVERSITY.shortName} accounts. Announcements about the
                conference are carried there and on this site; anything else claiming to speak for
                the conference is not us.
              </p>
            </div>

            <div className="contact-card">
              <h2>
                <IconPin size={18} /> In person and by post
              </h2>
              <address className="contact-address">
                {CONTACT.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <p className="contact-note">
                The Secretariat sits in the {CRC.secretariatOffice}. During the conference itself,
                the desk moves to the {CONFERENCE.venue}.
              </p>
            </div>
          </div>

          <GettingHere />

          <div className="section-head contact-routes-head">
            <div className="eyebrow">Who to ask</div>
            <h2>What to have ready when you call</h2>
          </div>

          <div className="contact-routes">
            {ROUTES.map((route) => {
              const phone = CONTACT.phones[0];
              return (
                <div className="contact-route" key={route.heading}>
                  <span className="contact-route-icon">
                    <AcademicIcon name={route.icon} size={22} />
                  </span>
                  <div>
                    <h3>{route.heading}</h3>
                    <p>{route.body}</p>
                    <a href={`tel:${phone.e164}`} className="mono">
                      {phone.display}
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
