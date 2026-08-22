// Single source of truth for who the conference is, how to reach it, and what
// it is announcing. Header, footer, contact blocks, structured data and the
// certificate template all read from here, so the Secretariat changes a phone
// number or a handle in one place.

export const CONFERENCE = {
  edition: "19th",
  editionOrdinal: 19,
  name: "University of Lagos Annual Research Conference",
  shortName: "UNILAG Annual Research Conference",
  subtitle: "An International Conference of the Sciences and Humanities",
  theme:
    "Sustainable Frontiers: Integrating Systems for Food Security, Health, Housing and Humanity for Combating Global Challenges",
  themeShort: "Sustainable Frontiers",
  /** Sits directly under the "19th Edition" line, per the Secretariat's brief. */
  editionCaption:
    "Three days of plenaries, parallel sessions and a research fair, convened by the Central Research Committee of the University of Lagos and open to researchers within and outside Nigeria.",
  dates: "October 14 – 16, 2026",
  datesShort: "Oct 14–16, 2026",
  venue: "Jelili Omotola Halls",
  venueFull: "Jelili Omotola Halls, University of Lagos, Akoka, Yaba, Lagos, Nigeria",
  abstractDeadlineLabel: "Monday, 24 August 2026",
} as const;

/**
 * The Central Research Committee is the university body behind the conference,
 * chaired by the Deputy Vice-Chancellor (Academics and Research). The
 * Conference Planning Committee Secretariat, inside the Research Management
 * Office, is who delegates actually write to.
 */
export const CRC = {
  abbr: "CRC",
  name: "Central Research Committee",
  parent: "University of Lagos",
  chairRole: "Deputy Vice-Chancellor (Academics and Research)",
  blurb:
    "The Central Research Committee coordinates research policy, research grants and the Annual Research Conference and Fair for the University of Lagos.",
  secretariat: "Conference Planning Committee (CPC) Secretariat",
  secretariatOffice: "Research Management Office, behind the Ade Ajayi Auditorium",
} as const;

export interface ContactNumber {
  /** E.164, so the link works when dialled from outside Nigeria. */
  e164: string;
  /** Grouped for reading, international form. */
  display: string;
  /** How the same number is written on campus. */
  local: string;
  label: string;
}

export const CONTACT = {
  email: "unilagconf@unilag.edu.ng",
  /** Written in international form throughout, for delegates dialling in from abroad. */
  phones: [
    {
      e164: "+2347042015134",
      display: "+234 704 201 5134",
      local: "0704 201 5134",
      label: "Secretariat, all enquiries",
    },
  ] as ContactNumber[],
  countryCode: "+234",
  countryName: "Nigeria",
  addressLines: [
    "Conference Planning Committee (CPC) Secretariat",
    "Research Management Office, behind the Ade Ajayi Auditorium",
    "University of Lagos, Akoka, Yaba",
    "Lagos, Nigeria",
  ],
  /** Nigeria observes West Africa Time year round, no daylight saving. */
  timezone: "West Africa Time (UTC+1), no daylight saving",
} as const;

export interface SocialHandle {
  network: string;
  handle: string;
  url: string;
}

// Verified against the university's own accounts rather than guessed. These are
// the institutional handles; if the Secretariat opens a conference-specific
// account, add it here and it appears in the header, footer and contact page.
export const SOCIALS: SocialHandle[] = [
  { network: "X", handle: "@UnilagNigeria", url: "https://x.com/UnilagNigeria" },
  { network: "Facebook", handle: "UnilagNigeria", url: "https://www.facebook.com/UnilagNigeria/" },
  { network: "Instagram", handle: "@unilagnigeria", url: "https://www.instagram.com/unilagnigeria/" },
  {
    network: "LinkedIn",
    handle: "University of Lagos",
    url: "https://www.linkedin.com/company/unilag-nigeria/",
  },
];

export const SOCIAL_HASHTAGS = ["#UNILAGARC2026", "#SustainableFrontiers"];

export interface NewsItem {
  /** Shown in the breaking-news band when `breaking` is true. */
  breaking?: boolean;
  headline: string;
  body: string;
  date: string;
  href?: string;
  hrefLabel?: string;
}

// The band at the top of the home page reads the first `breaking` item.
export const NEWS: NewsItem[] = [
  {
    breaking: true,
    headline: "Breaking news about the University of Lagos Annual Research Conference",
    body: `The Central Research Committee has opened the call for abstracts for the ${CONFERENCE.edition} ${CONFERENCE.name}. Abstracts close ${CONFERENCE.abstractDeadlineLabel}; accepted oral presentations are considered for publication in the UNILAG Journal of Humanities and the UNILAG Journal of Medicine, Science and Technology.`,
    date: "2026-06-15",
    href: "/submit",
    hrefLabel: "Submit an abstract",
  },
  {
    headline: "Sponsorship and exhibition space now open",
    body: "Organisations can take a sponsorship tier or an exhibition stand at the research fair, and pay online.",
    date: "2026-06-15",
    href: "/sponsors",
    hrefLabel: "See sponsorship tiers",
  },
  {
    headline: "Accommodation guidance published",
    body: "Hotels within reach of the Akoka campus, with distances and rates, are listed for visiting delegates.",
    date: "2026-06-15",
    href: "/accommodation",
    hrefLabel: "View accommodation",
  },
];

export function breakingNews(): NewsItem | undefined {
  return NEWS.find((item) => item.breaking);
}
