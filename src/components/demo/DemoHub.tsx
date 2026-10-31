"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight, Download, MonitorPlay, MousePointerClick, Keyboard, ShieldCheck } from "lucide-react";
import { demoSteps } from "@/lib/demo";
import { setDemo } from "./useDemo";

const pdfs = [
  { t: "Hair Health Red Flags checklist (5 pages)", f: "/downloads/hair-health-red-flags-checklist.pdf" },
  { t: "The Scalp-Calm Kitchen food guide (10 pages)", f: "/downloads/scalp-calm-kitchen-food-guide.pdf" },
  { t: "Wash Day Blueprint worksheet (2 pages)", f: "/downloads/wash-day-blueprint.pdf" },
];

export function DemoHub() {
  useEffect(() => setDemo(true), []);
  const groups = [
    { n: 1 as const, title: "Funnel 1 · Free checklist → $7.99 guide → February pilot", lede: "For TikTok Live and Instagram traffic: turn a viewer into a lead, a buyer, then a pilot member." },
    { n: 2 as const, title: "Funnel 2 · The H.A.I.R. Circle membership + member portal", lede: "The monthly membership: new value every week, progress tracking, and care notes for clients." },
  ];
  return (
    <section className="bg-bone pb-24 pt-24 sm:pt-28">
      <div className="container-x max-w-5xl">
        <p className="eyebrow text-amethyst">Presenter mode · for Iisha&apos;s walkthrough</p>
        <h1 className="mt-4 text-[clamp(2.4rem,1.5rem+3.4vw,4.2rem)] leading-[1.04] text-plum-900">Walk through every step, <span className="italic-accent text-amethyst">no typing needed.</span></h1>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { I: MonitorPlay, t: "Start anywhere", d: "Tap any step below. A bar at the bottom of every page gives you Back and Next." },
            { I: MousePointerClick, t: "Forms are pre-filled", d: "Just press the button on any form. It moves on like the real thing." },
            { I: Keyboard, t: "Arrow keys work", d: "On a laptop, ← and → move between steps. Talking points sit in the bar." },
            { I: ShieldCheck, t: "Nothing is sent", d: "Demo mode never creates real sign-ups and only affects this browser tab." },
          ].map(({ I, t, d }) => (
            <li key={t} className="rounded-card border border-plum-800/10 bg-paper p-5">
              <I className="h-5 w-5 text-amethyst" aria-hidden="true" strokeWidth={1.6} />
              <p className="mt-3 font-display text-[1.3rem] leading-tight text-plum-900">{t}</p>
              <p className="mt-1 text-[0.88rem] text-plum-700">{d}</p>
            </li>
          ))}
        </ul>

        {groups.map((g) => (
          <div key={g.n} className="mt-14">
            <h2 className="font-display text-[clamp(1.7rem,1.3rem+1.4vw,2.4rem)] leading-tight text-plum-900">{g.title}</h2>
            <p className="mt-2 text-plum-700">{g.lede}</p>
            <ol className="mt-6 grid gap-3">
              {demoSteps.map((s, i) => s.funnel === g.n && (
                <li key={s.path}>
                  <Link href={s.path} onClick={() => setDemo(true)} className="group grid items-start gap-4 rounded-card border border-plum-800/10 bg-paper p-5 transition hover:border-amethyst sm:grid-cols-[3rem_1fr_auto] sm:items-center">
                    <span className="font-display text-[2rem] italic leading-none text-brass">{String(i + 1).padStart(2, "0")}</span>
                    <span>
                      <span className="block font-display text-[1.45rem] leading-tight text-plum-900 group-hover:text-amethyst">{s.title}</span>
                      <span className="mt-1 block text-[0.9rem] text-plum-700">{s.say[0]}</span>
                    </span>
                    <span className="inline-flex items-center gap-2 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-amethyst">
                      Open <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ))}

        <div className="mt-14 rounded-card bg-plum-950 p-7 text-bone sm:p-9">
          <p className="eyebrow text-brass-soft">Show her the downloads</p>
          <ul className="mt-5 grid gap-3 md:grid-cols-3">
            {pdfs.map((p) => (
              <li key={p.f}>
                <a href={p.f} target="_blank" rel="noopener noreferrer" className="flex h-full items-start gap-3 rounded-xl border border-plum-800 p-4 text-[0.95rem] text-lilac transition hover:border-brass-soft hover:text-bone">
                  <Download className="mt-0.5 h-4 w-4 shrink-0 text-brass-soft" aria-hidden="true" />{p.t}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={demoSteps[0].path} onClick={() => setDemo(true)} className="inline-flex min-h-[3.4rem] items-center gap-2 rounded-pill bg-amethyst px-8 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-bone hover:bg-plum-800">
            Start the walkthrough <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link href="/" onClick={() => setDemo(false)} className="inline-flex min-h-[3.4rem] items-center rounded-pill border border-plum-900/25 px-7 font-sans text-[0.74rem] font-medium uppercase tracking-[0.14em] text-plum-900 hover:border-plum-900">
            Exit demo
          </Link>
        </div>
      </div>
    </section>
  );
}
