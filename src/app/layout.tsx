import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CONFERENCE, CONTACT, SOCIALS } from "@/lib/conference";
import { UNIVERSITY } from "@/lib/university";
import "./globals.css";

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
  startDate: "2026-10-20",
  endDate: "2026-10-22",
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
    <html lang="en">
      <body>
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
