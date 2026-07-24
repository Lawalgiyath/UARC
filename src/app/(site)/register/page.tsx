import type { Metadata } from "next";
import { RegisterSection } from "@/components/sections/RegisterSection";

export const metadata: Metadata = {
  title: "Register and Pay | 19th UNILAG Annual Research Conference",
};

export default function RegisterPage() {
  return <RegisterSection />;
}
