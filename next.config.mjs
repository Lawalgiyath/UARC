/** @type {import('next').NextConfig} */

// Security headers.
//
// The Content Security Policy is deliberately not maximal: Next.js injects
// inline bootstrap scripts and styles, so `unsafe-inline` has to stay until
// the app adopts a nonce strategy. What the policy does buy today is the part
// that matters most for a site taking payments and personal data: nothing can
// frame us (clickjacking a payment button), nothing can load a plugin, no
// injected <base> can redirect our relative URLs, and a form on our pages can
// only post back to us or to Paystack.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co https://login.remita.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://upload.wikimedia.org https://unilag.edu.ng https://res.cloudinary.com https://login.remita.net",
  "font-src 'self' data:",
  "connect-src 'self' https://api.cloudinary.com https://api.paystack.co https://login.remita.net https://remitademo.net",
  "frame-src https://checkout.paystack.com https://js.paystack.co https://login.remita.net https://remitademo.net",
  "form-action 'self' https://checkout.paystack.com https://login.remita.net",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "unilag.edu.ng" },
    ],
  },
  async headers() {
    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      {
        // The admin panel and the API must never be cached by a shared proxy:
        // one delegate's data reaching another is the failure mode here.
        source: "/(admin|api)/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
