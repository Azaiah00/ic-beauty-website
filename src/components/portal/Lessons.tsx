"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Check, Lock, PlayCircle, Download, ArrowLeft, ArrowRight, PenLine } from "lucide-react";
import { usePortal } from "./PortalState";
import { lessons, demoMember, membership, type Lesson } from "@/lib/portal/data";
import { FunnelVideo } from "@/components/funnel/FunnelBits";
import { Needs } from "@/components/ui/Needs";

const unlocked = (w: number) => w <= demoMember.currentWeek;

export function LessonList() {
  const { completed } = usePortal();
  return (
    <div>
      <p className="eyebrow text-amethyst">Lesson library</p>
      <h1 className="mt-2 font-display text-[clamp(2.1rem,1.6rem+2vw,3.2rem)] leading-tight text-plum-900">A new lesson <span className="italic-accent text-amethyst">every {membership.dropDay}.</span></h1>
      <p className="mt-3 max-w-2xl text-plum-700">Each week unlocks a short video, three takeaways, one action step and a worksheet. Go at your pace; everything stays here for as long as you&apos;re a member.</p>
      <ol className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {lessons.map((l) => {
          const open = unlocked(l.week);
          const done = completed.has(l.week);
          const card = (
            <>
              <span className="relative block aspect-video overflow-hidden bg-sand">
                <Image src={`/images/${l.poster}.jpg`} alt="" fill sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw" className={`object-cover transition duration-700 ${open ? "group-hover:scale-[1.03]" : "grayscale opacity-50"}`} />
                <span className={`absolute left-3 top-3 rounded-pill px-2.5 py-1 text-[0.66rem] font-semibold uppercase tracking-[0.14em] ${done ? "bg-sage text-bone" : open ? "bg-bone text-plum-900" : "bg-plum-900 text-lilac"}`}>
                  {done ? "Completed" : open ? (l.week === demoMember.currentWeek ? "This week" : "Open") : `Unlocks week ${l.week}`}
                </span>
              </span>
              <span className="flex flex-1 flex-col p-5">
                <span className="eyebrow text-amethyst">Week {l.week} · {l.theme}</span>
                <span className="mt-2 font-display text-[1.45rem] leading-tight text-plum-900">{l.title}</span>
                <span className="mt-auto flex items-center gap-2 pt-4 text-[0.82rem] text-plum-700">
                  {open ? <PlayCircle className="h-4 w-4 text-amethyst" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
                  {l.minutes} min · Worksheet
                </span>
              </span>
            </>
          );
          return (
            <li key={l.week}>
              {open ? (
                <Link href={`/portal/lessons/${l.week}`} className="group flex h-full flex-col overflow-hidden rounded-card border border-plum-800/10 bg-paper transition hover:border-amethyst">{card}</Link>
              ) : (
                <div className="flex h-full flex-col overflow-hidden rounded-card border border-plum-800/10 bg-paper/70" aria-label={`Week ${l.week}: ${l.title}, locked`}>{card}</div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function LessonDetail({ lesson }: { lesson: Lesson }) {
  const { completed, toggleComplete, reflections, saveReflection } = usePortal();
  const [draft, setDraft] = useState(reflections[lesson.week] ?? "");
  const [saved, setSaved] = useState(false);
  const open = unlocked(lesson.week);
  const done = completed.has(lesson.week);
  const prev = lessons[lesson.week - 2];
  const next = lessons[lesson.week];

  if (!open) {
    return (
      <div className="rounded-card border border-plum-800/10 bg-paper p-10 text-center">
        <Lock className="mx-auto h-8 w-8 text-plum-700" aria-hidden="true" />
        <h1 className="mt-4 font-display text-[2rem] text-plum-900">Week {lesson.week}: {lesson.title}</h1>
        <p className="mt-2 text-plum-700">This lesson unlocks on {membership.dropDay} of week {lesson.week}.</p>
        <Link href="/portal/lessons" className="mt-6 inline-flex items-center gap-2 text-amethyst link-underline"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to lessons</Link>
      </div>
    );
  }

  return (
    <article>
      <Link href="/portal/lessons" className="inline-flex items-center gap-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-700 hover:text-amethyst"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />All lessons</Link>
      <p className="eyebrow mt-6 text-amethyst">Week {lesson.week} · {lesson.theme} · {lesson.minutes} min</p>
      <h1 className="mt-2 font-display text-[clamp(2.2rem,1.6rem+2.4vw,3.4rem)] leading-tight text-plum-900">{lesson.title}</h1>
      <p className="mt-3 max-w-3xl text-lede text-plum-700">{lesson.summary}</p>

      <div className="mt-8"><FunnelVideo poster={`/images/${lesson.poster}.jpg`} label={`Week ${lesson.week}: ${lesson.title}`} /></div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-card border border-plum-800/10 bg-paper p-6 lg:col-span-2">
          <h2 className="font-display text-[1.6rem] text-plum-900">Three things to remember</h2>
          <ol className="mt-4 grid gap-3">
            {lesson.takeaways.map((t, i) => (
              <li key={t} className="flex gap-4"><span className="font-display text-[1.8rem] italic leading-none text-brass">{i + 1}</span><span className="pt-1 text-[1rem] text-plum-900">{t}</span></li>
            ))}
          </ol>
          <div className="mt-6 rounded-xl bg-sand/60 p-5">
            <p className="eyebrow text-plum-800">Your action step</p>
            <p className="mt-2 font-display text-[1.35rem] leading-snug text-plum-900">{lesson.action}</p>
          </div>
        </section>

        <section className="flex flex-col rounded-card bg-plum-950 p-6 text-bone">
          <p className="eyebrow text-brass-soft">Worksheet</p>
          <h2 className="mt-3 font-display text-[1.5rem] leading-tight">{lesson.worksheet.title}</h2>
          {lesson.worksheet.file ? (
            <a href={lesson.worksheet.file} download className="mt-auto inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-pill bg-bone px-5 pt-0 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-plum-900 hover:bg-white">
              <Download className="h-4 w-4" aria-hidden="true" /> Download PDF
            </a>
          ) : (
            <p className="mt-auto pt-4"><Needs tone="light">Worksheet to design</Needs></p>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-card border border-plum-800/10 bg-paper p-6">
        <label htmlFor="reflection" className="flex items-center gap-2 font-display text-[1.5rem] text-plum-900"><PenLine className="h-5 w-5 text-amethyst" aria-hidden="true" /> Reflection</label>
        <p className="mt-1 text-[0.95rem] text-plum-700">{lesson.reflection}</p>
        <textarea id="reflection" rows={4} value={draft} onChange={(e) => { setDraft(e.target.value); setSaved(false); }} className="mt-4 w-full rounded-xl border border-plum-800/15 bg-bone px-4 py-3 text-[1rem] text-ink outline-none focus:border-amethyst focus:ring-2 focus:ring-amethyst/20" placeholder="Write freely. Only you and Iisha can see this." />
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <button type="button" onClick={() => { saveReflection(lesson.week, draft); setSaved(true); }} className="rounded-pill bg-plum-900 px-5 py-2.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst">Save reflection</button>
          <span aria-live="polite" className="text-[0.85rem] text-sage">{saved ? "Saved to your journal." : ""}</span>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-plum-800/10 pt-6">
        <button type="button" onClick={() => toggleComplete(lesson.week)} className={`inline-flex min-h-[3rem] items-center gap-2 rounded-pill px-6 font-sans text-[0.74rem] font-semibold uppercase tracking-[0.14em] transition ${done ? "bg-sage text-bone" : "bg-amethyst text-bone hover:bg-plum-800"}`}>
          <Check className="h-4 w-4" aria-hidden="true" /> {done ? "Completed" : "Mark lesson complete"}
        </button>
        <div className="flex gap-4 text-[0.8rem]">
          {prev && <Link href={`/portal/lessons/${prev.week}`} className="inline-flex items-center gap-1.5 text-plum-700 hover:text-amethyst"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Week {prev.week}</Link>}
          {next && unlocked(next.week) && <Link href={`/portal/lessons/${next.week}`} className="inline-flex items-center gap-1.5 text-plum-700 hover:text-amethyst">Week {next.week}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>}
        </div>
      </div>
    </article>
  );
}
