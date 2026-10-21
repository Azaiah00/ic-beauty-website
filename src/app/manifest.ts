import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "I.C. Beauty — Iisha C. Silver",
    short_name: "I.C. Beauty",
    description: "Where hair, health & education connect.",
    start_url: "/",
    display: "standalone",
    background_color: "#1d1022",
    theme_color: "#1d1022",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
