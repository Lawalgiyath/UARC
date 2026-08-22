// The official accommodation list, as supplied by the University of Lagos for
// the 19th Annual Research Conference.
//
// This replaces the earlier provisional list entirely. Names, addresses, phone
// numbers, room classifications and rates below are the university's own; they
// are not scraped from booking platforms and no star ratings are shown,
// because the official list does not grade the hotels and mixing in an
// unverified grading would misrepresent it.
//
// Three checks were run against the list before publishing it, and the results
// are recorded per hotel in `verification`:
//
//   * Every phone number was checked as a well formed Nigerian mobile number
//     (11 digits, valid network prefix) and converted to +234 international
//     form, since delegates dial in from abroad. All fourteen passed.
//   * Every website was resolved in DNS and fetched. Two of the four have no
//     DNS record at all, so they are recorded but NOT linked: a lapsed domain
//     can be re-registered by anyone, and a university conference site must
//     not send delegates to whoever picks it up.
//   * Every email address was checked for deliverability as written. Two did
//     not survive: see the notes on Lagoon Hotel and AHI Residence.
//
// Rates are per night, in naira, as quoted to the university. They are a guide
// for budgeting; the hotel confirms the price at the time of booking.

export interface RoomRate {
  name: string;
  amountNaira: number;
  breakfastIncluded: boolean;
}

export interface HotelPhone {
  /** E.164, so the link dials correctly from outside Nigeria. */
  e164: string;
  display: string;
}

export interface Hotel {
  /** Position on the university's own list, preserved so the two can be compared. */
  sn: number;
  name: string;
  address: string;
  area: string;
  phones: HotelPhone[];
  email: string | null;
  /** Only ever set to a domain that actually resolves. */
  website: string | null;
  rooms: RoomRate[];
  onCampus?: boolean;
  /** Anything a delegate needs to know before they ring. */
  verification?: string;
}

