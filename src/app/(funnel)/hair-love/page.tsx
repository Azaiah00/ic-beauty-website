import type { Metadata } from "next";
import Image from "next/image";
import { Check, Gift } from "lucide-react";
import { img } from "@/lib/images";
import { funnel } from "@/lib/funnel";
import { OptInForm } from "@/components/funnel/OptInForm";
import { StickyCta } from "@/components/funnel/FunnelBits";
import { shareMeta } from "@/lib/share";

export const metadata: Metadata = {
  ...shareMeta("/hair-love"),
  title: "Free: Hair Health Red Flags Most People Ignore",
  description:
    "Iisha C. Silver's free 5-minute self-check: 13 scalp, routine and body red flags most women ignore, plus exactly what to do next. Bonus: The Scalp-Calm Kitchen food guide.",
  alternates: { canonical: funnel.basePath },
  robots: { index: false, follow: true },
};

const inside = [
  { t: "13 red flags, 3 areas", d: "Scalp & hair, product & routine, and body & gut: the signs most people miss." },
  { t: "Your score + your next step", d: "A simple tally that tells you whether your hair is happy, whispering, or asking for a plan." },
  { t: "When it's medical", d: "The signs that mean it's time to see a board-certified dermatologist." },
  { t: "Your hair baseline", d: "A one-page tracker so you can actually see your progress in 30 days." },
];

