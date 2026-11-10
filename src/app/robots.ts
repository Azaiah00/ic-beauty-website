import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Search + AI answer engines are explicitly welcome (GEO): being cited by ChatGPT, Perplexity, Gemini and Claude is a goal. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/__forms.html", "/admin", "/api/", "/go/", "/shop/thank-you"] },
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "PerplexityBot", "ClaudeBot", "Claude-SearchBot", "Google-Extended", "Applebot-Extended", "Bingbot"], allow: "/", disallow: ["/admin", "/api/", "/go/", "/shop/thank-you"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
