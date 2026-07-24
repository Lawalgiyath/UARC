import { Suspense } from "react";
import type { Metadata } from "next";
import { SubmitSection } from "@/components/sections/SubmitSection";
import { SUBTHEME_OPTIONS } from "@/components/sections/Subthemes";
import { getAbstractDeadline } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Submit an Abstract | 19th UNILAG Annual Research Conference",
};

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const deadline = await getAbstractDeadline();

  return (
    <Suspense fallback={null}>
      <SubmitSection abstractDeadlineIso={deadline.toISOString()} subthemeOptions={SUBTHEME_OPTIONS} />
    </Suspense>
  );
}
