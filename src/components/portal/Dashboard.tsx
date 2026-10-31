"use client";

import { useMemberName } from "./useMemberName";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Flame, Lock, PlayCircle, Check, Sparkles } from "lucide-react";
import { usePortal } from "./PortalState";
import { lessons, demoMember, habits, todayIndex, nextAppointment, membership } from "@/lib/portal/data";

export function Ring({ value, size = 92, stroke = 8, label }: { value: number; size?: number; stroke?: number; label: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${value}%`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ece4d8" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#6e3f86" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - Math.min(100, value) / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)" }}
      />
      <text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" className="fill-plum-900 font-display" fontSize={size * 0.26}>{value}%</text>
    </svg>
  );
}

export function Dashboard() {
  const { completed, toggleComplete, habitGrid, toggleHabit, habitPercent, streak } = usePortal();
  const memberName = useMemberName();
  const week = demoMember.currentWeek;
  const current = lessons[week - 1];
  const next = lessons[week];
  const journey = Math.round((completed.size / lessons.length) * 100);
  const done = completed.has(week);

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 [&>*]:min-w-0">
      <div>
        <p className="eyebrow text-amethyst">Week {week} of your journey</p>
        <h1 className="mt-2 font-display text-[clamp(2.2rem,1.6rem+2.4vw,3.4rem)] leading-tight text-plum-900">
          Good to see you, <span className="italic-accent text-amethyst">{memberName}.</span>
        </h1>
      </div>

      {/* This week's lesson */}
      <section className="grid overflow-hidden rounded-card bg-plum-950 text-bone md:grid-cols-[1.1fr_1fr]">
        <div className="relative min-h-[14rem]">
          <Image src={`/images/${current.poster}.jpg`} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover opacity-85" />
          <span className="absolute left-4 top-4 rounded-pill bg-brass px-3 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-ink">New this week</span>
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <p className="eyebrow text-brass-soft">Week {current.week} · {current.theme} · {current.minutes} min</p>
          <h2 className="mt-3 font-display text-[2rem] leading-tight">{current.title}</h2>
          <p className="mt-3 text-[0.97rem] text-lilac">{current.summary}</p>
          <div className="mt-auto flex flex-wrap items-center gap-3 pt-6">
            <Link href={`/portal/lessons/${current.week}`} className="inline-flex min-h-[3rem] items-center gap-2 rounded-pill bg-bone px-6 font-sans text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-plum-900 hover:bg-white">
              <PlayCircle className="h-4 w-4" aria-hidden="true" /> {done ? "Rewatch" : "Start lesson"}
            </Link>
            <button type="button" onClick={() => toggleComplete(week)} className={`inline-flex min-h-[3rem] items-center gap-2 rounded-pill border px-5 text-[0.82rem] transition ${done ? "border-brass-soft text-brass-soft" : "border-lilac/30 text-lilac hover:border-bone hover:text-bone"}`}>
              <Check className="h-4 w-4" aria-hidden="true" /> {done ? "Completed" : "Mark complete"}
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Rings */}
        <section className="rounded-card border border-plum-800/10 bg-paper p-6 lg:col-span-2">
          <h2 className="font-display text-[1.6rem] text-plum-900">Your progress</h2>
          <div className="mt-5 grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col items-center gap-2"><Ring value={journey} label="Journey complete" /><span className="text-[0.82rem] text-plum-700">Journey<br />{completed.size} of {lessons.length} lessons</span></div>
            <div className="flex flex-col items-center gap-2"><Ring value={habitPercent} label="Habits this week" /><span className="text-[0.82rem] text-plum-700">Habits<br />this week</span></div>
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-[92px] w-[92px] flex-col items-center justify-center rounded-full bg-sand/70">
                <Flame className="h-6 w-6 text-brass-deep" aria-hidden="true" />
                <span className="font-display text-[1.8rem] leading-none text-plum-900">{streak}</span>
              </span>
              <span className="text-[0.82rem] text-plum-700">Day streak<br />(3+ habits)</span>
            </div>
          </div>
          <Link href="/portal/progress" className="mt-6 inline-flex items-center gap-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-amethyst link-underline">
            Weekly check-in & photos <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>

        {/* Next session */}
        <section className="flex flex-col rounded-card border border-plum-800/10 bg-paper p-6">
          <p className="eyebrow text-amethyst">Your next session with Iisha</p>
          <p className="mt-4 flex items-start gap-3">
            <CalendarDays className="mt-1 h-5 w-5 text-brass-deep" aria-hidden="true" />
            <span><span className="block font-display text-[1.5rem] leading-tight text-plum-900">{nextAppointment.date}</span><span className="text-[0.92rem] text-plum-700">{nextAppointment.time} · {nextAppointment.service} · {nextAppointment.format}</span></span>
          </p>
          <Link href="/portal/treatments" className="mt-auto inline-flex items-center gap-2 pt-6 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-amethyst link-underline">
            Notes & home-care plan <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's habits */}
        <section className="rounded-card border border-plum-800/10 bg-paper p-6 lg:col-span-2">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-[1.6rem] text-plum-900">Today&apos;s habits</h2>
            <span className="text-[0.8rem] text-plum-700">Tap to check off</span>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {habits.map((h) => {
              const on = habitGrid[h.key][todayIndex];
              return (
                <li key={h.key}>
                  <button type="button" onClick={() => toggleHabit(h.key, todayIndex)} aria-pressed={on} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[0.95rem] transition ${on ? "border-amethyst bg-amethyst/[0.07] text-plum-900" : "border-plum-800/12 text-plum-700 hover:border-plum-800/30"}`}>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${on ? "border-amethyst bg-amethyst text-bone" : "border-plum-800/25"}`}>{on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}</span>
                    {h.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Next drop */}
        <section className="flex flex-col rounded-card bg-sand/60 p-6">
          <p className="eyebrow flex items-center gap-2 text-plum-800"><Sparkles className="h-3.5 w-3.5 text-brass-deep" aria-hidden="true" /> Unlocks {membership.dropDay}</p>
          {next && (
            <>
              <h2 className="mt-3 font-display text-[1.6rem] leading-tight text-plum-900">Week {next.week}: {next.title}</h2>
              <p className="mt-2 text-[0.92rem] text-plum-700">{next.summary}</p>
              <p className="mt-auto flex items-center gap-2 pt-5 text-[0.82rem] text-plum-700"><Lock className="h-3.5 w-3.5" aria-hidden="true" /> A new lesson, worksheet and action step every {membership.dropDay}.</p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
