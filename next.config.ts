import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Hide the dev-only route indicator (the "N" badge in the corner).
  devIndicators: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    // Old Square Online URLs -> new pages (preserves any link equity + bookmarks)
    return [
      { source: "/road-to-hair-recovery", destination: "/client-programs", permanent: true },
      { source: "/classes", destination: "/professional-education", permanent: true },
      { source: "/privacy-policy", destination: "/policies", permanent: true },
      { source: "/privacy", destination: "/policies", permanent: true },
      { source: "/terms", destination: "/policies", permanent: true },
      { source: "/s/shop", destination: "/shop", permanent: true },
      { source: "/linktree", destination: "/links", permanent: true },
      // Funnel short links: easy to say out loud on TikTok Live / IG
      { source: "/hairlove", destination: "/hair-love", permanent: false },
      { source: "/free", destination: "/hair-love", permanent: false },
      { source: "/checklist", destination: "/hair-love", permanent: false },
      { source: "/30days", destination: "/hair-love/30-days", permanent: false },
      { source: "/pilot", destination: "/hair-love/30-days", permanent: false },
      { source: "/join", destination: "/circle", permanent: false },
      { source: "/membership", destination: "/circle", permanent: false },
      // Old Stan store links → on-site shop
      { source: "/stan", destination: "/shop", permanent: true },
    ];
  },
};

export default nextConfig;
