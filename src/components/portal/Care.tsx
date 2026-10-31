"use client";

import Link from "next/link";
import { CalendarDays, Check, ClipboardList, Download, FileText, MessageCircle } from "lucide-react";
import { usePortal } from "./PortalState";
import { treatments, nextAppointment, downloads, lessons, demoMember } from "@/lib/portal/data";
import { bookHref, business } from "@/lib/site";

export function Care() {
  const { homeCare, toggleHomeCare } = usePortal();
  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 [&>*]:min-w-0">
      <div>
        <p className="eyebrow text-amethyst">My care with Iisha</p>
        <h1 className="mt-2 font-display text-[clamp(2.1rem,1.6rem+2vw,3.2rem)] leading-tight text-plum-900">Your sessions, notes &amp; <span className="italic-accent text-amethyst">home-care plan.</span></h1>
        <p className="mt-3 max-w-2xl text-plum-700">Everything from your appointments lives here, so you never have to remember what Iisha said in the chair.</p>
      </div>

      <section className="grid gap-5 rounded-card bg-plum-950 p-6 text-bone sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
        <div className="flex items-start gap-4">
          <CalendarDays className="mt-1 h-6 w-6 shrink-0 text-brass-soft" aria-hidden="true" />
          <div>
            <p className="eyebrow text-brass-soft">Next appointment</p>
            <p className="mt-1 font-display text-[1.8rem] leading-tight">{nextAppointment.date} · {nextAppointment.time}</p>
            <p className="text-lilac">{nextAppointment.service} · {nextAppointment.format}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={bookHref} className="inline-flex min-h-[2.9rem] items-center rounded-pill bg-bone px-5 font-sans text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-plum-900 hover:bg-white">Request a session</Link>
          <a href={`sms:${business.phone.replace(/\D/g, "")}`} className="inline-flex min-h-[2.9rem] items-center gap-2 rounded-pill border border-lilac/30 px-5 text-[0.82rem] text-lilac hover:border-bone hover:text-bone"><MessageCircle className="h-4 w-4" aria-hidden="true" /> Text Iisha</a>
        </div>
      </section>

      <ol className="grid gap-6">
        {treatments.map((t) => {
          const states = homeCare[t.id];
          const doneCount = states.filter(Boolean).length;
          return (
            <li key={t.id} className="rounded-card border border-plum-800/10 bg-paper p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="eyebrow text-amethyst">{t.date} · {t.format}</p>
                  <h2 className="mt-2 font-display text-[1.7rem] leading-tight text-plum-900">{t.service}</h2>
                </div>
                <span className="rounded-pill bg-sand/70 px-3 py-1 text-[0.78rem] text-plum-800">{doneCount}/{states.length} home-care steps done</span>
              </div>
              <div className="mt-5 grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-plum-700"><FileText className="h-4 w-4" aria-hidden="true" /> Notes from Iisha</p>
                  <p className="mt-2 text-[0.98rem] leading-relaxed text-plum-900">{t.notes}</p>
                </div>
                <div>
                  <p className="flex items-center gap-2 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-plum-700"><ClipboardList className="h-4 w-4" aria-hidden="true" /> Your home-care plan</p>
                  <ul className="mt-2 grid gap-2">
                    {t.homeCare.map((h, i) => (
                      <li key={h.item}>
                        <button type="button" onClick={() => toggleHomeCare(t.id, i)} aria-pressed={states[i]} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[0.93rem] transition ${states[i] ? "border-sage/50 bg-sage/[0.08] text-plum-900" : "border-plum-800/12 text-plum-700 hover:border-plum-800/30"}`}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${states[i] ? "border-sage bg-sage text-bone" : "border-plum-800/25"}`}>{states[i] && <Check className="h-3 w-3" aria-hidden="true" />}</span>
                          {h.item}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="text-[0.82rem] text-plum-700">Your portal is for education and support between visits. It isn&apos;t medical care. If something changes suddenly, contact a board-certified dermatologist.</p>
    </div>
  );
}

export function Downloads() {
  const unlockedSheets = lessons.filter((l) => l.week <= demoMember.currentWeek);
  return (
    <div>
      <p className="eyebrow text-amethyst">Downloads</p>
      <h1 className="mt-2 font-display text-[clamp(2.1rem,1.6rem+2vw,3.2rem)] leading-tight text-plum-900">Your <span className="italic-accent text-amethyst">library.</span></h1>
      <p className="mt-3 max-w-2xl text-plum-700">Every guide and worksheet you&apos;ve unlocked. New ones arrive with each week&apos;s lesson.</p>
      <ul className="mt-8 grid gap-4 md:grid-cols-2">
        {downloads.map((d) => (
          <li key={d.file}>
            <a href={d.file} download className="group flex items-center gap-4 rounded-card border border-plum-800/10 bg-paper p-5 transition hover:border-amethyst">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sand/70 text-amethyst"><FileText className="h-6 w-6" aria-hidden="true" /></span>
              <span className="flex-1"><span className="eyebrow text-amethyst">{d.kind} · Week {d.week}</span><span className="mt-1 block font-display text-[1.35rem] leading-tight text-plum-900">{d.title}</span></span>
              <Download className="h-5 w-5 text-amethyst" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-[1.6rem] text-plum-900">Weekly worksheets</h2>
      <ul className="mt-4 grid gap-2">
        {unlockedSheets.map((l) => (
          <li key={l.week} className="flex items-center justify-between gap-4 rounded-xl border border-plum-800/10 bg-paper px-5 py-3.5">
            <span className="text-plum-900"><span className="text-plum-700">Week {l.week} ·</span> {l.worksheet.title}</span>
            {l.worksheet.file ? <a href={l.worksheet.file} download className="text-[0.85rem] text-amethyst link-underline">Download</a> : <span className="text-[0.8rem] text-plum-700">In the lesson</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
