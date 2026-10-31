import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PlayCircle, LineChart, ListChecks, Stethoscope, Download, CalendarClock, Check, Lock } from "lucide-react";
import { img } from "@/lib/images";
import { membership, lessons } from "@/lib/portal/data";
import { Needs } from "@/components/ui/Needs";
import { FAQList } from "@/components/sections/FAQList";
import { StickyCta } from "@/components/funnel/FunnelBits";
import { shareMeta } from "@/lib/share";

export const metadata: Metadata = {
  ...shareMeta("/circle"),
  title: `${membership.name} | Monthly Hair Wellness Membership`,
  description:
    "A new hair wellness lesson every Monday, a private portal to track your progress, worksheets to download, and your care notes from Iisha C. Silver, all in one affordable monthly membership.",
  alternates: { canonical: "/circle" },
  robots: { index: false, follow: true },
};

const features = [
  { Icon: PlayCircle, t: "A new lesson every Monday", d: "Short videos (10–16 minutes) with three takeaways and one action step. Learn something real every week." },
  { Icon: LineChart, t: "Progress you can see", d: "Weekly check-ins, a trend chart, and photo check-ins so you can watch your hair (and your confidence) change." },
  { Icon: ListChecks, t: "A daily habit tracker", d: "Water, protein, scalp massage, satin, low-tension styles. Tap to check off and build your streak." },
  { Icon: Download, t: "Worksheets & guides", d: "Every lesson comes with a printable worksheet, and your library grows each week." },
  { Icon: Stethoscope, t: "Your care with Iisha", d: "Clients in treatment see session notes, their home-care plan and the next appointment, all in one place." },
  { Icon: CalendarClock, t: "Monthly live Q&A", d: "Bring your questions to Iisha once a month. Replays live in your portal." },
];

const faq = [
  { q: "How much is it?", a: "The membership is billed monthly (or yearly at a lower price) after a 14-day free trial. Cancel anytime, in two clicks, with no calls and no guilt." },
  { q: "How much time does it take?", a: "About 15 minutes for each week's lesson, plus small daily habits. It's designed for real life." },
  { q: "I'm already one of Iisha's clients. What's different for me?", a: "Your portal also shows your session notes, home-care plan and next appointment, so your in-chair care and your at-home routine finally work together." },
  { q: "Is this medical treatment?", a: "No. It's hair wellness education and support. If you're experiencing sudden, patchy or painful hair loss, start with a board-certified dermatologist, and use the Circle alongside their care." },
  { q: "What if I join late? Do I miss the lessons?", a: "No. You start at Week 1 and a new lesson unlocks each Monday, so everyone gets the full journey in order." },
  { q: "Can I cancel?", a: "Yes, anytime, and you keep access until the end of the period you've paid for." },
];

