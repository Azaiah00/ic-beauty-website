import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Check, MessageCircle, Download, ArrowRight } from "lucide-react";
import { img } from "@/lib/images";
import { funnel } from "@/lib/funnel";
import { FirstName } from "@/components/funnel/FunnelBits";
import { links } from "@/lib/site";
import { shareMeta } from "@/lib/share";

export const metadata: Metadata = {
  ...shareMeta("/hair-love/reserved"),
  title: "Application received",
  description: "Your founding-seat application for 30 Days to a New Love Story with Your H.A.I.R. is in.",
  alternates: { canonical: `${funnel.basePath}/reserved` },
  robots: { index: false, follow: false },
};

export default function ReservedPage() {
  return (
    <section className="relative min-h-[88dvh] overflow-hidden bg-sand/60 pb-20 pt-28">
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <span className="rise flex h-14 w-14 items-center justify-center rounded-full bg-amethyst text-bone"><Check className="h-7 w-7" aria-hidden="true" /></span>
          <h1 className="rise mt-8 text-[clamp(2.5rem,1.6rem+3.8vw,4.6rem)] leading-[1.03] text-plum-900" style={{ ["--d" as string]: 1 }}>
            Your application is in, <span className="italic-accent text-amethyst"><FirstName fallback="love" />.</span>
          </h1>
          <p className="rise mt-6 max-w-xl text-lede text-plum-700" style={{ ["--d" as string]: 2 }}>
            Thank you for saying yes to yourself. Here&apos;s what happens next:
          </p>
          <ol className="rise mt-8 grid max-w-xl gap-5" style={{ ["--d" as string]: 3 }}>
            {[
              ["Iisha reads your application", "Personally. She wants to make sure the program is the right fit for where your hair is right now."],
              ["You'll get a text or email", "If it's a fit, you'll receive your secure link to lock in your founding seat and price."],
              ["You get ready for February", "Welcome details, your schedule and your first-week prep arrive before the pilot begins."],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-4">
                <span className="font-display text-[2rem] italic leading-none text-brass">{String(i + 1).padStart(2, "0")}</span>
                <span><strong className="block font-display text-[1.35rem] font-normal text-plum-900">{t}</strong><span className="text-[0.97rem] text-plum-700">{d}</span></span>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={funnel.leadMagnet.file} download className="inline-flex min-h-[3.2rem] items-center gap-2.5 rounded-pill bg-plum-900 px-6 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-bone hover:bg-amethyst">
              <Download className="h-4 w-4" aria-hidden="true" /> Get the free checklist while you wait
            </a>
            <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[3.2rem] items-center gap-2.5 rounded-pill border border-plum-900/25 px-6 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-plum-900 hover:border-plum-900">
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Follow @i.c.beautybrand
            </a>
          </div>
          <Link href="/shop" className="mt-8 inline-flex items-center gap-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-amethyst link-underline">
            Browse the shop <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
        <div className="hidden lg:col-span-5 lg:block">
          <div className="relative aspect-[4/5] overflow-hidden arch settle">
            {img("funnel-hero-woman") && <Image src={img("funnel-hero-woman")!} alt="" fill priority sizes="40vw" className="object-cover" style={{ objectPosition: "50% 30%" }} />}
          </div>
        </div>
      </div>
    </section>
  );
}
