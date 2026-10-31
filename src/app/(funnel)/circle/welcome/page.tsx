import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, ShieldCheck } from "lucide-react";
import { membership, lessons } from "@/lib/portal/data";
import { FirstName } from "@/components/funnel/FunnelBits";

export const metadata: Metadata = {
  title: `Welcome to ${membership.name}`,
  alternates: { canonical: "/circle/welcome" },
  robots: { index: false, follow: false },
};

export default function CircleWelcome() {
  const w1 = lessons[0];
  return (
    <section className="min-h-[88dvh] bg-sand/60 pb-20 pt-28">
      <div className="container-x max-w-3xl">
        <span className="rise flex h-14 w-14 items-center justify-center rounded-full bg-amethyst text-bone"><Check className="h-7 w-7" aria-hidden="true" /></span>
        <h1 className="rise mt-8 text-[clamp(2.5rem,1.6rem+3.8vw,4.4rem)] leading-[1.03] text-plum-900" style={{ ["--d" as string]: 1 }}>
          Welcome to the Circle, <span className="italic-accent text-amethyst"><FirstName fallback="love" />.</span>
        </h1>
        <p className="rise mt-6 text-lede text-plum-700" style={{ ["--d" as string]: 2 }}>
          Your {membership.trialDays}-day free trial has started. Your first lesson, <strong className="text-plum-900">Week 1: {w1.title}</strong>, is unlocked and waiting for you.
        </p>
        <div className="rise mt-8 rounded-card border border-plum-800/10 bg-paper p-6" style={{ ["--d" as string]: 3 }}>
          <p className="eyebrow text-amethyst">Do these 3 things today</p>
          <ol className="mt-4 grid gap-3 text-[1rem] text-plum-900">
            <li><span className="mr-2 font-display text-[1.3rem] italic text-brass">1</span>Watch Week 1 (12 minutes)</li>
            <li><span className="mr-2 font-display text-[1.3rem] italic text-brass">2</span>Take your 4 baseline photos</li>
            <li><span className="mr-2 font-display text-[1.3rem] italic text-brass">3</span>Check off one habit, today</li>
          </ol>
        </div>
        <p className="mt-6 flex items-start gap-2 text-[0.88rem] text-plum-700">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sage" aria-hidden="true" />
          Already one of Iisha&apos;s clients? She&apos;ll approve your account and connect your session notes and home-care plan within 24 hours.
        </p>
        <Link href="/portal" className="group mt-9 inline-flex min-h-[3.6rem] items-center justify-center gap-3 rounded-pill bg-amethyst px-9 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_12px_30px_rgba(110,63,134,0.32)] hover:bg-plum-800">
          Open my portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
