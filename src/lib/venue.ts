import { CONFERENCE } from "@/lib/conference";

// Getting to the conference.
//
// CITS asked for a navigational map, and the honest engineering answer is not
// simply to paste in a Google embed. An embedded map contacts Google the
// moment the page loads and sets cookies in the visitor's browser, whether or
// not they ever look at it. Our privacy notice says the public pages set no
// cookies and carry no third-party tracking, and that claim is worth more than
// the convenience of an always-on map. So the map here loads only when someone
// asks for it, which keeps the claim true and still puts a map on the page.
//
// The place is identified by a search query rather than by coordinates. The
// campus sits at roughly 6.5167 N, 3.3861 E, but the hall's own position is
// not something published anywhere reliable, and a pin dropped on a guess is
// worse than a search that lands on the right building.

export const VENUE = {
  name: CONFERENCE.venue,
  addressLines: [
    CONFERENCE.venue,
    "University of Lagos",
    "University Road, Akoka, Yaba",
    "Lagos, Nigeria",
  ],

  /** What we ask a mapping service to find. */
  query: `${CONFERENCE.venue}, University of Lagos, Akoka, Yaba, Lagos`,

  /** The campus, for orientation. Not the hall: see the note above. */
  campus: { latitude: 6.5167, longitude: 3.3861 },

  /** The university's own campus pages, including its virtual tour. */
  campusMapUrl: "https://unilag.edu.ng/campus/",

  arrival: [
    "The main entrance is the University Road gate at Akoka, off Herbert Macaulay Way. Bring photo identification: the gates are staffed and visitors are signed in.",
    "Lagos traffic is the single biggest risk to arriving on time. Delegates coming from the mainland should allow an hour more than the map suggests, and those coming from the island considerably more.",
    "Parking on campus is limited during the conference. Delegates staying at the UNILAG Guest Houses are already inside the gates and can walk.",
  ],
} as const;

/** Directions in Google Maps, as a search rather than a dropped pin. */
export function googleMapsUrl(): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(VENUE.query)}`;
}

/** The same place in Apple Maps, for delegates on an iPhone. */
export function appleMapsUrl(): string {
  return `https://maps.apple.com/?q=${encodeURIComponent(VENUE.query)}`;
}

/**
 * The embeddable map. Google's keyless embed endpoint, so no API key has to be
 * bought, stored or rotated for what is a static map of one building.
 */
export function mapEmbedUrl(): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(VENUE.query)}&z=16&output=embed`;
}