export default function OptInPage() {
  const portrait = img("iisha-portrait");
  return (
    <>
      {/* HERO: promise + form, above the fold on mobile */}
      <section className="relative overflow-hidden bg-sand/60 pb-16 pt-24 sm:pt-28 lg:pb-24">
        <div className="container-x relative grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow rise text-amethyst" style={{ ["--d" as string]: 0 }}>Free download · 5-minute self-check</p>
            <h1 className="rise mt-5 text-[clamp(2.6rem,1.6rem+4.2vw,5rem)] leading-[1.02] text-plum-900" style={{ ["--d" as string]: 1 }}>
              Your hair has been <span className="italic-accent text-amethyst">talking.</span> Are you listening?
            </h1>
            <p className="rise mt-6 max-w-xl text-lede text-plum-700" style={{ ["--d" as string]: 2 }}>
              Get <strong className="text-plum-900">{funnel.leadMagnet.title}</strong>, the free checklist Iisha uses to spot the scalp, routine and body signs most women ignore, before they turn into breakage, thinning or setbacks.
            </p>

            {/* Mobile: show the guide right here so the form stays near the top */}
            <div className="rise mt-8 flex items-center gap-4 lg:hidden" style={{ ["--d" as string]: 3 }}>
              <span className="relative block aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-lg shadow-[0_14px_30px_-12px_rgba(36,19,42,0.5)]">
                {img("mock-checklist") && <Image src={img("mock-checklist")!} alt="Hair Health Red Flags checklist cover" fill sizes="96px" className="object-cover" priority />}
              </span>
              <p className="text-[0.92rem] text-plum-700"><strong className="text-plum-900">{funnel.leadMagnet.pages}-page printable PDF</strong><br />Instant download, plus a free bonus food guide.</p>
            </div>

            <div className="rise mt-8 max-w-md rounded-card bg-paper p-5 shadow-[0_30px_60px_-35px_rgba(36,19,42,0.45)] sm:p-7" style={{ ["--d" as string]: 3 }} id="get">
              <OptInForm cta="Send me the checklist" />
            </div>
          </div>

          <div className="relative hidden lg:col-span-6 lg:block">
            <div className="relative mx-auto w-[78%]">
              <div className="relative aspect-[3/4] -rotate-2 overflow-hidden rounded-xl shadow-[0_50px_90px_-40px_rgba(36,19,42,0.6)] settle">
                {img("mock-checklist") && <Image src={img("mock-checklist")!} alt="Hair Health Red Flags checklist cover" fill sizes="40vw" className="object-cover" priority />}
              </div>
              <div className="absolute -bottom-10 -left-14 w-[46%] rotate-3 overflow-hidden rounded-lg shadow-[0_40px_70px_-30px_rgba(36,19,42,0.6)]">
                <div className="relative aspect-[3/4]">
                  {img("mock-food-guide") && <Image src={img("mock-food-guide")!} alt="The Scalp-Calm Kitchen food guide cover" fill sizes="20vw" className="object-cover" />}
                </div>
              </div>
              <span className="absolute -right-4 top-10 inline-flex items-center gap-2 rounded-pill bg-plum-900 px-4 py-2 font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em] text-bone shadow-lg">
                <Gift className="h-3.5 w-3.5 text-brass-soft" aria-hidden="true" /> + Free bonus guide
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S INSIDE */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-amethyst" data-reveal>What's inside</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Five minutes. <span className="italic-accent text-amethyst">Real answers.</span></h2>
            <p className="mt-5 text-lede text-plum-700" data-reveal>Stop guessing, stop switching products, and stop waiting until your hair is &quot;really bad.&quot; This checklist shows you exactly where to start.</p>
          </div>
          <ul className="grid gap-px overflow-hidden rounded-card border border-plum-800/10 bg-plum-800/10 sm:grid-cols-2 lg:col-span-7">
            {inside.map((i) => (
              <li key={i.t} className="bg-paper p-6 sm:p-7" data-reveal>
                <Check className="h-5 w-5 text-amethyst" aria-hidden="true" />
                <h3 className="mt-4 font-display text-[1.55rem] leading-tight text-plum-900">{i.t}</h3>
                <p className="mt-2 text-[0.97rem] text-plum-700">{i.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* BONUS */}
      <section className="bg-plum-950 py-20 text-bone lg:py-24">
        <div className="container-x grid items-center gap-10 md:grid-cols-[minmax(0,15rem)_1fr]">
          <div className="relative mx-auto aspect-[3/4] w-48 overflow-hidden rounded-lg shadow-[0_30px_60px_-25px_rgba(0,0,0,0.6)] md:w-full" data-reveal>
            {img("mock-food-guide") && <Image src={img("mock-food-guide")!} alt="The Scalp-Calm Kitchen food guide" fill sizes="240px" className="object-cover" />}
          </div>
          <div>
            <p className="eyebrow text-brass-soft" data-reveal>Free bonus · {funnel.bonus.pages} pages</p>
            <h2 className="mt-4 text-title" data-reveal>{funnel.bonus.title}</h2>
            <p className="mt-4 max-w-2xl text-lede text-lilac" data-reveal>{funnel.bonus.subtitle}. Yours free with the checklist.</p>
          </div>
        </div>
      </section>

      {/* MEET IISHA */}
      <section className="bg-bone py-20 lg:py-28">
        <div className="container-x grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden arch bg-sand" data-reveal="image">
              {portrait && <Image src={portrait} alt="Iisha C. Silver, I.C. Beauty" fill sizes="(min-width: 768px) 35vw, 90vw" className="object-cover" style={{ objectPosition: "50% 18%" }} />}
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="eyebrow text-amethyst" data-reveal>From Iisha</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Healthy awareness <span className="italic-accent text-amethyst">is rare.</span></h2>
            <p className="mt-5 text-lede text-plum-700" data-reveal>
              I&apos;m Iisha C. Silver, a holistic hair recovery practitioner, educator, and the creator of the H.A.I.R. Wellness Method. I&apos;ve spent my career helping women understand what their scalp has been trying to tell them, then teaching them to care for it with confidence. This checklist is where that starts for you.
            </p>
            <a href="#get" className="mt-8 inline-flex min-h-[3.4rem] items-center justify-center rounded-pill bg-amethyst px-8 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_12px_30px_rgba(110,63,134,0.3)] transition hover:bg-plum-800" data-reveal>
              Send me the checklist
            </a>
          </div>
        </div>
      </section>
      <StickyCta href="#get" label="Get the free checklist" />
    </>
  );
}
