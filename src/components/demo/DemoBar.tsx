"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, LayoutList, MessageSquareQuote, X } from "lucide-react";
import { demoSteps } from "@/lib/demo";
import { useDemo, setDemo } from "./useDemo";

/**
 * Presenter bar: only renders in demo mode (started from /demo). Back / Next walk the whole journey;
 * "Talking points" shows what to say on this screen. Keyboard: ← and → also move between steps.
 */
export function DemoBar() {
  const demo = useDemo();
  const path = usePathname();
  const router = useRouter();
  const [notes, setNotes] = useState(true);
  const i = demoSteps.findIndex((s) => s.path === path);
  const step = i >= 0 ? demoSteps[i] : null;
  const prev = i > 0 ? demoSteps[i - 1] : null;
  const next = i >= 0 && i < demoSteps.length - 1 ? demoSteps[i + 1] : null;

  useEffect(() => {
    if (!demo) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "ArrowRight" && next) router.push(next.path);
      if (e.key === "ArrowLeft" && prev) router.push(prev.path);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demo, next, prev, router]);

  useEffect(() => {
    if (demo && step) window.scrollTo({ top: 0 });
  }, [demo, step]);

  if (!demo || path === "/demo") return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[5.25rem] z-[60] flex justify-center px-3 md:bottom-5">
      <div className="pointer-events-auto w-full max-w-xl overflow-hidden rounded-2xl border border-brass/40 bg-plum-950 text-bone shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)]">
        {step && notes && (
          <div className="border-b border-plum-800 px-4 py-3">
            <p className="flex items-center gap-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-brass-soft">
              <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden="true" /> Talking points
            </p>
            <ul className="mt-1.5 grid gap-1 text-[0.82rem] leading-snug text-lilac">
              {step.say.map((s) => <li key={s}>· {s}</li>)}
            </ul>
          </div>
        )}
        <div className="flex items-center gap-2 px-2.5 py-2">
          {prev ? (
            <Link href={prev.path} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-plum-800 text-lilac hover:border-brass-soft hover:text-bone" aria-label={`Back: ${prev.title}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link href="/demo" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-plum-800 text-lilac hover:text-bone" aria-label="All steps"><LayoutList className="h-4 w-4" aria-hidden="true" /></Link>
          )}
          <button type="button" onClick={() => setNotes((n) => !n)} className="min-w-0 flex-1 px-1 text-left" aria-expanded={notes}>
            <span className="block text-[0.64rem] font-medium uppercase tracking-[0.18em] text-brass-soft">
              {step ? `Demo · Funnel ${step.funnel} · Step ${i + 1} of ${demoSteps.length}` : "Demo mode"}
            </span>
            <span className="block truncate font-display text-[1.05rem] leading-tight">{step ? step.title : "Off the guided path"}</span>
          </button>
          {next ? (
            <Link href={next.path} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-bone px-4 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-plum-900 hover:bg-white">
              Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <Link href="/demo" className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-bone px-4 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-plum-900 hover:bg-white">
              {step ? "Finish" : "Steps"} <LayoutList className="h-4 w-4" aria-hidden="true" />
            </Link>
          )}
          <button type="button" onClick={() => { setDemo(false); router.push("/"); }} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lilac/70 hover:text-bone" aria-label="Exit demo mode">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
