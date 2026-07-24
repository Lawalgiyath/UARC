import type { Metadata } from "next";
import { DatesSection } from "@/components/sections/DatesSection";
import { FeesSection } from "@/components/sections/FeesSection";
import { getAbstractDeadline } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Dates and Fees | 19th UNILAG Annual Research Conference",
};

const ABSTRACT_OPENS_AT = "2026-06-15T00:00:00+01:00";

export const dynamic = "force-dynamic";

export default async function DatesAndFeesPage() {
  const deadline = await getAbstractDeadline();

  return (
    <>
      <section className="page-hero">
        <div className="wrap">
          <div className="eyebrow">Plan your attendance</div>
          <h1 style={{ fontFamily: "'Iowan Old Style', Palatino, Georgia, serif", fontSize: "clamp(1.9rem, 1.5rem + 1.6vw, 2.75rem)", marginTop: "0.6rem" }}>
            Dates and fees
          </h1>
        </div>
      </section>
      <DatesSection abstractOpensAt={ABSTRACT_OPENS_AT} abstractClosesAt={deadline.toISOString()} />
      <FeesSection />
    </>
  );
}