export const HOTELS: Hotel[] = [
  {
    sn: 1,
    name: "Rockwell & Suites",
    address: "6 Jossy Castro Street, Ilaje, Bariga, Lagos",
    area: "Ilaje, Bariga",
    phones: [{ e164: "+2348132870198", display: "+234 813 287 0198" }],
    email: null,
    website: null,
    rooms: [
      { name: "Standard", amountNaira: 12_000, breakfastIncluded: false },
      { name: "Executive", amountNaira: 15_000, breakfastIncluded: false },
    ],
  },
  {
    sn: 2,
    name: "ECWA Guest House",
    address: "17 Montgomery Road, Yaba, Lagos",
    area: "Montgomery Road, Yaba",
    phones: [
      { e164: "+2347019221178", display: "+234 701 922 1178" },
      { e164: "+2349068644076", display: "+234 906 864 4076" },
    ],
    email: "ecwaghyababooling17@gmail.com",
    // ecwaghyaba.com.ng has no DNS record, so it is not linked.
    website: null,
    rooms: [
      { name: "Standard room", amountNaira: 17_625, breakfastIncluded: false },
      { name: "Royal room", amountNaira: 19_130, breakfastIncluded: false },
      { name: "Standard classic", amountNaira: 21_173, breakfastIncluded: false },
      { name: "Royal classic", amountNaira: 22_570, breakfastIncluded: false },
    ],
    verification:
      "The website on the official list, ecwaghyaba.com.ng, has no DNS record and could not be reached. Book by phone or email until the Secretariat confirms a working address.",
  },
  {
    sn: 3,
    name: "Sylva Link Hotel Ltd",
    address: "9 Asani Street, opposite CMS Grammar School, Ilaje, Bariga, Lagos",
    area: "Ilaje, Bariga",
    phones: [{ e164: "+2348136951710", display: "+234 813 695 1710" }],
    email: null,
    website: null,
    rooms: [
      { name: "Standard, rooms 101 and 102", amountNaira: 20_500, breakfastIncluded: false },
      { name: "Sylva room, upstairs", amountNaira: 21_500, breakfastIncluded: false },
      { name: "Conference, downstairs", amountNaira: 22_500, breakfastIncluded: false },
      { name: "Conference, upstairs", amountNaira: 23_500, breakfastIncluded: false },
    ],
  },
  {
    sn: 4,
    name: "Lagoon Hotel & Suites",
    address: "88 St Finbarr's Road, Akoka, Lagos",
    area: "Akoka, nearest the campus after the guest house",
    phones: [
      { e164: "+2348021044696", display: "+234 802 104 4696" },
      { e164: "+2347033405546", display: "+234 703 340 5546" },
    ],
    // The list gives "lagoonhotel&suites@gmail.com". A Gmail address cannot
    // contain an ampersand, so that address cannot exist and mail to it would
    // bounce. Withheld rather than published as a dead contact.
    email: null,
    website: null,
    rooms: [
      { name: "Studio", amountNaira: 23_000, breakfastIncluded: false },
      { name: "Diplomat", amountNaira: 28_000, breakfastIncluded: false },
      { name: "Executive", amountNaira: 32_000, breakfastIncluded: false },
    ],
    verification:
      "The email address on the official list contains an ampersand, which a Gmail address cannot, so mail to it would not arrive. Use the phone numbers, and ask the Secretariat to confirm the correct address.",
  },
  {
    sn: 5,
    name: "NSPRI Guest House",
    address: "33/38 Barikisu Iyede Street, off Unilag Road, Yaba, Lagos",
    area: "off Unilag Road, Yaba",
    phones: [{ e164: "+2348052473952", display: "+234 805 247 3952" }],
    email: null,
    website: null,
    rooms: [
      { name: "Standard", amountNaira: 29_000, breakfastIncluded: false },
      { name: "Deluxe", amountNaira: 33_000, breakfastIncluded: false },
      { name: "Super deluxe", amountNaira: 36_000, breakfastIncluded: false },
      { name: "Executive", amountNaira: 45_000, breakfastIncluded: false },
    ],
  },
  {
    sn: 6,
    name: "Caritas Inn Igbobi",
    address: "WAEC Bus Stop, Igbobi College Road, beside First Bank, Yaba, Lagos",
    area: "Igbobi, Yaba",
    phones: [{ e164: "+2348126955544", display: "+234 812 695 5544" }],
    email: null,
    // caritasinnigbobihotel.com has no DNS record, so it is not linked.
    website: null,
    rooms: [
      { name: "Standard", amountNaira: 35_000, breakfastIncluded: false },
      { name: "Classic", amountNaira: 40_000, breakfastIncluded: false },
      { name: "Deluxe", amountNaira: 45_000, breakfastIncluded: false },
      { name: "Executive", amountNaira: 50_000, breakfastIncluded: false },
    ],
    verification:
      "The website on the official list, caritasinnigbobihotel.com, has no DNS record and could not be reached. Book by phone.",
  },
  {
    sn: 7,
    name: "Tyndale Residences Ltd",
    address: "5 Abimbola Close, off Oweh Street, Fadeyi, Jibowu, Lagos",
    area: "Fadeyi, Jibowu",
    phones: [
      { e164: "+2348037700398", display: "+234 803 770 0398" },
      { e164: "+2349097554935", display: "+234 909 755 4935" },
    ],
    email: "tyndaleresidenceslimited@gmail.com",
    website: null,
    rooms: [
      // The one exception to the breakfast rule for hotels 7 to 9.
      { name: "Standard", amountNaira: 30_000, breakfastIncluded: false },
      { name: "Classic", amountNaira: 35_000, breakfastIncluded: true },
      { name: "Executive", amountNaira: 40_000, breakfastIncluded: true },
    ],
  },
  {
    sn: 8,
    name: "UNILAG Guest Houses",
    address: "University of Lagos campus, Akoka, Lagos",
    area: "Inside the campus gates, walking distance from Omotola Halls",
    phones: [
      { e164: "+2349135802663", display: "+234 913 580 2663" },
      { e164: "+2348142631511", display: "+234 814 263 1511" },
    ],
    email: "reservations@unilagguesthouses.com",
    website: "https://unilagguesthouses.com/",
    onCampus: true,
    rooms: [
      { name: "Executive", amountNaira: 35_000, breakfastIncluded: true },
      { name: "Silver", amountNaira: 44_500, breakfastIncluded: true },
    ],
  },
  {
    sn: 9,
    name: "AHI Residence",
    address: "19 Lawal Street, off Oweh Street, Jibowu, Lagos",
    area: "Jibowu",
    phones: [
      { e164: "+2348123445827", display: "+234 812 344 5827" },
      { e164: "+2348025456488", display: "+234 802 545 6488" },
    ],
    // The list gives reservations@; the hotel's own website publishes
    // reservation@, singular. Their site is treated as authoritative.
    email: "reservation@ahiresidence.com",
    website: "https://www.ahiresidence.com/",
    rooms: [
      { name: "Standard", amountNaira: 45_000, breakfastIncluded: true },
      { name: "Classic", amountNaira: 50_000, breakfastIncluded: true },
    ],
    verification:
      "The official list gives reservations@ahiresidence.com; the hotel's own website publishes reservation@ahiresidence.com, without the s. The hotel's own spelling is used here.",
  },
];

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString("en-NG")}`;
}

/** Cheapest room at a hotel, for the summary line. */
export function cheapestRoom(hotel: Hotel): RoomRate {
  return hotel.rooms.reduce((min, room) => (room.amountNaira < min.amountNaira ? room : min));
}

export const ACCOMMODATION_NOTES = {
  intro:
    "Delegates arrange and pay for their own accommodation. The hotels below were compiled by the University of Lagos for this conference, with the room classifications and rates each one quoted. Rates are per night, in naira, and are confirmed by the hotel at the time of booking.",
  campusFirst:
    "The UNILAG Guest Houses sit inside the campus gates, a few minutes' walk from the Jelili Omotola Halls. Delegates travelling from outside Lagos are advised to try it first: it removes the single biggest risk to arriving on time, which is Lagos traffic.",
  breakfast:
    "Breakfast is not included at Rockwell & Suites, ECWA Guest House, Sylva Link, Lagoon Hotel, NSPRI Guest House or Caritas Inn. It is included at Tyndale Residences, the UNILAG Guest Houses and AHI Residence, with one exception: the Standard room at Tyndale Residences does not include it.",
  traffic:
    "Traffic on the mainland is heavy between 06:30 and 10:00 and again from 16:00. If you stay off campus, budget at least twice the journey time you would expect elsewhere, and leave for the 09:00 sessions no later than 07:30.",
  airport:
    "Murtala Muhammed International Airport (LOS) in Ikeja is the arrival point for international delegates. Pre-book an airport transfer, or use a ride-hailing app from inside the terminal rather than accepting a kerbside offer.",
  visa:
    "Delegates who need a visa support letter should email the Secretariat with their registration reference, passport details and the dates of travel, allowing at least six weeks.",
  booking:
    "Book directly with the hotel and quote the University of Lagos Annual Research Conference. The conference does not operate a room block and takes no commission on any booking.",
};