export default function CirclePage() {
  const preview = img("portal-preview");
  const priceLine = membership.monthlyPrice ? <span><strong className="text-plum-900">{membership.monthlyPrice}/month</strong> after your free trial</span> : <Needs>Monthly price: confirm with Iisha</Needs>;
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-sand/60 pb-16 pt-24 sm:pt-28 lg:pb-24">
        <div className="container-x grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow rise text-amethyst">{membership.name} · Monthly membership</p>
            <h1 className="rise mt-5 text-[clamp(2.5rem,1.5rem+4vw,4.8rem)] leading-[1.03] text-plum-900" style={{ ["--d" as string]: 1 }}>
              Your hair deserves more than <span className="italic-accent text-amethyst">one good wash day.</span>
            </h1>
            <p className="rise mt-6 text-lede text-plum-700" style={{ ["--d" as string]: 2 }}>
              A new lesson every {membership.dropDay}, a private portal that tracks your progress, and Iisha in your corner every week, for less than a bottle of conditioner a month.
            </p>
            <div className="rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ ["--d" as string]: 3 }}>
              <Link href="/circle/join" className="inline-flex min-h-[3.6rem] items-center justify-center rounded-pill bg-amethyst px-8 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_12px_30px_rgba(110,63,134,0.32)] hover:bg-plum-800">
                Start your {membership.trialDays}-day free trial
              </Link>
              <Link href="/portal" className="inline-flex min-h-[3.6rem] items-center justify-center rounded-pill border border-plum-900/25 px-7 font-sans text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900 hover:border-plum-900">
                Peek inside
              </Link>
            </div>
            <p className="rise mt-4 text-[0.88rem] text-plum-700" style={{ ["--d" as string]: 4 }}>{priceLine} · Cancel anytime</p>
          </div>
          <div className="lg:col-span-7">
            <div className="settle overflow-hidden rounded-card border border-plum-800/10 bg-paper shadow-[0_50px_100px_-50px_rgba(36,19,42,0.55)]">
              <div className="flex items-center gap-1.5 border-b border-plum-800/10 bg-bone px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-plum-800/20" /><span className="h-2.5 w-2.5 rounded-full bg-plum-800/20" /><span className="h-2.5 w-2.5 rounded-full bg-plum-800/20" />
                <span className="ml-3 text-[0.72rem] text-plum-700">icbeautyinyou.com/portal</span>
              </div>
              <div className="relative aspect-[16/10] bg-sand">
                {preview && <Image src={preview} alt="The H.A.I.R. Circle member portal: this week's lesson, progress rings, habits and next session" fill priority sizes="(min-width: 1024px) 58vw, 100vw" className="object-cover object-top" />}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x max-w-4xl text-center">
          <p className="eyebrow text-amethyst" data-reveal>Why routines don&apos;t stick</p>
          <h2 className="mt-5 text-title text-plum-900" data-reveal>You don&apos;t need more products. You need <span className="italic-accent text-amethyst">someone in your corner, every week.</span></h2>
          <p className="mx-auto mt-6 max-w-2xl text-lede text-plum-700" data-reveal>
            One great appointment fades by week two. One viral tip gets forgotten by Friday. Real change comes from small, steady steps with someone checking in. That&apos;s what the Circle is.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-bone py-20 lg:py-28">
        <div className="container-x">
          <p className="eyebrow text-amethyst" data-reveal>How it works</p>
          <h2 className="mt-5 max-w-3xl text-title text-plum-900" data-reveal>Fifteen minutes a week. <span className="italic-accent text-amethyst">A lifetime of healthier hair.</span></h2>
          <ol className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["Watch", `Every ${membership.dropDay}, a new short lesson unlocks in your portal.`],
              ["Do", "One action step and a worksheet turn the lesson into a habit."],
              ["Track", "Check off daily habits, rate your week and add progress photos."],
              ["Connect", "Ask Iisha at the monthly live Q&A, and see your care notes if you're a client."],
            ].map(([t, d], i) => (
              <li key={t} className="rounded-card border border-plum-800/10 bg-paper p-7" data-reveal>
                <span className="font-display text-[3rem] italic leading-none text-brass">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 font-display text-[1.8rem] text-plum-900">{t}</h3>
                <p className="mt-2 text-[0.97rem] text-plum-700">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-plum-950 py-20 text-bone lg:py-28">
        <div className="container-x">
          <p className="eyebrow text-brass-soft" data-reveal>Inside your portal</p>
          <h2 className="mt-5 max-w-3xl text-title" data-reveal>Everything in one place, <span className="italic-accent text-lilac">built around you.</span></h2>
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, t, d }) => (
              <li key={t} data-reveal>
                <Icon className="h-6 w-6 text-brass-soft" aria-hidden="true" strokeWidth={1.4} />
                <h3 className="mt-4 font-display text-[1.6rem] leading-tight">{t}</h3>
                <p className="mt-2 text-[0.97rem] text-lilac">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="bg-paper py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-amethyst" data-reveal>Your first 12 weeks</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>A real curriculum, <span className="italic-accent text-amethyst">one week at a time.</span></h2>
            <p className="mt-5 text-plum-700" data-reveal>Built on the H.A.I.R. Wellness Method: Embrace, Understand, Nourish, and Confidently care. New seasons of lessons keep coming after week 12.</p>
          </div>
          <ol className="grid gap-px overflow-hidden rounded-card border border-plum-800/10 bg-plum-800/10 sm:grid-cols-2 lg:col-span-8">
            {lessons.map((l) => (
              <li key={l.week} className="flex items-center gap-4 bg-paper px-5 py-4" data-reveal="fade">
                <span className="w-10 shrink-0 font-display text-[1.5rem] italic text-brass">{String(l.week).padStart(2, "0")}</span>
                <span className="flex-1"><span className="block text-[1rem] text-plum-900">{l.title}</span><span className="text-[0.78rem] uppercase tracking-[0.14em] text-plum-700">{l.theme}</span></span>
                {l.week > 1 && <Lock className="h-3.5 w-3.5 text-plum-700/60" aria-hidden="true" />}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CLIENTS IN TREATMENT */}
      <section className="bg-bone py-20 lg:py-24">
        <div className="container-x grid items-center gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden arch bg-sand" data-reveal="image">
              {img("consultation") && <Image src={img("consultation")!} alt="" fill sizes="(min-width: 768px) 38vw, 90vw" className="object-cover" />}
            </div>
          </div>
          <div className="md:col-span-7">
            <p className="eyebrow text-amethyst" data-reveal>Already one of Iisha&apos;s clients?</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Your appointments and your routine, <span className="italic-accent text-amethyst">finally connected.</span></h2>
            <ul className="mt-8 grid gap-3">
              {["Session notes from Iisha after every visit", "Your home-care plan as a checklist you can actually follow", "Your next appointment and a one-tap request for the next one", "Progress photos and check-ins Iisha can review before you sit in the chair"].map((x) => (
                <li key={x} className="flex items-start gap-3 text-[1.02rem] text-plum-900" data-reveal><Check className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />{x}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="bg-paper py-20 lg:py-28">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow text-amethyst" data-reveal>Simple pricing</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Less than a bottle of conditioner. <span className="italic-accent text-amethyst">Every month.</span></h2>
          </div>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
            {[
              { name: "Monthly", price: membership.monthlyPrice, unit: "/month", note: "Cancel anytime", dark: false },
              { name: "Annual", price: membership.annualPrice, unit: "/year", note: "Best value: one payment, a full year of lessons", dark: true },
            ].map((p) => (
              <div key={p.name} className={`flex flex-col rounded-card p-8 sm:p-10 ${p.dark ? "bg-plum-900 text-bone" : "border border-plum-800/15 bg-bone text-plum-900"}`} data-reveal>
                <span className={`eyebrow ${p.dark ? "text-brass-soft" : "text-amethyst"}`}>{p.name}</span>
                <div className="mt-4 min-h-[3rem]">{p.price ? <span className="font-display text-[3rem] leading-none">{p.price}<span className="text-[1rem]">{p.unit}</span></span> : <Needs tone={p.dark ? "light" : "dark"}>{p.name} price: confirm</Needs>}</div>
                <p className={`mt-2 text-[0.92rem] ${p.dark ? "text-lilac" : "text-plum-700"}`}>{p.note}</p>
                <ul className="mt-6 grid flex-1 gap-2.5">
                  {["Weekly lessons + worksheets", "Progress, habit & photo tracking", "Monthly live Q&A with Iisha", "Care notes for clients in treatment", `${membership.trialDays}-day free trial`].map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-[0.97rem] ${p.dark ? "text-lilac" : "text-plum-700"}`}><Check className={`mt-1 h-4 w-4 shrink-0 ${p.dark ? "text-brass-soft" : "text-amethyst"}`} aria-hidden="true" />{f}</li>
                  ))}
                </ul>
                <Link href="/circle/join" className={`mt-8 inline-flex min-h-[3.4rem] items-center justify-center rounded-pill px-6 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] ${p.dark ? "bg-bone text-plum-900 hover:bg-white" : "bg-amethyst text-bone hover:bg-plum-800"}`}>Start free trial</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-bone py-20 lg:py-28">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="eyebrow text-amethyst" data-reveal>Questions</p>
            <h2 className="mt-5 text-title text-plum-900" data-reveal>Good to <span className="italic-accent text-amethyst">know.</span></h2>
          </div>
          <div className="lg:col-span-8"><FAQList items={faq} /></div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden bg-plum-950 py-24 text-bone">
        <div className="absolute inset-0">
          {img("funnel-community") && <Image src={img("funnel-community")!} alt="" fill sizes="100vw" className="object-cover opacity-30" style={{ objectPosition: "70% 40%" }} />}
          <div className="absolute inset-0 bg-plum-950/70" />
        </div>
        <div className="container-x relative max-w-3xl text-center">
          <h2 className="text-display">Join the <span className="italic-accent text-lilac">Circle.</span></h2>
          <p className="mx-auto mt-5 max-w-xl text-lede text-lilac">Your first lesson is waiting. Start free for {membership.trialDays} days.</p>
          <Link href="/circle/join" className="mt-9 inline-flex min-h-[3.6rem] items-center justify-center rounded-pill bg-bone px-9 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-plum-900 hover:bg-white">Start your free trial</Link>
        </div>
      </section>
      <StickyCta href="/circle/join" label={`Start ${membership.trialDays}-day free trial`} />
    </>
  );
}
