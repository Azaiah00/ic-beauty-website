import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, ShieldCheck, Download } from "lucide-react";
import { img } from "@/lib/images";
import { products, productBySlug } from "@/lib/products";
import { funnel } from "@/lib/funnel";
import { Btn } from "@/components/ui/Btn";
import { Needs } from "@/components/ui/Needs";
import { ProductRequestForm } from "@/components/shop/ProductRequestForm";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";
import { SITE_URL, business } from "@/lib/site";
import { shareMeta } from "@/lib/share";

export function generateStaticParams() {
  return products.filter((p) => !p.freeHref && !p.redirectTo).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = productBySlug((await params).slug);
  if (!p) return {};
  return {
    title: `${p.name}: ${p.tagline}`,
    description: p.description,
    alternates: { canonical: `/shop/${p.slug}` },
    ...shareMeta(`/shop/${p.slug}`),
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = productBySlug((await params).slug);
  if (!p) notFound();
  if (p.freeHref) redirect(p.freeHref);
  if (p.redirectTo) redirect(p.redirectTo);
  const src = img(p.image);
  const priceNum = p.price.replace(/[^0-9.]/g, "");

  const productNode = {
    "@type": "Product",
    "@id": `${SITE_URL}/shop/${p.slug}#product`,
    name: p.name,
    description: p.description,
    brand: { "@type": "Brand", name: business.name },
    image: src ? `${SITE_URL}${src}` : undefined,
    offers: {
      "@type": "Offer",
      price: priceNum,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/shop/${p.slug}`,
      seller: { "@type": "Organization", name: business.legalName },
    },
  };

  return (
    <>
      <JsonLd data={graph(productNode, breadcrumb([{ name: "Shop", path: "/shop" }, { name: p.name, path: `/shop/${p.slug}` }]))} />
      <section className="bg-bone pb-20 pt-32 sm:pt-40">
        <div className="container-x">
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-[0.68rem] font-medium uppercase tracking-[0.2em] text-plum-700">
              <li><Link href="/" className="hover:text-amethyst">Home</Link></li>
              <li aria-hidden="true" className="text-brass">/</li>
              <li><Link href="/shop" className="hover:text-amethyst">Shop</Link></li>
              <li aria-hidden="true" className="text-brass">/</li>
              <li aria-current="page" className="text-amethyst">{p.name}</li>
            </ol>
          </nav>

          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-6">
              <div className="relative aspect-[4/5] overflow-hidden arch bg-sand shadow-[0_40px_80px_-40px_rgba(36,19,42,0.45)]">
                {src && <Image src={src} alt={p.name} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover settle" />}
              </div>
            </div>

            <div className="lg:col-span-6">
              <p className="eyebrow text-amethyst">{p.kind}</p>
              <h1 className="mt-4 text-display text-plum-900">{p.name}</h1>
              <p className="mt-4 font-display text-[1.6rem] italic leading-snug text-amethyst">{p.tagline}</p>
              <p className="mt-6 text-lede text-plum-700">{p.description}</p>

              <ul className="mt-8 grid gap-3">
                {p.includes.map((i) => (
                  <li key={i} className="flex items-start gap-3 text-[1rem] text-plum-900">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" /> {i}
                  </li>
                ))}
              </ul>

              <div id="get" className="mt-10 scroll-mt-28 rounded-card border border-plum-800/10 bg-paper p-6 sm:p-8">
                <div className="flex items-baseline justify-between gap-4">
                  {p.comingSoon ? (
                    <p className="font-display text-[2.2rem] leading-none text-plum-900">Coming soon</p>
                  ) : (
                    <p className="font-display text-[2.6rem] leading-none text-plum-900">{p.price}</p>
                  )}
                  {p.comingSoon ? <p className="text-[0.9rem] text-plum-700">Launching at {p.price}</p> : p.priceNote && <p className="text-[0.9rem] text-plum-700">{p.priceNote}</p>}
                </div>
                <div className="mt-6">
                  {p.comingSoon ? (
                    <ProductRequestForm product={p.name} price={p.price} notify />
                  ) : p.checkoutUrl ? (
                    <Btn href={p.checkoutUrl} size="lg" className="w-full">Buy now · {p.price}</Btn>
                  ) : (
                    <ProductRequestForm product={p.name} price={p.price} />
                  )}
                </div>
                <p className={`mt-5 items-center gap-2 text-[0.82rem] text-plum-700 ${p.comingSoon ? "hidden" : "flex"}`}>
                  <ShieldCheck className="h-4 w-4 text-sage" aria-hidden="true" /> Secure checkout through Square
                  <span className="mx-1 text-brass">·</span>
                  <Download className="h-4 w-4 text-sage" aria-hidden="true" /> Digital delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-plum-950 py-20 text-bone">
        <div className="container-x grid items-center gap-10 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-brass-soft">Not sure where to start?</p>
            <h2 className="mt-4 text-title">Take the free <span className="italic-accent text-lilac">Hair Health Red Flags</span> check first.</h2>
            <p className="mt-4 max-w-xl text-lilac">Five minutes, thirteen signs, and a clear next step, plus The Scalp-Calm Kitchen food guide as a bonus.</p>
          </div>
          <Btn href={funnel.basePath} variant="light" size="lg">Get the free checklist</Btn>
        </div>
      </section>
    </>
  );
}
