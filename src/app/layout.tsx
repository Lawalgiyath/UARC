import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Source_Serif_4, Inter, IBM_Plex_Mono } from "next/font/google";
import { CONFERENCE, CONTACT, SOCIALS } from "@/lib/conference";
import { UNIVERSITY } from "@/lib/university";
import "./globals.css";

// The site previously led with Seravek and Iowan Old Style, which exist only on
// macOS: on Windows and Android every page fell back to Segoe UI and Palatino
// Linotype, so what most delegates saw was never what was designed. These three
// are downloaded at build time and served from our own origin, which also keeps
// them inside the Content Security Policy and avoids a request to Google on
// every page load.
//
// Source Serif for anything with authority, Inter for reading, IBM Plex Mono
// for the references, dates and figures the design leans on throughout.

const displaySerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  // Only the weights the design actually uses, to keep the payload honest.
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const bodySans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const description = `${CONFERENCE.theme}. ${CONFERENCE.dates}, ${CONFERENCE.venueFull}.`;

export const metadata: Metadata = {
  title: {
    default: `${CONFERENCE.edition} ${CONFERENCE.shortName}`,
    template: `%s | ${CONFERENCE.edition} ${CONFERENCE.shortName}`,
  },
  description,
  applicationName: `${CONFERENCE.edition} ${CONFERENCE.shortName}`,
  keywords: [
    "UNILAG",
    "University of Lagos",
    "Annual Research Conference",
    "call for abstracts",
    "research conference Nigeria",
    CONFERENCE.themeShort,
  ],
  openGraph: {
    title: `${CONFERENCE.edition} ${CONFERENCE.name}`,
    description,
    type: "website",
    locale: "en_NG",
    siteName: `${CONFERENCE.edition} ${CONFERENCE.shortName}`,
  },
  twitter: { card: "summary_large_image", site: "@UnilagNigeria" },
  ...(process.env.NEXT_PUBLIC_SITE_URL
    ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) }
    : {}),
};

// Structured data, so search engines and academic aggregators show the dates,
// venue and organiser correctly rather than guessing them from the page text.
const eventJsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: `${CONFERENCE.edition} ${CONFERENCE.name}`,
  description: CONFERENCE.theme,
  startDate: "2026-10-14",
  endDate: "2026-10-16",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: CONFERENCE.venue,
    address: {
      "@type": "PostalAddress",
      streetAddress: "University of Lagos, Akoka",
      addressLocality: "Yaba, Lagos",
      addressCountry: "NG",
    },
  },
  organizer: {
    "@type": "CollegeOrUniversity",
    name: UNIVERSITY.name,
    url: UNIVERSITY.website,
    email: CONTACT.email,
    telephone: CONTACT.phones[0].e164,
    sameAs: SOCIALS.map((s) => s.url),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${displaySerif.variable} ${bodySans.variable} ${mono.variable}`}
    >
      {/*
        Grammarly and similar extensions write attributes onto <body>
        (data-gr-ext-installed, data-new-gr-c-s-check-loaded) before React
        hydrates, which React then reports as a server/client mismatch. There
        is nothing to fix in our markup: this suppresses the warning for this
        one element only, one level deep, which is exactly what the flag is
        for. Mismatches anywhere inside the app still surface normally.
      */}
      <body suppressHydrationWarning>
        {children}
        <script
          type="application/ld+json"
          // Serialised from a literal we control, not from user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      </body>
    </html>
  );
}
