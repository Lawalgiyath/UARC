// About the University of Lagos: the block the Secretariat asked to appear
// right at the top of the site, before anything about the conference itself.
//
// Figures are drawn from the university's own publications and its Wikipedia
// entry. Anything that moves year to year is dated in `asOf` so it is obvious
// when a number needs refreshing.

import type { AcademicIconName } from "@/components/icons/AcademicIcons";

export const UNIVERSITY = {
  name: "University of Lagos",
  shortName: "UNILAG",
  founded: 1962,
  motto: "In Deed and In Truth",
  epithet: "The University of First Choice and the Nation's Pride",
  website: "https://unilag.edu.ng",
  location: "Akoka, Yaba, Lagos, Nigeria",
  summary:
    "Founded in 1962 as one of Nigeria's first generation universities, the University of Lagos teaches and researches across the sciences, medicine, engineering, law, business and the humanities from its main campus on the Lagos lagoon at Akoka.",
  detail:
    "The university runs three campuses in Lagos: the main campus at Akoka, the College of Medicine at Idi-Araba, and a third site at Yaba. It is consistently placed among the leading universities in Africa, and its research output is coordinated through the Central Research Committee, which also convenes this conference and the research fair that runs alongside it.",
} as const;

export interface UniversityFact {
  value: string;
  label: string;
  icon: AcademicIconName;
  asOf?: string;
}

export const UNIVERSITY_FACTS: UniversityFact[] = [
  { value: "1962", label: "Founded, a first generation Nigerian university", icon: "book" },
  { value: "57,000+", label: "Students enrolled across all campuses", icon: "users", asOf: "2024" },
  { value: "3", label: "Campuses in Lagos: Akoka, Idi-Araba and Yaba", icon: "city" },
  { value: "19", label: "Editions of the Annual Research Conference and Fair", icon: "laurel" },
];

/**
 * What an accepted author actually gets. The Secretariat asked for "a kind of
 * a promise for those submitting papers", and for the visibility that promise
 * carries to be spelled out rather than implied.
 */
export interface AuthorPromise {
  icon: AcademicIconName;
  title: string;
  body: string;
}

export const AUTHOR_PROMISES: AuthorPromise[] = [
  {
    icon: "seal",
    title: "Every abstract is read and answered",
    body: "No submission disappears. Each one is assigned to a track, reviewed by the panel for that track, and answered in writing by 21 September 2026, accepted or not. Your reference code shows you exactly where it is in the meantime.",
  },
  {
    icon: "book",
    title: "Accepted oral presentations go forward for publication",
    body: "Abstracts accepted for oral presentation are considered for publication in the UNILAG Journal of Humanities (UJH) or the UNILAG Journal of Medicine, Science and Technology (UJMST), the university's own peer reviewed journals.",
  },
  {
    icon: "megaphone",
    title: "Your work is presented to people who can use it",
    body: "Sessions are attended by faculty, policymakers, industry partners and the press. Papers that speak to live policy questions are drawn into the conference communique, which the university publishes and circulates after the conference.",
  },
  {
    icon: "globe",
    title: "A permanent, citable record",
    body: "The programme, the book of abstracts and the communique stay online under the university's domain after the conference closes, so a presentation here remains findable and citable years later.",
  },
  {
    icon: "scroll",
    title: "A verifiable certificate, issued automatically",
    body: "Presenters and delegates receive a certificate the moment attendance is confirmed, carrying a code anyone, including a promotion panel or a funder, can check against this site.",
  },
];

/**
 * The visibility question, answered plainly: where the work actually surfaces
 * once it has been presented.
 */
export const VISIBILITY_CHANNELS = [
  {
    icon: "book" as AcademicIconName,
    label: "UNILAG Journal of Humanities (UJH)",
    body: "Peer reviewed, for accepted work in the humanities, law, education and the social sciences.",
  },
  {
    icon: "flask" as AcademicIconName,
    label: "UNILAG Journal of Medicine, Science and Technology (UJMST)",
    body: "Peer reviewed, for accepted work in medicine, the sciences, engineering and technology.",
  },
  {
    icon: "scroll" as AcademicIconName,
    label: "Book of abstracts and conference programme",
    body: "Published under the university domain, indexed by search engines, and archived with the past editions on this site.",
  },
  {
    icon: "scales" as AcademicIconName,
    label: "The conference communique",
    body: "The recommendations the conference makes to the university and to government, published after each edition.",
  },
  {
    icon: "megaphone" as AcademicIconName,
    label: "University press and social channels",
    body: "Selected work is written up by the university's communications unit and carried on its national channels.",
  },
];
