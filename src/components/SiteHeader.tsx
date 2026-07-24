"use client";

import { useState } from "react";
import Link from "next/link";
import { UnilagLogo } from "@/components/UnilagLogo";

const NAV_LINKS = [
  { href: "/about", label: "Theme" },
  { href: "/about#subthemes", label: "Subthemes" },
  { href: "/dates-and-fees", label: "Dates & Fees" },
  { href: "/past-editions", label: "Past Editions" },
  { href: "/committee", label: "Committee" },
  { href: "/faq", label: "FAQ" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="utility">
        <div className="wrap">
          <span>19th UNILAG Annual Research Conference &middot; October 20&ndash;22, 2026 &middot; Jelili Adebisi Omotola Hall</span>
          <span className="contact-links">
            <a href="tel:+2347042015134">+234 704 201 5134</a>
            <a href="mailto:unilagconf@unilag.edu.ng">unilagconf@unilag.edu.ng</a>
          </span>
        </div>
      </div>

      <header className="site">
        <div className="wrap site-nav">
          <Link className="brand" href="/" onClick={() => setMenuOpen(false)}>
            <UnilagLogo height={36} />
            <span className="brand-word">
              <span className="full">Annual Research Conference</span>
              <span className="sub">University of Lagos</span>
            </span>
          </Link>
          <nav className="primary" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>{link.label}</Link>
            ))}
          </nav>
          <div className="nav-ctas">
            <Link className="btn ghost small" href="/submit">Submit Abstract</Link>
            <Link className="btn solid small" href="/register">Register</Link>
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
          <nav className="mobile-nav" aria-label="Mobile">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
