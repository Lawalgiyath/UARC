import photosData from "./conferencePhotos.json";

export type PhotoCategory =
  | "Plenary Sessions"
  | "Dignitaries & Groups"
  | "Conference Highlights";

export interface ConferencePhoto {
  id: string;
  file: string;
  title: string;
  caption: string;
  category: PhotoCategory;
  width: number;
  height: number;
  fullSrc: string;
  thumbSrc: string;
}

export const PHOTO_CATEGORIES = [
  "All",
  "Plenary Sessions",
  "Dignitaries & Groups",
  "Conference Highlights",
] as const;

export const CONFERENCE_PHOTOS: ConferencePhoto[] = photosData as ConferencePhoto[];

export const FEATURED_HOMEPAGE_PHOTOS: ConferencePhoto[] = [
  CONFERENCE_PHOTOS.find((p) => p.file === "MG_0976.jpg")!,
  CONFERENCE_PHOTOS.find((p) => p.file === "MG_0895.jpg")!,
  CONFERENCE_PHOTOS.find((p) => p.file === "MG_0944.jpg")!,
  CONFERENCE_PHOTOS.find((p) => p.file === "MG_0858.jpg")!,
  CONFERENCE_PHOTOS.find((p) => p.file === "MG_0913.jpg")!,
  CONFERENCE_PHOTOS.find((p) => p.file === "MG_0973.jpg")!,
  CONFERENCE_PHOTOS.find((p) => p.file === "MG_0950.jpg")!,
  CONFERENCE_PHOTOS.find((p) => p.file === "IMG-20261016-WA0003.jpg")!,
].filter(Boolean);

export const CONFERENCE_NEWS_INFO = {
  headline: "19th UNILAG Research Conference: Gambian Varsity VC Applauds UNILAG’s Milestone in Entrepreneurship Education",
  sourceUrl: "https://unilag.edu.ng/19th-unilag-research-conference-gambian-varsity-vc-applauds-unilags-milestone-in-entrepreneurship-education/",
  reportBy: "Gbenga Gbelee",
  photoCredit: "Michael Joshua / UNILAG Communication Unit",
  eventDates: "October 14–16, 2026",
  venue: "Jelili Adebisi Omotola Hall, University of Lagos",
  keynoteSpeaker: "Prof. Nazmat Toyin Surajudeen-Bakinde (VC, University of Applied Science, Engineering and Technology - USET, The Gambia)",
  universityLead: "Prof. Muyiwa Falaiye (Deputy Vice-Chancellor, Management Services, representing the Vice-Chancellor Prof. Folasade Ogunsola, FAS)",
};
