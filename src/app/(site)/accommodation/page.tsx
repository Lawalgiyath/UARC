import type { Metadata } from "next";
import { PhotoFrame } from "@/components/PhotoFrame";
import { IconPattern } from "@/components/IconPattern";
import {
  AcademicIcon,
  IconPhone,
  IconMail,
  IconPin,
  IconBed,
} from "@/components/icons/AcademicIcons";
import {
  HOTELS,
  ACCOMMODATION_NOTES,
  formatNaira,
  cheapestRoom,
  type Hotel,
} from "@/lib/accommodation";
import { CAMPUS_PHOTOS } from "@/lib/media";
import { CONFERENCE, CONTACT } from "@/lib/conference";

export const metadata: Metadata = {
  title: "Accommodation | 19th UNILAG Annual Research Conference",
  description:
    "The official hotel list for the 19th UNILAG Annual Research Conference: room classifications, rates, addresses and direct phone numbers, from the guest house on the Akoka campus outwards.",
};

const GUIDANCE: { icon: "bed" | "city" | "globe" | "scroll"; title: string; body: string }[] = [
  { icon: "bed", title: "Stay on campus if you can", body: ACCOMMODATION_NOTES.campusFirst },
  { icon: "city", title: "Allow for Lagos traffic", body: ACCOMMODATION_NOTES.traffic },
  { icon: "globe", title: "Arriving by air", body: ACCOMMODATION_NOTES.airport },
  { icon: "scroll", title: "Visa support letters", body: ACCOMMODATION_NOTES.visa },
];

export default function AccommodationPage() {
  const cheapest = HOTELS.reduce((min, h) =>
    cheapestRoom(h).amountNaira < cheapestRoom(min).amountNaira ? h : min
  );

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Visiting</div>
          <h1 className="page-title">Accommodation</h1>
          <p className="page-lede">{ACCOMMODATION_NOTES.intro}</p>
        </div>
      </section>

      <PhotoFrame
        photo={CAMPUS_PHOTOS.lagoonFountain}
        caption="The lagoon front, University of Lagos, Akoka."
        className="photo-band"
        sizes="100vw"
        maxHeight="20rem"
      />

      <section id="hotels">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Official list</div>
            <h2>
              {HOTELS.length} hotels, from {formatNaira(cheapestRoom(cheapest).amountNaira)} a night
            </h2>
            <p>
              Listed in the order the university published them, cheapest first. Book directly and
              quote the conference. Every number is given in international form, so it dials from
              anywhere.
            </p>
          </div>

          <div className="breakfast-note">
            <AcademicIcon name="star" size={18} />
            <p>{ACCOMMODATION_NOTES.breakfast}</p>
          </div>

          <ul className="hotel-list">
            {HOTELS.map((hotel) => (
              <HotelCard hotel={hotel} key={hotel.sn} />
            ))}
          </ul>

          <p className="archive-note">{ACCOMMODATION_NOTES.booking} Questions about the list, or a
            hotel not answering? Write to{" "}
            <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> or call{" "}
            <a href={`tel:${CONTACT.phones[0].e164}`}>{CONTACT.phones[0].display}</a>.
          </p>
        </div>
      </section>

      <section className="guidance-section">
        <IconPattern variant="dense" opacity={0.05} className="section-pattern" />
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow">Getting here and back</div>
            <h2>Practical guidance</h2>
          </div>

          <div className="guidance-grid">
            {GUIDANCE.map((item) => (
              <div className="guidance-card" key={item.title}>
                <span className="guidance-icon">
                  <AcademicIcon name={item.icon} size={24} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>

          <div className="venue-card">
            <IconPin size={20} />
            <div>
              <h3>The venue</h3>
              <p>{CONFERENCE.venueFull}</p>
              <p className="venue-note">
                Sessions run {CONFERENCE.dates}. The registration desk opens at 08:00 on the first
                morning; delegates arriving later can check in at any point during the three days.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function HotelCard({ hotel }: { hotel: Hotel }) {
  const from = cheapestRoom(hotel);

  return (
    <li className={`hotel-card ${hotel.onCampus ? "is-on-campus" : ""}`}>
      <div className="hotel-head">
        <div>
          <div className="hotel-sn mono">
            {String(hotel.sn).padStart(2, "0")}
            {hotel.onCampus && <span className="hotel-badge">On campus</span>}
          </div>
          <h3>{hotel.name}</h3>
          <div className="hotel-area">
            <IconPin size={14} />
            {hotel.address}
          </div>
        </div>
        <div className="hotel-from">
          <span className="k">From</span>
          <span className="v tnum">{formatNaira(from.amountNaira)}</span>
          <span className="u">per night</span>
        </div>
      </div>

      <div className="hotel-rooms">
        <div className="hotel-rooms-head">
          <IconBed size={15} />
          Room classifications
        </div>
        <ul>
          {hotel.rooms.map((room) => (
            <li key={room.name}>
              <span className="room-name">{room.name}</span>
              <span className="room-leader" />
              {room.breakfastIncluded && <span className="room-breakfast">breakfast included</span>}
              <span className="room-rate tnum">{formatNaira(room.amountNaira)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hotel-contacts">
        {hotel.phones.map((phone) => (
          <a className="hotel-contact" href={`tel:${phone.e164}`} key={phone.e164}>
            <IconPhone size={15} />
            {phone.display}
          </a>
        ))}
        {hotel.email && (
          // Encoded so an address containing reserved characters still
          // produces a valid mailto link.
          <a className="hotel-contact" href={`mailto:${encodeURIComponent(hotel.email)}`}>
            <IconMail size={15} />
            {hotel.email}
          </a>
        )}
        {hotel.website && (
          <a className="hotel-booking" href={hotel.website} target="_blank" rel="noreferrer noopener">
            {new URL(hotel.website).hostname.replace(/^www\./, "")} <span aria-hidden="true">&rarr;</span>
          </a>
        )}
      </div>

      {hotel.verification && <p className="hotel-verification">{hotel.verification}</p>}
    </li>
  );
}
