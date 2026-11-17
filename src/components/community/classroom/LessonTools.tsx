"use client";

/** Client islands for the Classroom: the locked-course sheet, Mark complete, the private note, downloads. */
import Link from "next/link";
import { useState } from "react";
import { Check, Download, Lock } from "lucide-react";
import { Sheet, act, useAct } from "@/components/community/client";

const primary = "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-amethyst px-6 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-bone transition hover:bg-plum-800";

/** A locked course card: still visible and inviting. Tapping it explains how to open it, with one next step. */
export function LockedCourse({ title, why, href, cta, children }: { title: string; why: string; href: string; cta: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-haspopup="dialog" className="group block h-full w-full rounded-card text-left">
        {children}
        <span className="sr-only">Locked. Find out how to open {title}.</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={title}>
        <p className="flex items-start gap-3 text-plum-800">
          <Lock className="mt-1 h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" />
          <span>{why}</span>
        </p>
        <Link href={href} className={`${primary} mt-6`}>
          {cta}
        </Link>
      </Sheet>
    </>
  );
}

/** Mark complete, with a quiet brass check (no confetti). Reduced motion is honored by the global CSS. */
export function CompleteButton({ course, lesson, done }: { course: string; lesson: string; done: boolean }) {
  const { run, busy } = useAct();
  const [pop, setPop] = useState(false);
  return (
    <>
      <style>{`@keyframes icb-check{0%{transform:scale(.6);opacity:.4}60%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}`}</style>
      <button
        type="button"
        disabled={busy}
        aria-pressed={done}
        onClick={async () => {
          const r = await run("lesson.complete", { course, lesson });
          if (r.ok && r.data?.done) setPop(true);
        }}
        className={`inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-pill px-7 text-[0.78rem] font-medium uppercase tracking-[0.14em] transition disabled:opacity-60 sm:w-auto ${done ? "border border-brass bg-bone text-plum-900 hover:border-plum-900" : "bg-plum-900 text-bone hover:bg-amethyst"}`}
      >
        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${done ? "bg-brass text-plum-950" : "border border-bone/60"}`} style={done && pop ? { animation: "icb-check .5s cubic-bezier(.22,1,.36,1) both" } : undefined}>
          {done && <Check className="h-4 w-4" aria-hidden="true" strokeWidth={2.5} />}
        </span>
        {done ? "Completed. Tap to undo" : "Mark complete"}
      </button>
    </>
  );
}

/** The reflection prompt with a private note. Only the member (never other members) sees it. */
export function NoteBox({ course, lesson, done, initial, prompt }: { course: string; lesson: string; done: boolean; initial: string; prompt: string }) {
  const { run, busy } = useAct();
  const [note, setNote] = useState(initial);
  const id = `note-${lesson}`;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // `done` is sent unchanged so saving a note never flips the lesson's completion.
        run("lesson.complete", { course, lesson, note, done }, { refresh: false });
      }}
    >
      <label htmlFor={id} className="block font-display text-[1.25rem] leading-snug text-plum-900">
        {prompt}
      </label>
      <p className="mt-1 text-[0.84rem] text-plum-700">Your note is private. Only you can see it.</p>
      <textarea id={id} value={note} onChange={(e) => setNote(e.target.value)} rows={4} maxLength={4000} placeholder="Write a few honest lines…" className="mt-3 block w-full rounded-xl border border-plum-800/20 bg-white px-3.5 py-3 text-[1rem] text-ink outline-none focus:border-amethyst focus:ring-2 focus:ring-amethyst/20" />
      <button type="submit" disabled={busy} className="mt-3 inline-flex min-h-11 items-center justify-center rounded-pill border border-plum-900/25 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900 transition hover:border-plum-900 disabled:opacity-50">
        Save my note
      </button>
    </form>
  );
}

/** A resource link. `tick` also checks off "Grab the free checklist" on the Start Here list. */
export function DownloadLink({ href, title, tick }: { href: string; title: string; tick?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        if (tick) void act("checklist", { key: "download" });
      }}
      className="flex min-h-12 items-center gap-3 rounded-xl border border-plum-800/15 bg-white px-4 text-plum-900 transition hover:border-amethyst hover:text-amethyst"
    >
      <Download className="h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
      <span className="min-w-0 flex-1">{title}</span>
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  );
}
