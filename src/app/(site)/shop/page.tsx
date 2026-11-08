import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { CTABand } from "@/components/sections/CTABand";
import { Btn } from "@/components/ui/Btn";
import { img } from "@/lib/images";
import { products } from "@/lib/products";
import { funnel } from "@/lib/funnel";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";
import { shareMeta } from "@/lib/share";

export const metadata: Metadata = {
  ...shareMeta("/shop"),
  title: "Shop: Hair Wellness Guides, Downloads & Membership",
  description:
    "Iisha C. Silver's hair wellness guides and tools: the free Hair Health Red Flags checklist, The Scalp-Calm Kitchen food guide, Radiance Rewired, Custom Sound Therapy and The H.A.I.R. Circle membership.",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  const free = products.filter((p) => p.freeHref);
  const paid = products.filter((p) => !p.freeHref);
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "Shop", path: "/shop" }]))} />
      <PageHero
        crumbs={[{ name: "Shop", href: "/shop" }]}
        eyebrow="The I.C. Beauty Shop"
        title={
          <>
            Guides made to be <span className="italic-accent text-amethyst">used, not skimmed.</span>
          </>
        }
        lede="Everything here comes from the same H.A.I.R. Wellness Method Iisha uses with her clients: practical, beautifully made, and built to change how you care for your hair at home."
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Btn href={funnel.basePath}>Start free</Btn>
          <Btn href={`${funnel.basePath}/30-days`} variant="outline">The 30-day program</Btn>
        </div>
      </PageHero>

      <section aria-labelledby="free-title" className="bg-paper py-20 lg:py-28">
        <div className="container-x">
          <SectionHead id="free-title" eyebrow="Start here · Free" title={<>Two free guides, <span className="italic-accent text-amethyst">one inbox away.</span></>} lede="Get the checklist and, as a bonus, The Scalp-Calm Kitchen, delivered instantly." />
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {free.map((p) => (
              <Link key={p.slug} href={p.freeHref!} className="group grid gap-6 rounded-card border border-plum-800/10 bg-bone p-5 transition hover:border-amethyst sm:grid-cols-[9rem_1fr] sm:p-6" data-reveal>
                <span className="relative block aspect-[3/4] overflow-hidden rounded-xl shadow-[0_18px_40px_-20px_rgba(36,19,42,0.5)]">
                  {img(p.image) && <Image src={img(p.image)!} alt={`${p.name} cover`} fill sizes="160px" className="object-cover" />}
                </span>
                <span className="flex flex-col">
                  <span className="eyebrow text-amethyst">{p.kind}</span>
                  <span className="mt-2 font-display text-[1.75rem] leading-tight text-plum-900 group-hover:text-amethyst">{p.name}</span>
                  <span className="mt-2 text-[0.96rem] text-plum-700">{p.tagline}</span>
                  <span className="mt-auto inline-flex items-center gap-2 pt-5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900">
                    Get it free <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="paid-title" className="bg-bone py-20 lg:py-28">
        <div className="container-x">
          <SectionHead id="paid-title" eyebrow="Go deeper" title={<>Guides, sessions &amp; <span className="italic-accent text-amethyst">membership.</span></>} />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {paid.map((p) => (
              <Link key={p.slug} href={p.redirectTo ?? `/shop/${p.slug}`} className="group flex flex-col overflow-hidden rounded-card border border-plum-800/10 bg-paper transition hover:border-amethyst" data-reveal>
                <span className="relative block aspect-[4/3] overflow-hidden bg-sand">
                  {img(p.image) && <Image src={img(p.image)!} alt="" fill sizes="(min-width: 768px) 30vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />}
                </span>
                <span className="flex flex-1 flex-col p-6">
                  <span className="eyebrow text-amethyst">{p.kind}</span>
                  <span className="mt-2 font-display text-[1.8rem] leading-tight text-plum-900 group-hover:text-amethyst">{p.name}</span>
                  <span className="mt-2 flex-1 text-[0.96rem] text-plum-700">{p.tagline}</span>
                  <span className="mt-5 flex items-baseline justify-between">
                    <span className="font-display text-2xl text-plum-900">
                      {p.comingSoon ? "Coming soon" : p.price}
                      {!p.comingSoon && p.priceNote && <span className="ml-1.5 font-sans text-[0.75rem] text-plum-700">{p.priceNote}</span>}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-plum-900">
                      View <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABand
        title={<>30 Days to a New Love Story <span className="italic-accent text-brass-soft">with Your H.A.I.R.</span></>}
        body="Iisha's virtual education program. The pilot runs in February 2027, and founding seats are limited."
        primary={{ href: `${funnel.basePath}/30-days`, label: "See the program" }}
        secondary={{ href: funnel.basePath, label: "Start with the free checklist" }}
        image="funnel-routine"
      />
    </>
  );
}
