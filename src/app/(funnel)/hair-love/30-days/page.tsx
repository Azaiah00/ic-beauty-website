import type { Metadata } from "next";
import Image from "next/image";
import { Check, X, Video, Library, CalendarCheck, Users } from "lucide-react";
import { img } from "@/lib/images";
import { funnel, pilotWeeks, pilotIncludes, pilotTiers, pilotFaq } from "@/lib/funnel";
import { Needs } from "@/components/ui/Needs";
import { FAQList } from "@/components/sections/FAQList";
import { FunnelVideo, StickyCta } from "@/components/funnel/FunnelBits";
import { PilotApplyForm } from "@/components/funnel/PilotApplyForm";
import { shareMeta } from "@/lib/share";

export const metadata: Metadata = {
  ...shareMeta("/hair-love/30-days"),
  title: "30 Days to a New Love Story with Your H.A.I.R. | Founding Seats",
  description:
    "Iisha C. Silver's virtual hair education program. Learn to embrace, understand and confidently care for your hair in 30 days. Pilot cohort, February 2027. Founding seats are limited.",
  alternates: { canonical: `${funnel.basePath}/30-days` },
  robots: { index: false, follow: true },
};

const icons = [Video, Library, CalendarCheck, Users];

function ApplyButton({ label = "Apply for a founding seat", light = false }: { label?: string; light?: boolean }) {
  return (
    <a
      href="#apply"
      className={`inline-flex min-h-[3.6rem] items-center justify-center rounded-pill px-9 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] transition ${
        light ? "bg-bone text-plum-900 hover:bg-white" : "bg-amethyst text-bone shadow-[0_12px_30px_rgba(110,63,134,0.32)] hover:bg-plum-800"
      }`}
    >
      {label}
    </a>
  );
}

function Price({ value, tone = "dark" }: { value: string; tone?: "dark" | "light" }) {
  return value ? <span className="font-display text-[2.6rem] leading-none">{value}</span> : <Needs tone={tone}>Founding price: confirm with Iisha</Needs>;
}

