import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ICMark } from "@/components/brand/ICMark";
import { business, bookHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Your Experience Starts Here | I.C. Beauty",
  description: "Welcome to I.C. Beauty. Choose your path: hair wellness education (resources, downloads and programs) or salon services (styling, personalized care and discovery calls).",
  alternates: { canonical: "/start" },
  // QR landing page from Iisha's business cards; /links and the homepage carry the indexable content.
  robots: { index: false, follow: true },
};

/** Business-card QR destination (Iisha, 2026-11-11): a simple welcome page with two pathways. */
const paths = [
  {
    id: "education",
    eyebrow: "Pathway one",
    title: "Education",
    blurb: "Resources, downloads, and programs.",
    main: { t: "Explore the Hair Wellness Library", h: "/learn" },
    items: [
      { t: "Free download: Hair Health Red Flags checklist", h: "/hair-love" },
      { t: "Guides, downloads & membership", h: "/hub#digital" },
      { t: "30 Days to a New Love Story with Your H.A.I.R.", h: "/hair-love/30-days" },
      { t: "Hands-on hair care classes", h: "/client-programs#classes" },
    ],
  },
  {
    id: "salon",
    eyebrow: "Pathway two",
    title: "Salon Services",
    blurb: "Styling, personalized care, and discovery calls.",
    main: { t: "Request a complimentary discovery call", h: bookHref },
    items: [
      { t: "Services & prices", h: "/client-programs#menu" },
      { t: "Returning clients: book a service", h: "/book?service=all" },
      { t: "Take the free Scalp Self-Check", h: "/scalp-check" },
      { t: "Shop in-salon products", h: "/shop#salon" },
    ],
  },
];

export default function StartPage() {
  return (
    <section className="min-h-dvh bg-bone pb-20 pt-32 text-plum-900" aria-labelledby="start-title">
      <div className="mx-auto w-full max-w-5xl px-4">
        <div className="flex flex-col items-center text-center">
          <ICMark className="h-16 w-auto text-plum-900" />
          <p className="eyebrow mt-6 text-amethyst">Welcome to I.C. Beauty</p>
          <h1 id="start-title" className="mt-3 font-display text-[2.6rem] leading-tight sm:text-[3.4rem]">
            Your experience <span className="italic-accent text-amethyst">starts here.</span>
          </h1>
          <p className="mt-3 max-w-md text-plum-700">Where hair, health &amp; education connect. Choose the path that fits you today.</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {paths.map((p) => (
            <article key={p.id} id={p.id} className="flex flex-col rounded-3xl border border-plum-900/12 bg-paper p-6 sm:p-8" aria-labelledby={`${p.id}-title`}>
              <p className="eyebrow text-amethyst">{p.eyebrow}</p>
              <h2 id={`${p.id}-title`} className="mt-2 font-display text-[2.1rem] leading-tight">{p.title}</h2>
              <p className="mt-1 text-plum-700">{p.blurb}</p>
              <Link href={p.main.h} className="mt-6 flex min-h-[3.5rem] items-center justify-between gap-3 rounded-2xl bg-plum-900 px-5 py-3 font-medium text-bone transition hover:bg-amethyst">
                {p.main.t}
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Link>
              <ul className="mt-3 space-y-2.5">
                {p.items.map((it) => (
                  <li key={it.t}>
                    <Link href={it.h} className="flex min-h-[3.25rem] items-center justify-between gap-3 rounded-2xl border border-plum-900/12 px-5 py-3 transition hover:border-plum-900/40">
                      {it.t}
                      <ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <p className="mt-10 text-center text-[0.85rem] text-plum-700">
          Questions? Call or text <a href={business.phoneHref} className="font-medium underline underline-offset-4">{business.phone}</a> · Virginia &amp; virtual
        </p>
      </div>
    </section>
  );
}
