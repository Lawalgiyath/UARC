import type { Metadata } from "next";
import { Committee } from "@/components/sections/Committee";
import { AcademicVine } from "@/components/AcademicVine";
import { PhotoFrame } from "@/components/PhotoFrame";
import { CAMPUS_PHOTOS } from "@/lib/media";
import { CRC } from "@/lib/conference";

export const metadata: Metadata = {
  title: "Organising Committee | 19th UNILAG Annual Research Conference",
  description:
    "The Central Research Committee and the Conference Planning Committee Secretariat behind the 19th UNILAG Annual Research Conference, and who handles what.",
};

export default function CommitteePage() {
  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Secretariat</div>
          <h1 className="page-title">Organising committee</h1>
          <p className="page-lede">
            The conference is convened by the {CRC.name} ({CRC.abbr}), chaired by the{" "}
            {CRC.chairRole}, and run day to day by the {CRC.secretariat} in the{" "}
            {CRC.secretariatOffice}.
          </p>
          <AcademicVine variant="horizontal" className="vine-horizontal committee-vine" />
        </div>
      </section>

      <PhotoFrame
        photo={CAMPUS_PHOTOS.lagoonFountain}
        caption="The lagoon front fountain, University of Lagos."
        className="photo-band"
        sizes="100vw"
        maxHeight="20rem"
      />

      <Committee />
    </>
  );
}
