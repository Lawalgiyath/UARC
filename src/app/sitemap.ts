import type { MetadataRoute } from "next";

const ROUTES = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.9 },
  { path: "/dates-and-fees", priority: 0.8 },
  { path: "/submit", priority: 0.9 },
  { path: "/register", priority: 0.9 },
  { path: "/sponsors", priority: 0.7 },
  { path: "/exhibit", priority: 0.7 },
  { path: "/accommodation", priority: 0.6 },
  { path: "/delegates", priority: 0.5 },
  { path: "/certificates", priority: 0.5 },
  { path: "/verify", priority: 0.4 },
  { path: "/past-editions", priority: 0.5 },
  { path: "/committee", priority: 0.4 },
  { path: "/contact", priority: 0.6 },
  { path: "/faq", priority: 0.5 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  // Falls back to the live conference host so the sitemap is still valid
  // before NEXT_PUBLIC_SITE_URL is set in the deployment environment.
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "https://conference.unilag.edu.ng").replace(
    /\/$/,
    ""
  );
  const lastModified = new Date();

  return ROUTES.map((route) => ({
    url: `${base}${route.path}`,
    lastModified,
    changeFrequency: "weekly" as const,
    priority: route.priority,
  }));
}
