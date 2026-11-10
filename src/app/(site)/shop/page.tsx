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
import { Storefronts } from "@/components/shop/Storefronts";
import { SalonProducts } from "@/components/shop/SalonProducts";
import { OrderNotice } from "@/components/shop/OrderNotice";

export const metadata: Metadata = {
  ...shareMeta("/shop"),
  title: "Shop: In-Salon Haircare, Topicals, Wellness Tools & Supplements",
  description:
    "Shop I.C. Beauty: in-salon haircare from Iisha's Henrico studio, plus her picks for topicals and home maintenance, home wellness tools, supplements, and hair wellness guides.",
  alternates: { canonical: "/shop" },
};

const jump = [
  { href: "#salon", t: "In-salon products" },
  { href: "#picks", t: "Topicals & home maintenance" },
  { href: "#picks", t: "Home wellness tools" },
  { href: "#picks", t: "Supplements" },
  { href: "#guides", t: "Guides & membership" },
];

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
            Everything Iisha recommends, <span className="italic-accent text-amethyst">in one place.</span>
          </>
        }
        lede="Haircare from the studio, the topicals and tools she trusts for home maintenance, and supplements that support your hair from the inside out."
        image={{ src: img("product-shelf"), alt: "Curated haircare and scalp-care products on a studio shelf", label: "The studio shelf" }}
      >
        <div className="mt-9 flex flex-wrap gap-3">
          <Btn href="#salon">Shop in-salon products</Btn>
          <Btn href="#picks" variant="outline">Shop Iisha&apos;s picks</Btn>
        </div>
      </PageHero>

      <nav aria-label="Shop sections" className="sticky top-[84px] z-30 border-y border-plum-800/10 bg-bone/90 backdrop-blur-md">
        <ul className="container-x flex gap-8 overflow-x-auto py-3.5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.18em]" data-scroll-inner>
          {jump.map((j) => (
            <li key={j.t} className="shrink-0"><a href={j.href} className="link-underline whitespace-nowrap text-plum-800">{j.t}</a></li>
          ))}
        </ul>
      </nav>

      <section id="salon" aria-labelledby="salon-title" className="scroll-mt-32 bg-paper py-20 lg:py-28">
        <div className="container-x">
          <SectionHead id="salon-title" eyebrow="From the studio" title={<>In-salon products, <span className="italic-accent text-amethyst">ready to order.</span></>} lede="The cleansers, conditioners, stylers, and treatments Iisha uses and carries in her Henrico studio." />
          <OrderNotice />
          <SalonProducts />
        </div>
      </section>

      <section id="picks" aria-labelledby="picks-title" className="scroll-mt-32 bg-bone py-20 lg:py-28">
        <div className="container-x">
          <SectionHead id="picks-title" eyebrow="Iisha's picks" title={<>Shop topicals, tools <span className="italic-accent text-amethyst">&amp; supplements.</span></>} lede="Her trusted favorites from the brands she partners with. Each one opens her storefront in a new tab." />
          <div className="mt-12"><Storefronts /></div>
        </div>
      </section>

      <section id="guides" aria-labelledby="free-title" className="scroll-mt-32 bg-paper py-20 lg:py-28">
        <div className="container-x">
          <SectionHead id="free-title" eyebrow="Guides · Start free" title={<>Two free guides, <span className="italic-accent text-amethyst">one inbox away.</span></>} lede="Get the checklist and, as a bonus, The Scalp-Calm Kitchen, delivered instantly." />
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
