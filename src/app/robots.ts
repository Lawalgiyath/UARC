import type { MetadataRoute } from "next";

// Certificates and the admin panel are deliberately excluded. A certificate
// URL is a personal record: it should be reachable by anyone the holder gives
// the link to, and by nobody trawling search results.

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/certificate/"],
    },
    ...(siteUrl ? { sitemap: `${siteUrl}/sitemap.xml` } : {}),
  };
}
