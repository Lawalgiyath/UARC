import Image from "next/image";
import type { Metadata } from "next";
import { Committee } from "@/components/sections/Committee";
import { AcademicVine } from "@/components/AcademicVine";
import { CAMPUS_PHOTOS } from "@/lib/media";

export const metadata: Metadata = {
  title: "Organising Committee | 19th UNILAG Annual Research Conference",
};

export default function CommitteePage() {
  const photo = CAMPUS_PHOTOS.lagoonFountain;

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Secretariat</div>
          <h1 style={{ fontFamily: "'Iowan Old Style', Palatino, Georgia, serif", fontSize: "clamp(1.9rem, 1.5rem + 1.6vw, 2.75rem)", marginTop: "0.6rem" }}>
            Organising committee
          </h1>
          <AcademicVine variant="horizontal" className="vine-horizontal" style={{ marginTop: "1.5rem" }} />
        </div>
      </section>

      <figure className="photo-band">
        <Image
          src={photo.src}
          width={photo.width}
          height={photo.height}
          alt={photo.alt}
          sizes="100vw"
          style={{ objectFit: "cover", maxHeight: "20rem" }}
        />
        <figcaption>
          The lagoon front fountain, University of Lagos. Photo by <a href={photo.sourceUrl}>{photo.credit}</a>, CC BY-SA 4.0.
        </figcaption>
      </figure>

      <Committee />
    </>
  );
}
