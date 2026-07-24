import type { Metadata } from "next";
import { Faq } from "@/components/sections/Faq";
import { AcademicVine } from "@/components/AcademicVine";

export const metadata: Metadata = {
  title: "Frequently Asked Questions | 19th UNILAG Annual Research Conference",
};

export default function FaqPage() {
  return (
    <div style={{ position: "relative" }}>
      <Faq />
      <AcademicVine variant="corner" className="vine-corner bottom-right" flip />
    </div>
  );
}
