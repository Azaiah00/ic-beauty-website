import { SITE_URL, business, METHOD_DEFINITION, DISCLAIMER } from "@/lib/site";
import { articles } from "@/lib/articles";
import { faqs, stylistClasses, talks } from "@/lib/content";

export const dynamic = "force-static";

/** llms.txt (llmstxt.org) — a clean, factual brief for AI agents. Hygiene, not a ranking lever. */
export function GET() {
  const hrs = business.hours.map((h) => `${h.day}: ${h.open ? `${h.open}–${h.close}` : "Closed"}`).join("; ");
  const body = `# I.C. Beauty — Iisha C. Silver

> I.C. Beauty LLC is a holistic hair loss and scalp wellness practice in Henrico (Richmond), Virginia, led by Iisha C. Silver, holistic hair recovery practitioner, service educator, speaker, and creator of The H.A.I.R. Wellness Method™. Tagline: "Where hair, health & education connect."

## Key facts
- Business: ${business.legalName}
- Founder: ${business.owner.name} (${business.owner.title}); roots in Brooklyn, NY
- Address: ${business.address.street}, ${business.address.city}, ${business.address.region} ${business.address.postalCode}
- Phone: ${business.phone} · Email: ${business.email}
- Hours: ${hrs}
- Serves: ${business.areaServed.join(", ")}
- Booking: complimentary 15-minute discovery call, then a full consultation with microscopic scalp analysis and wellness assessment. ${business.bookingNote}

## The H.A.I.R. Wellness Method™
${METHOD_DEFINITION}

## Main pages
- [Client Programs](${SITE_URL}/client-programs): hair loss recovery, scalp analysis, virtual visits, family hair-care classes
- [Professional Education](${SITE_URL}/professional-education): ${stylistClasses.map((c) => c.name).join("; ")}
- [Speaking & Workshops](${SITE_URL}/speaking): ${talks.map((t) => t.title).join("; ")}
- [The H.A.I.R. Method](${SITE_URL}/the-hair-method)
- [About Iisha](${SITE_URL}/about)
- [Book a discovery call](${SITE_URL}/book)
- [Scalp Self-Check quiz](${SITE_URL}/scalp-check)
- [The Hub](${SITE_URL}/hub): digital guides, membership, supplements, tools, retail haircare
- [FAQ](${SITE_URL}/faq)

## Hair Wellness Library
${articles.map((a) => `- [${a.title}](${SITE_URL}/learn/${a.slug}): ${a.answer}`).join("\n")}

## FAQ
${faqs.flatMap((g) => g.items).map((f) => `- Q: ${f.q}\n  A: ${f.a}`).join("\n")}

## Important
${DISCLAIMER}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
