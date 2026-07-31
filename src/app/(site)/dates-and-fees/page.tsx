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
          <h1 className="page-title">Dates and fees</h1>
          <p className="page-lede">
            Every milestone from the opening of the call for abstracts to the closing session, and
            what registration costs in each category.
          </p>
        </div>
      </section>
      <DatesSection abstractOpensAt={ABSTRACT_OPENS_AT} abstractClosesAt={deadline.toISOString()} />
      <FeesSection />
    </>
  );
}
