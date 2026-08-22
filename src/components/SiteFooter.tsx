import Link from "next/link";
import { CAMPUS_PHOTOS } from "@/lib/media";
import { CONFERENCE, CONTACT, CRC, SOCIALS, SOCIAL_HASHTAGS } from "@/lib/conference";
import { UNIVERSITY } from "@/lib/university";
import { SocialLinks } from "@/components/SocialLinks";
import { UnilagLogo } from "@/components/UnilagLogo";
import { IconMail, IconPhone, IconPin } from "@/components/icons/AcademicIcons";

export function SiteFooter() {
  const credits = Object.values(CAMPUS_PHOTOS);

  return (
    <footer className="site" id="contact">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <UnilagLogo height={64} variant="plate" priority={false} />
            <p>
              {CONFERENCE.edition} {CONFERENCE.name}. {CONFERENCE.theme}.
            </p>
            <p className="footer-crc">
              Convened by the {CRC.name} ({CRC.abbr}), {UNIVERSITY.name}.
            </p>
            <SocialLinks socials={SOCIALS} size={20} />
            <p className="footer-hashtags mono">{SOCIAL_HASHTAGS.join("  ")}</p>
          </div>

          <div>
            <h4>Conference</h4>
            <Link href="/about">Theme</Link>
            <Link href="/about#subthemes">Subthemes</Link>
            <Link href="/dates-and-fees">Dates &amp; fees</Link>
            <Link href="/committee">Committee</Link>
            <Link href="/past-editions">Past editions</Link>
          </div>

          <div>
            <h4>Take part</h4>
            <Link href="/submit">Submit an abstract</Link>
            <Link href="/register">Register and pay</Link>
            <Link href="/delegates">Who is coming</Link>
            <Link href="/certificates">Certificates</Link>
            <Link href="/verify">Verify a certificate</Link>
          </div>

          <div>
            <h4>Partner and visit</h4>
            <Link href="/sponsors">Sponsorship</Link>
            <Link href="/exhibit">Exhibition stands</Link>
            <Link href="/accommodation">Accommodation</Link>
            <Link href="/contact">Contact the Secretariat</Link>
            <Link href="/faq">FAQ</Link>
            <Link href="/privacy">Privacy notice</Link>
          </div>

          <div className="footer-contact">
            <h4>Reach us</h4>
            {/* International dialling form throughout: delegates join this
                conference from outside Nigeria and a bare 0-prefixed number
                does not work from abroad. */}
            {CONTACT.phones.map((phone) => (
              <a key={phone.e164} href={`tel:${phone.e164}`}>
                <IconPhone size={14} />
                <span>
                  {phone.display}
                  <small>{phone.label}</small>
                </span>
              </a>
            ))}
            <a href={`mailto:${CONTACT.email}`}>
              <IconMail size={14} />
              <span>{CONTACT.email}</span>
            </a>
            <div className="footer-address">
              <IconPin size={14} />
              <span>
                {CONTACT.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
            </div>
            <p className="footer-tz">{CONTACT.timezone}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            &copy; {new Date().getFullYear()} {UNIVERSITY.name}. All abstracts accepted for oral
            presentation are considered for publication in the UNILAG Journal of Humanities or the
            UNILAG Journal of Medicine, Science and Technology.
          </span>
        </div>

        <p className="photo-credit-list">
          Campus photography via Wikimedia Commons, licensed CC BY-SA 4.0:{" "}
          {credits.map((c, i) => (
            <span key={c.sourceUrl}>
              <a href={c.sourceUrl}>{c.credit}</a>
              {i < credits.length - 1 ? ", " : ". "}
            </span>
          ))}
          Logo and crest courtesy of the {UNIVERSITY.name}.
        </p>
      </div>
    </footer>
  );
}
