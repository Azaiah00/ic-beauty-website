import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { articles } from "@/lib/articles";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-10-20");
  const pages: [string, number, MetadataRoute.Sitemap[number]["changeFrequency"]][] = [
    ["", 1, "weekly"],
    ["/the-hair-method", 0.9, "monthly"],
    ["/client-programs", 0.95, "monthly"],
    ["/professional-education", 0.85, "monthly"],
    ["/speaking", 0.85, "monthly"],
    ["/about", 0.8, "monthly"],
    ["/book", 0.9, "monthly"],
    ["/scalp-check", 0.8, "monthly"],
    ["/hub", 0.7, "weekly"],
    ["/learn", 0.8, "weekly"],
    ["/faq", 0.7, "monthly"],
    ["/contact", 0.6, "yearly"],
    ["/links", 0.4, "monthly"],
    ["/policies", 0.2, "yearly"],
  ];
  return [
    ...pages.map(([p, priority, changeFrequency]) => ({ url: `${SITE_URL}${p}`, lastModified: now, priority, changeFrequency })),
    ...articles.map((a) => ({ url: `${SITE_URL}/learn/${a.slug}`, lastModified: new Date(a.modified), priority: 0.7, changeFrequency: "monthly" as const })),
  ];
}