export default function PilotPage() {
  const p = funnel.pilot;
  const portrait = img("iisha-portrait");
  return (
    <>
      {/* 1 HOOK + VIDEO + PROMISE + CTA */}
      <section className="relative overflow-hidden bg-sand/60 pb-16 pt-24 sm:pt-28 lg:pb-24">
        <div className="container-x relative max-w-5xl text-center">
          <p className="eyebrow rise text-amethyst">{p.format} · Pilot {p.when} · Founding seats</p>
          <h1 className="rise mx-auto mt-5 max-w-4xl text-[clamp(2.5rem,1.5rem+4.2vw,5.2rem)] leading-[1.02] text-plum-900" style={{ ["--d" as string]: 1 }}>
            What if February was the month you <span className="italic-accent text-amethyst">fell back in love</span> with your hair?
          </h1>
          <p className="rise mx-auto mt-6 max-w-2xl text-lede text-plum-700" style={{ ["--d" as string]: 2 }}>
            <strong className="text-plum-900">{p.name}</strong> is a 30-day virtual program that teaches you to embrace your hair, understand what it needs, and confidently care for it, from the inside out.
          </p>
          <div className="rise mx-auto mt-10 max-w-4xl" style={{ ["--d" as string]: 3 }}>
            <FunnelVideo src={funnel.video.pilot || undefined} poster={funnel.video.pilotPoster} label="Watch with sound: inside the 30 days" />
          </div>
          <div className="mt-10 flex flex-col items-center gap-3">
            <ApplyButton />
            <p className="flex flex-wrap items-center justify-center gap-2 text-[0.85rem] text-plum-700">
              {p.seats ? <span>Only {p.seats} founding seats</span> : <Needs>Seat count: confirm</Needs>}
              <span className="text-brass">·</span>
              {p.startDate ? <span>Starts {p.startDate}</span> : <Needs>Start date: confirm</Needs>}
            </p>
          </div>
        </div>
      </section>

      {/* 2 PAIN */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-amethyst" data-reveal>Sound familiar?</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>You&apos;ve tried everything, except <span className="italic-accent text-amethyst">understanding it.</span></h2>
          </div>
          <ul className="grid gap-4 lg:col-span-7">
            {[
              "You've bought the oils, the masks, the \"miracle\" products, and you're still guessing.",
              "Breakage keeps showing up in the same spots, and you don't know why.",
              "Your scalp itches, flakes or feels tight, and nothing seems to calm it for long.",
              "Your hair looks fine styled, but on wash day you see the truth.",
              "You love your hair, but some days it feels like the relationship is complicated.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-4 border-b border-plum-800/10 pb-4 text-[1.05rem] text-plum-900" data-reveal>
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amethyst" aria-hidden="true" />
                {t}
              </li>
            ))}
            <li className="pt-2 font-display text-[1.6rem] italic leading-snug text-amethyst" data-reveal>It&apos;s not you. Nobody ever taught you how to read your hair. That&apos;s what these 30 days are for.</li>
          </ul>
        </div>
      </section>

      {/* 3 THE 4 WEEKS */}
      <section className="bg-bone py-20 lg:py-28">
        <div className="container-x">
          <div className="max-w-3xl">
            <p className="eyebrow text-amethyst" data-reveal>The 30-day journey · The H.A.I.R. Wellness Method™</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Embrace. Understand. <span className="italic-accent text-amethyst">Confidently care.</span></h2>
          </div>
          <ol className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pilotWeeks.map((w, i) => (
              <li key={w.week} className="flex flex-col rounded-card border border-plum-800/10 bg-paper p-7" data-reveal>
                <span className="flex items-baseline justify-between">
                  <span className="font-display text-[3rem] italic leading-none text-brass">{String(i + 1).padStart(2, "0")}</span>
                  <span className="eyebrow text-amethyst">{w.theme}</span>
                </span>
                <span className="mt-6 eyebrow text-plum-700">{w.week} · {w.phase}</span>
                <h3 className="mt-2 font-display text-[1.7rem] leading-tight text-plum-900">{w.title}</h3>
                <p className="mt-3 text-[0.97rem] text-plum-700">{w.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4 WHAT YOU GET */}
      <section className="relative overflow-hidden bg-plum-950 py-20 text-bone lg:py-28">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden arch" data-reveal="image">
              {img("funnel-community") && <Image src={img("funnel-community")!} alt="A woman joining a live virtual hair class from home" fill sizes="(min-width: 1024px) 38vw, 90vw" className="object-cover" style={{ objectPosition: "72% 40%" }} />}
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow text-brass-soft" data-reveal>What you get</p>
            <h2 className="mt-5 text-title" data-reveal>Everything you need to <span className="italic-accent text-lilac">stick with it.</span></h2>
            <ul className="mt-10 grid gap-8 sm:grid-cols-2">
              {pilotIncludes.map((x, i) => {
                const I = icons[i];
                return (
                  <li key={x.title} data-reveal>
                    <I className="h-6 w-6 text-brass-soft" aria-hidden="true" strokeWidth={1.4} />
                    <h3 className="mt-4 font-display text-[1.55rem] leading-tight">{x.title}</h3>
                    <p className="mt-2 text-[0.97rem] text-lilac">{x.body}</p>
                  </li>
                );
              })}
            </ul>
            <div className="mt-12" data-reveal><ApplyButton light /></div>
          </div>
        </div>
      </section>

      {/* 5 CHOOSE YOUR PATH */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-amethyst" data-reveal>Two ways to join the pilot</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Choose your <span className="italic-accent text-amethyst">love story.</span></h2>
            <p className="mt-5 text-lede text-plum-700" data-reveal>Founding-member pricing is for the February pilot only, and it will never be this low again.</p>
          </div>
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 md:grid-cols-2">
            {pilotTiers.map((t) => {
              const vip = t.key === "vip";
              return (
                <div key={t.key} className={`relative flex flex-col rounded-card p-8 sm:p-10 ${vip ? "bg-plum-900 text-bone shadow-[0_40px_80px_-40px_rgba(36,19,42,0.7)]" : "border border-plum-800/15 bg-bone text-plum-900"}`} data-reveal>
                  {vip && <span className="absolute -top-3.5 left-8 rounded-pill bg-brass px-4 py-1.5 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-ink">Most personal</span>}
                  <span className={`eyebrow ${vip ? "text-brass-soft" : "text-amethyst"}`}>{t.tag}</span>
                  <h3 className="mt-3 font-display text-[2.1rem] leading-tight">{t.name}</h3>
                  <div className="mt-5 min-h-[2.8rem]"><Price value={vip ? p.vipPrice : p.corePrice} tone={vip ? "light" : "dark"} /></div>
                  <ul className="mt-7 grid flex-1 gap-3">
                    {t.features.map((f) => (
                      <li key={f} className={`flex items-start gap-3 text-[0.98rem] ${vip ? "text-lilac" : "text-plum-700"}`}>
                        <Check className={`mt-1 h-4 w-4 shrink-0 ${vip ? "text-brass-soft" : "text-amethyst"}`} aria-hidden="true" />{f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9"><ApplyButton label={`Apply for ${t.tag}`} light={vip} /></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6 FOUNDING DEAL + WHO IT'S FOR */}
      <section className="bg-bone py-20 lg:py-28">
        <div className="container-x grid gap-8 lg:grid-cols-3">
          <div className="rounded-card bg-sand/60 p-8" data-reveal>
            <p className="eyebrow text-amethyst">The founding-member deal</p>
            <h3 className="mt-4 font-display text-[1.9rem] leading-tight text-plum-900">You get more. <span className="italic-accent text-amethyst">We ask one thing.</span></h3>
            <p className="mt-4 text-[0.98rem] text-plum-700">You get the lowest price this program will ever have and closer access to Iisha than any future group. In return, share honest feedback along the way, and if you love it, a short video about your experience.</p>
          </div>
          <div className="rounded-card border border-plum-800/12 bg-paper p-8" data-reveal>
            <p className="eyebrow text-amethyst">This is for you if…</p>
            <ul className="mt-5 grid gap-3">
              {["You're tired of guessing and switching products", "You want to understand your hair, not just style it", "You can give 2–3 hours a week in February", "You're ready to start from where you are"].map((x) => (
                <li key={x} className="flex items-start gap-3 text-[0.98rem] text-plum-900"><Check className="mt-1 h-4 w-4 shrink-0 text-sage" aria-hidden="true" />{x}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-card border border-plum-800/12 bg-paper p-8" data-reveal>
            <p className="eyebrow text-plum-700">It&apos;s not for you if…</p>
            <ul className="mt-5 grid gap-3">
              {["You want a magic product, not a new habit", "You're looking for medical treatment (see a dermatologist first)", "You won't have time to show up in February"].map((x) => (
                <li key={x} className="flex items-start gap-3 text-[0.98rem] text-plum-700"><X className="mt-1 h-4 w-4 shrink-0 text-[#b4533c]" aria-hidden="true" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 7 MEET IISHA */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden arch bg-sand" data-reveal="image">
              {portrait && <Image src={portrait} alt="Iisha C. Silver" fill sizes="(min-width: 768px) 35vw, 90vw" className="object-cover" style={{ objectPosition: "50% 18%" }} />}
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="eyebrow text-amethyst" data-reveal>Your guide</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Iisha C. Silver</h2>
            <p className="mt-3 font-display text-[1.4rem] italic text-amethyst" data-reveal>Holistic Hair Recovery Practitioner &amp; Service Educator</p>
            <p className="mt-6 text-lede text-plum-700" data-reveal>
              Brooklyn roots, Richmond studio, and a career spent connecting hair, health and education. Iisha created the H.A.I.R. Wellness Method (Healthy Awareness Is Rare) to teach women what their scalp is saying and how to answer it with confidence. This program brings that method home to you.
            </p>
          </div>
        </div>
      </section>

      {/* 8 FAQ */}
      <section className="bg-bone py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-amethyst" data-reveal>Questions</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Before you <span className="italic-accent text-amethyst">apply.</span></h2>
          </div>
          <div className="lg:col-span-8"><FAQList items={[...pilotFaq]} /></div>
        </div>
      </section>

      {/* 9 APPLICATION */}
      <section id="apply" className="scroll-mt-6 bg-sand/60 py-20 lg:py-28">
        <div className="container-x max-w-3xl">
          <p className="eyebrow text-amethyst">Founding-seat application · 2 minutes</p>
          <h2 className="mt-5 text-title text-plum-900">Your new love story <span className="italic-accent text-amethyst">starts here.</span></h2>
          <p className="mt-5 text-lede text-plum-700">Iisha personally reads every application. If it&apos;s a fit, you&apos;ll get a text or email with your secure link to lock in your seat.</p>
          <div className="mt-10 rounded-card bg-paper p-6 shadow-[0_30px_60px_-40px_rgba(36,19,42,0.45)] sm:p-10">
            <PilotApplyForm />
          </div>
        </div>
      </section>
      <StickyCta href="#apply" label="Apply for a founding seat" after={900} />
    </>
  );
}
