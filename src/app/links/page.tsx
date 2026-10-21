import type { Metadata } from "next";
import Image from "next/image";
import { img } from "@/lib/images";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ICMark } from "@/components/brand/ICMark";
import { links, bookHref } from "@/lib/site";
import { InstagramIcon, TikTokIcon, YoutubeIcon, FacebookIcon } from "@/components/ui/SocialIcons";

export const metadata: Metadata = {
  title: "Links: Book, Learn & Shop with Iisha",
  description: "Every I.C. Beauty link in one place: book a discovery call, take the Scalp Self-Check, digital guides, supplements, classes, and speaking.",
  alternates: { canonical: "/links" },
};

/** Replaces Linktree: keeps every bio click on her own domain (SEO + analytics + no monthly fee). */
const groups = [
  {
    title: "Client bookings",
    note: "Hair recovery & hair care consult · openings 4–12 weeks out",
    items: [
      { t: "Book your Phase 1 discovery call", h: bookHref, primary: true },
      { t: "Phase 2: Hair recovery consultation form", h: links.phase2Form },
      { t: "Take the free Scalp Self-Check", h: "/scalp-check" },
    ],
  },
  {
    title: "Learn",
    items: [
      { t: "Radiance Rewired: heal your gut ($7.99)", h: links.stanRadiance },
      { t: "Free Hair Health Checklist", h: links.stan },
      { t: "Free Psoriasis / Dermatitis Food List", h: links.stanFoodList },
      { t: "Let's Talk About… YouTube series", h: links.youtube },
      { t: "The Hair Wellness Library", h: "/learn" },
    ],
  },
  {
    title: "Holistic solutions",
    items: [
      { t: "Digestive enzyme deal: $1", h: links.digestiveEnzyme },
      { t: "Custom sound therapy", h: links.stan },
      { t: "What is frequency energy medicine?", h: links.frequencyVideo },
      { t: "AO Youth collagen-boosting supplement", h: links.aoYouth },
      { t: "Red light therapy", h: links.redLight },
      { t: "Everything in The Hub", h: "/hub" },
    ],
  },
  {
    title: "Work with Iisha",
    items: [
      { t: "Classes for stylists", h: "/professional-education" },
      { t: "Book Iisha to speak", h: "/speaking" },
    ],
  },
];

export default function LinksPage() {
  return (
    <section className="min-h-dvh bg-bone pb-20 pt-32 text-plum-900">
      <div className="mx-auto w-full max-w-xl px-4">
        <div className="flex flex-col items-center text-center">
          <span className="relative block h-28 w-28 overflow-hidden rounded-full ring-1 ring-brass/60 ring-offset-4 ring-offset-bone">{img("iisha-portrait") ? <Image src={img("iisha-portrait")!} alt="Iisha C. Silver" fill sizes="112px" className="object-cover" style={{ objectPosition: "72% 22%" }} /> : <ICMark className="h-16 w-auto text-plum-900" />}</span>
          <h1 className="mt-6 font-display text-[2.4rem] leading-tight">Look as good as you feel</h1>
          <p className="mt-2 text-plum-700">Health, restoration, and education, inside and out. Iisha C. Silver · I.C. Beauty</p>
          <ul className="mt-5 flex gap-2" aria-label="Social media">
            {[
              { h: links.instagram, l: "Instagram", I: InstagramIcon },
              { h: links.tiktok, l: "TikTok", I: TikTokIcon },
              { h: links.youtube, l: "YouTube", I: YoutubeIcon },
              { h: links.facebook, l: "Facebook", I: FacebookIcon },
            ].map(({ h, l, I }) => (
              <li key={l}><a href={h} target="_blank" rel="noopener noreferrer" aria-label={`${l} (opens in a new tab)`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-plum-900/20 hover:border-plum-900"><I className="h-[18px] w-[18px]" aria-hidden="true" /></a></li>
            ))}
          </ul>
        </div>
        {groups.map((g) => (
          <div key={g.title} className="mt-10">
            <h2 className="eyebrow text-amethyst">{g.title}</h2>
            {g.note && <p className="mt-1 text-[0.85rem] text-plum-700">{g.note}</p>}
            <ul className="mt-3 space-y-2.5">
              {g.items.map((it) => {
                const ext = it.h.startsWith("http");
                const cls = `flex min-h-[3.5rem] items-center justify-between gap-3 rounded-2xl border px-5 py-3 transition ${"primary" in it && it.primary ? "border-plum-900 bg-plum-900 font-medium text-bone hover:bg-amethyst" : "border-plum-900/12 bg-paper hover:border-plum-900/40"}`;
                return (
                  <li key={it.t}>
                    {ext ? (
                      <a href={it.h} target="_blank" rel="noopener noreferrer" className={cls}>{it.t}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /><span className="sr-only">(opens in a new tab)</span></a>
                    ) : (
                      <Link href={it.h} className={cls}>{it.t}<ArrowUpRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <p className="mt-10 text-center text-[0.75rem] text-plum-700">Some links are affiliate links. Supplements are not intended to diagnose, treat, cure, or prevent any disease.</p>
      </div>
    </section>
  );
}
