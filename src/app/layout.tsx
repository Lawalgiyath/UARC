import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "19th UNILAG Annual Research Conference",
  description:
    "Sustainable Frontiers: integrating systems for food security, health, housing and humanity for combating global challenges. October 20-22, 2026, University of Lagos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
