import type { Metadata } from "next";
import { img } from "@/lib/images";
import { ArrowUpRight, Info, ShoppingBag } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { CTABand } from "@/components/sections/CTABand";
import { Btn } from "@/components/ui/Btn";
import { Needs } from "@/components/ui/Needs";
import { hubItems, retail, type HubItem } from "@/lib/content";
import { links, AFFILIATE_NOTE } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";

export const metadata: Metadata = {
  title: "The Hub: Hair Wellness Guides, Supplements & Tools",
  description:
    "Everything for your hair recovery journey in one place: Radiance Rewired, the free Hair Health Checklist, the WIN WIN membership, Iisha's recommended supplements and tools, and professional haircare.",
  alternates: { canonical: "/hub" },
};

function Card({ h }: { h: HubItem }) {
  return (
    <a href={h.href} target="_blank" rel="noopener noreferrer" className="group flex flex-col border-t border-plum-800/15 pt-7 transition-colors duration-500 hover:border-amethyst" data-reveal>
      <div className="flex items-center justify-between gap-3">
        <span className="eyebrow text-amethyst">{h.type}</span>
        {h.affiliate && <span className="rounded-pill bg-mist px-2.5 py-1 text-[0.68rem] uppercase tracking-wider text-plum-700">Affiliate</span>}
      </div>
      <h3 className="mt-4 font-display text-[1.9rem] leading-tight text-plum-900 group-hover:text-amethyst">{h.name}</h3>
      <p className="mt-3 flex-1 text-[0.97rem] text-plum-700">{h.blurb}</p>
      <div className="mt-6 flex items-center justify-between">
        <span className="font-display text-xl text-plum-900">{h.price ?? ""}</span>
        <span className="inline-flex items-center gap-1.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-plum-900 group-hover:text-amethyst">
          {h.cta}
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
          <span className="sr-only">(opens in a new tab)</span>
        </span>
      </div>
    </a>
  );
}

const groups: { id: string; title: string; eyebrow: string; filter: (h: HubItem) => boolean; note?: boolean }[] = [
  { id: "digital", eyebrow: "Learn at home", title: "Guides, downloads & membership", filter: (h) => ["Digital guide", "Free download", "Membership", "Video series"].includes(h.type) },
  { id: "supplements", eyebrow: "From the inside out", title: "Supplements & wellness", filter: (h) => ["Supplement", "Wellness scan"].includes(h.type) || h.name === "Red Light Therapy" || h.name.startsWith("Blood Type"), note: true },
  { id: "tools", eyebrow: "Iisha's favorite tools", title: "Tools for the journey", filter: (h) => h.type === "Hair tool", note: true },
];

export default function HubPage() {
  const retailGroups = ["Cleanse", "Condition", "Style", "Treat"] as const;
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "The Hub", path: "/hub" }]))} />
      <PageHero
        crumbs={[{ name: "The Hub", href: "/hub" }]}
        eyebrow="The Hub"
        title={
          <>
            Everything for your journey, <span className="italic-accent text-amethyst">in one place.</span>
          </>
        }
        lede={<p>Digital guides, the membership, supplements, tools, and professional haircare Iisha trusts. Use it between visits to keep growing.</p>}
        image={{ src: img("product-shelf"), alt: "Curated haircare and scalp-care tools on a studio shelf", label: "Studio shelf" }}
      >
        <Btn href="#digital">Guides & downloads</Btn>
        <Btn href="#supplements" variant="outline">Supplements</Btn>
        <Btn href="#shop" variant="outline">Haircare</Btn>
      </PageHero>

      <nav aria-label="Hub sections" className="sticky top-[84px] z-30 border-b border-plum-800/10 bg-bone/90 backdrop-blur-md">
        <ul className="container-x flex gap-8 overflow-x-auto py-3.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.18em]" data-scroll-inner>
          {[...groups.map((g) => ({ id: g.id, t: g.title.split(" ")[0].replace(",", "") })), { id: "shop", t: "Haircare" }].map((g) => (
            <li key={g.id} className="shrink-0"><a href={`#${g.id}`} className="link-underline text-plum-800">{g.t}</a></li>
          ))}
        </ul>
      </nav>

      {groups.map((g, gi) => (
        <section key={g.id} id={g.id} className={`${gi % 2 ? "bg-paper" : "bg-bone"} scroll-mt-32 py-20 sm:py-28`} aria-labelledby={`${g.id}-title`}>
          <div className="container-x">
            <SectionHead id={`${g.id}-title`} eyebrow={g.eyebrow} title={g.title} />
            <div className="mt-12 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {hubItems.filter(g.filter).map((h) => (
                <Card key={h.name} h={h} />
              ))}
            </div>
            {g.note && (
              <p className="mt-6 flex max-w-4xl items-start gap-2 text-[0.85rem] text-plum-700">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
                {AFFILIATE_NOTE}
              </p>
            )}
          </div>
        </section>
      ))}

      <section id="shop" className="scroll-mt-32 bg-plum-950 py-20 text-bone sm:py-28" aria-labelledby="shop-title">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead tone="dark" id="shop-title" eyebrow="Professional haircare" title={<>Shop by <span className="italic-accent text-brass-soft">what your hair needs.</span></>} lede="The cleansers, conditioners, stylers, and treatments Iisha carries in the studio. Order from the online store, or ask at your next visit." />
            <div className="flex flex-col items-start gap-3" data-reveal>
              <Btn href={links.shop} variant="light">Shop the full store</Btn>
              <Needs tone="light">Prices from current store, confirm before launch</Needs>
            </div>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            {retailGroups.map((grp) => (
              <div key={grp} data-reveal>
                <h3 className="flex items-center gap-2 font-display text-[1.7rem]">
                  <ShoppingBag className="h-5 w-5 text-brass-soft" aria-hidden="true" strokeWidth={1.25} />
                  {grp}
                </h3>
                <ul className="mt-5 divide-y divide-lilac/10 border-y border-lilac/10">
                  {retail
                    .filter((r) => r.group === grp)
                    .map((r) => (
                      <li key={r.name} className="flex items-baseline justify-between gap-4 py-3 text-[0.95rem]">
                        <span className={r.status === "Out of stock" ? "text-lilac/75" : "text-lilac"}>
                          {r.name}
                          {r.status && <span className="ml-2 text-[0.7rem] uppercase tracking-wider text-brass-soft">{r.status}</span>}
                        </span>
                        <span className="shrink-0 font-mono text-[0.85rem] text-bone">{r.price}</span>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title={<>Not sure where to start? <span className="italic-accent text-brass-soft">Start with awareness.</span></>}
        body="The 2-minute Scalp Self-Check points you to the right guide, tool, or appointment."
        primary={{ label: "Take the Scalp Self-Check", href: "/scalp-check" }}
        secondary={{ label: "Book a discovery call", href: "/book" }}
      />
    </>
  );
}
