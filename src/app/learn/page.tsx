import type { Metadata } from "next";
import { img } from "@/lib/images";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { CTABand } from "@/components/sections/CTABand";
import { articles } from "@/lib/articles";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb, ids } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Hair Wellness Library: Hair Loss & Scalp Care Answers",
  description:
    "Straight answers on hair loss, shedding, traction alopecia, scalp care, and healthy hair habits for Black women and textured hair, from Iisha C. Silver and backed by dermatology sources.",
  alternates: { canonical: "/learn" },
};

export default function LearnPage() {
  const cats = Array.from(new Set(articles.map((a) => a.category)));
  return (
    <>
      <JsonLd
        data={graph(breadcrumb([{ name: "Learn", path: "/learn" }]), {
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/learn#collection`,
          name: "The Hair Wellness Library",
          author: { "@id": ids.person },
          hasPart: articles.map((a) => ({ "@type": "Article", headline: a.title, url: `${SITE_URL}/learn/${a.slug}` })),
        })}
      />
      <PageHero
        crumbs={[{ name: "Learn", href: "/learn" }]}
        eyebrow="Class is in session"
        title={<>The Hair Wellness <span className="italic-accent text-amethyst">Library</span></>}
        lede={<p>The questions Iisha hears every week, answered plainly, backed by dermatology sources, and written for textured hair.</p>}
        image={{ src: img("scalp-closeup"), alt: "Hands gently parting healthy coily hair to show the scalp", label: "Scalp care" }}
      />
      <section className="bg-bone py-20 sm:py-28">
        <div className="container-x">
          <ul className="flex flex-wrap gap-2" aria-label="Topics">
            {cats.map((c) => (
              <li key={c} className="rounded-pill border border-plum-800/15 px-4 py-1.5 text-[0.9rem] text-plum-800">{c}</li>
            ))}
          </ul>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((a, i) => (
              <Link key={a.slug} href={`/learn/${a.slug}`} data-reveal className={`group flex flex-col rounded-card p-7 transition sm:p-11 ${i === 0 ? "bg-plum-950 text-bone md:col-span-2 lg:col-span-2" : "border border-plum-800/10 bg-paper hover:border-amethyst/40"}`}>
                <span className={`flex items-center gap-2 ${i === 0 ? "text-brass-soft" : "text-amethyst"}`}>
                  <BookOpen className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
                  <span className="eyebrow">{a.category} · {a.minutes} min read</span>
                </span>
                <h2 className={`mt-5 font-display leading-snug ${i === 0 ? "text-[1.9rem] text-bone sm:text-[2.6rem]" : "text-[1.85rem] text-plum-900"}`}>{a.title}</h2>
                <p className={`mt-3 flex-1 ${i === 0 ? "text-lilac" : "text-plum-700"}`}>{a.description}</p>
                <span className={`mt-8 inline-flex items-center gap-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] ${i === 0 ? "text-brass-soft" : "text-plum-900"}`}>
                  Read the answer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <CTABand />
    </>
  );
}
