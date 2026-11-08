import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Download, Mail, ArrowRight, Check } from "lucide-react";
import { img } from "@/lib/images";
import { funnel } from "@/lib/funnel";
import { productBySlug } from "@/lib/products";
import { FirstName, FunnelVideo } from "@/components/funnel/FunnelBits";
import { shareMeta } from "@/lib/share";

export const metadata: Metadata = {
  ...shareMeta("/hair-love/welcome"),
  title: "Your checklist is ready",
  description: "Download Hair Health Red Flags Most People Ignore and your bonus food guide.",
  alternates: { canonical: `${funnel.basePath}/welcome` },
  robots: { index: false, follow: false },
};

const dl =
  "group flex items-center gap-4 rounded-card border border-plum-800/10 bg-paper p-4 transition hover:border-amethyst hover:shadow-[0_20px_40px_-25px_rgba(36,19,42,0.4)] sm:p-5";

export default function WelcomePage() {
  const t = funnel.tripwire;
  const soon = !!productBySlug(t.slug)?.comingSoon;
  return (
    <>
      {/* STEP 1: deliver the promise instantly */}
      <section className="bg-sand/60 pb-16 pt-24 sm:pt-28">
        <div className="container-x max-w-4xl">
          <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 font-sans text-[0.68rem] font-medium uppercase tracking-[0.18em] text-plum-700" aria-label="Your progress">
            <li className="flex items-center gap-2 text-amethyst"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-amethyst text-bone"><Check className="h-3 w-3" aria-hidden="true" /></span>Signed up</li>
            <li aria-hidden="true" className="text-brass">—</li>
            <li className="flex items-center gap-2 text-plum-900"><span className="flex h-5 w-5 items-center justify-center rounded-full border border-plum-900">2</span>Download</li>
            <li aria-hidden="true" className="text-brass">—</li>
            <li className="flex items-center gap-2"><span className="flex h-5 w-5 items-center justify-center rounded-full border border-plum-800/30">3</span>Your next step</li>
          </ol>

          <h1 className="rise mt-8 text-[clamp(2.5rem,1.6rem+3.8vw,4.6rem)] leading-[1.03] text-plum-900">
            You&apos;re in, <span className="italic-accent text-amethyst"><FirstName fallback="love" />.</span> Your guides are ready.
          </h1>
          <p className="rise mt-5 max-w-2xl text-lede text-plum-700" style={{ ["--d" as string]: 1 }}>
            Download both below. A copy is on its way to your inbox too. If you don&apos;t see it in a few minutes, check Promotions or Spam and move it to your inbox so you don&apos;t miss what&apos;s next.
          </p>

          <div className="rise mt-10 grid gap-4 md:grid-cols-2" style={{ ["--d" as string]: 2 }}>
            <a href={funnel.leadMagnet.file} download className={dl}>
              <span className="relative block aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md">
                {img("mock-checklist") && <Image src={img("mock-checklist")!} alt="" fill sizes="64px" className="object-cover" />}
              </span>
              <span className="flex-1">
                <span className="eyebrow text-amethyst">Your checklist · PDF</span>
                <span className="mt-1 block font-display text-[1.3rem] leading-tight text-plum-900">{funnel.leadMagnet.title}</span>
              </span>
              <Download className="h-5 w-5 shrink-0 text-amethyst transition group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
            <a href={funnel.bonus.file} download className={dl}>
              <span className="relative block aspect-[3/4] w-16 shrink-0 overflow-hidden rounded-md">
                {img("mock-food-guide") && <Image src={img("mock-food-guide")!} alt="" fill sizes="64px" className="object-cover" />}
              </span>
              <span className="flex-1">
                <span className="eyebrow text-amethyst">Free bonus · PDF</span>
                <span className="mt-1 block font-display text-[1.3rem] leading-tight text-plum-900">{funnel.bonus.title}</span>
              </span>
              <Download className="h-5 w-5 shrink-0 text-amethyst transition group-hover:translate-y-0.5" aria-hidden="true" />
            </a>
          </div>
          <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-plum-700"><Mail className="h-4 w-4 text-amethyst" aria-hidden="true" /> Tip: take the checklist now, while it&apos;s fresh. It takes five minutes.</p>
        </div>
      </section>

      {/* STEP 2: personal video (the bridge) */}
      <section className="bg-paper py-16 lg:py-20">
        <div className="container-x max-w-4xl">
          <p className="eyebrow text-amethyst">A quick message from Iisha</p>
          <h2 className="mt-4 text-title text-plum-900">Before you go, <span className="italic-accent text-amethyst">watch this.</span></h2>
          <div className="mt-8">
            <FunnelVideo src={funnel.video.welcome || undefined} poster={funnel.video.welcomePoster} label="What your score means, and what to do next" />
          </div>
        </div>
      </section>

      {/* STEP 3: one-time low-cost offer (tripwire), sold on-site */}
      <section className="bg-bone py-16 lg:py-24">
        <div className="container-x max-w-5xl">
          <div className="grid overflow-hidden rounded-card border border-amethyst/30 bg-paper shadow-[0_40px_80px_-50px_rgba(36,19,42,0.6)] md:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[16rem] bg-sand">
              {img("lm-food-cover") && <Image src={img("lm-food-cover")!} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />}
              <span className="absolute left-4 top-4 rounded-pill bg-plum-900 px-3.5 py-1.5 font-sans text-[0.66rem] font-medium uppercase tracking-[0.16em] text-bone">{soon ? "Coming soon" : "Your next step"}</span>
            </div>
            <div className="p-7 sm:p-10">
              <p className="eyebrow text-amethyst">Checked anything under Body &amp; Gut?</p>
              <h2 className="mt-4 font-display text-[2.3rem] leading-[1.05] text-plum-900">
                {t.name}: <span className="italic-accent text-amethyst">{t.tagline.toLowerCase()}</span>
              </h2>
              <p className="mt-4 text-[1.02rem] text-plum-700">
                Your hair is built from what your body can absorb. Radiance Rewired walks you through the gut–hair connection and the simple food and lifestyle shifts that nourish your strands from the inside out. It&apos;s the natural next read after your checklist.
              </p>
              <ul className="mt-5 grid gap-2 text-[0.97rem] text-plum-900">
                {["The gut–hair connection, explained simply", "Food & lifestyle shifts you can start today", soon ? "Digital download, launching soon" : "Instant digital download"].map((x) => (
                  <li key={x} className="flex items-start gap-2.5"><Check className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />{x}</li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-5">
                <Link href={soon ? `${t.href}#get` : t.href} className="group inline-flex min-h-[3.4rem] items-center justify-center gap-3 rounded-pill bg-amethyst px-8 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_12px_30px_rgba(110,63,134,0.3)] transition hover:bg-plum-800">
                  {soon ? "Notify me" : `Get it for ${t.price}`} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
                <span className="text-[0.85rem] text-plum-700">{soon ? `Launching soon at ${t.price}` : "One-time · less than a smoothie"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STEP 4: invitation to the core offer */}
      <section className="relative overflow-hidden bg-plum-950 py-20 text-bone lg:py-28">
        <div className="absolute inset-0">
          {img("funnel-hero-woman") && <Image src={img("funnel-hero-woman")!} alt="" fill sizes="100vw" className="object-cover opacity-35" style={{ objectPosition: "50% 30%" }} />}
          <div className="absolute inset-0 bg-gradient-to-r from-plum-950 via-plum-950/85 to-plum-950/40" />
        </div>
        <div className="container-x relative max-w-5xl">
          <p className="eyebrow text-brass-soft">Pilot · {funnel.pilot.when} · Founding seats</p>
          <h2 className="mt-5 max-w-3xl text-display">30 Days to a New Love Story <span className="italic-accent text-lilac">with Your H.A.I.R.</span></h2>
          <p className="mt-6 max-w-xl text-lede text-lilac">
            If you checked four or more boxes, this is for you. It&apos;s my virtual education program to help you embrace your hair, understand what it needs, and care for it with confidence, in 30 days.
          </p>
          <Link href={`${funnel.basePath}/30-days`} className="group mt-9 inline-flex min-h-[3.4rem] items-center justify-center gap-3 rounded-pill bg-bone px-8 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-plum-900 transition hover:bg-white">
            See the program <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </>
  );
}
