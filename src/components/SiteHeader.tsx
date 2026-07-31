"use client";

import { useState } from "react";
import Link from "next/link";
import { UnilagLogo } from "@/components/UnilagLogo";
import { CONFERENCE, CONTACT, CRC, SOCIALS } from "@/lib/conference";
import { IconMail, IconPhone } from "@/components/icons/AcademicIcons";
import { SocialLinks } from "@/components/SocialLinks";

// Grouped rather than a flat row: the site now carries three separate
// audiences (authors, delegates, and sponsors or exhibitors) and a single
// eleven item nav bar serves none of them well.
const NAV_GROUPS = [
  {
    heading: "The conference",
    links: [
      { href: "/about", label: "Theme" },
      { href: "/about#subthemes", label: "Subthemes" },
      { href: "/dates-and-fees", label: "Dates & Fees" },
      { href: "/committee", label: "Committee" },
      { href: "/past-editions", label: "Past Editions" },
    ],
  },
  {
    heading: "Take part",
    links: [
      { href: "/submit", label: "Submit an Abstract" },
      { href: "/register", label: "Register & Pay" },
      { href: "/delegates", label: "Who is coming" },
      { href: "/certificates", label: "Certificates" },
    ],
  },
  {
    heading: "Partner with us",
    links: [
      { href: "/sponsors", label: "Sponsorship" },
      { href: "/exhibit", label: "Exhibition stands" },
    ],
  },
  {
    heading: "Visiting",
    links: [
      { href: "/accommodation", label: "Accommodation" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
];

// What sits in the desktop bar, kept to the six most used destinations.
const PRIMARY_LINKS = [
  { href: "/about", label: "Theme" },
  { href: "/about#subthemes", label: "Subthemes" },
  { href: "/dates-and-fees", label: "Dates & Fees" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/exhibit", label: "Exhibit" },
  { href: "/accommodation", label: "Accommodation" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryPhone = CONTACT.phones[0];

  return (
    <>
      <div className="utility">
        <div className="wrap">
          <span className="utility-strap">
            {CONFERENCE.edition} {CONFERENCE.shortName}
            <span className="sep">&middot;</span>
            {CONFERENCE.datesShort}
            <span className="sep">&middot;</span>
            {CONFERENCE.venue}
          </span>
          <span className="contact-links">
            {/* Written in international form so a delegate abroad can dial it. */}
            <a href={`tel:${primaryPhone.e164}`}>
              <IconPhone size={13} /> {primaryPhone.display}
            </a>
            <a href={`mailto:${CONTACT.email}`}>
              <IconMail size={13} /> {CONTACT.email}
            </a>
            <SocialLinks socials={SOCIALS} size={14} className="utility-social" />
          </span>
        </div>
      </div>

      <header className="site">
        <div className="wrap site-nav">
          <Link className="brand" href="/" onClick={() => setMenuOpen(false)}>
            <UnilagLogo height={54} variant="crestOnly" />
            <span className="brand-word">
              <span className="over">University of Lagos</span>
              <span className="full">Annual Research Conference</span>
              <span className="sub">{CRC.name}</span>
            </span>
          </Link>
          <nav className="primary" aria-label="Primary">
            {PRIMARY_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="nav-ctas">
            <Link className="btn ghost small" href="/submit">
              Submit Abstract
            </Link>
            <Link className="btn solid small" href="/register">
              Register
            </Link>
            <button
              type="button"
              className="nav-toggle"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="mobile-nav" aria-label="All pages">
            {NAV_GROUPS.map((group) => (
              <div className="mobile-nav-group" key={group.heading}>
                <div className="mobile-nav-heading">{group.heading}</div>
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="mobile-nav-group">
              <div className="mobile-nav-heading">Follow</div>
              <SocialLinks socials={SOCIALS} size={18} withLabels className="mobile-social" />
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
