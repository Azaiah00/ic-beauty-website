"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Compass, EyeOff, LayoutList, LogOut, MessageSquareQuote } from "lucide-react";
import { demoSteps } from "@/lib/demo";
import { useDemo, setDemo } from "./useDemo";

const GUIDE_KEY = "icb-demo-guide";

/**
 * Presenter bar: only renders in demo mode (started from /demo). Back / Next walk the whole journey;
 * "Talking points" shows what to say on this screen. Keyboard: ← and → also move between steps.
 */
export function DemoBar() {
  const demo = useDemo();
  const path = usePathname();
  const router = useRouter();
  const [notes, setNotes] = useState(true);
  // Guide visibility is separate from demo mode: hiding the guide keeps pre-filled forms and no-send submits,
  // so Iisha can explore freely, then bring the guide back with one tap. Remembered for this tab only.
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    try { setHidden(sessionStorage.getItem(GUIDE_KEY) === "off"); } catch {}
  }, []);
  const toggleGuide = (off: boolean) => {
    setHidden(off);
    try { if (off) sessionStorage.setItem(GUIDE_KEY, "off"); else sessionStorage.removeItem(GUIDE_KEY); } catch {}
  };
  const i = demoSteps.findIndex((s) => s.path === path);
  const step = i >= 0 ? demoSteps[i] : null;
  const prev = i > 0 ? demoSteps[i - 1] : null;
  const next = i >= 0 && i < demoSteps.length - 1 ? demoSteps[i + 1] : null;

  useEffect(() => {
    if (!demo) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (hidden) return;
      if (e.key === "ArrowRight" && next) router.push(next.path);
      if (e.key === "ArrowLeft" && prev) router.push(prev.path);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [demo, hidden, next, prev, router]);

  useEffect(() => {
    if (demo && step) window.scrollTo({ top: 0 });
  }, [demo, step]);

  if (!demo || path === "/demo") return null;

  if (hidden) {
    return (
      <div className="pointer-events-none fixed right-2 top-1/2 z-[60] -translate-y-1/2 md:bottom-5 md:right-5 md:top-auto md:translate-y-0">
        <button
          type="button"
          onClick={() => toggleGuide(false)}
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center gap-2 rounded-full border border-brass/50 bg-plum-950 text-[0.7rem] md:w-auto md:px-4 font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_16px_40px_-16px_rgba(0,0,0,0.6)] hover:border-brass-soft"
          aria-label="Show the demo guide"
        >
          <Compass className="h-5 w-5 text-brass-soft md:h-4 md:w-4" aria-hidden="true" /> <span className="hidden md:inline">Show guide</span>
        </button>
      </div>
    );
  }

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
            <button type="button" onClick={() => { setDemo(false); toggleGuide(false); router.push("/"); }} className="mt-2.5 inline-flex items-center gap-1.5 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-lilac/70 hover:text-bone">
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Exit demo mode
            </button>
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
          <button type="button" onClick={() => toggleGuide(true)} className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lilac/70 hover:text-bone" aria-label="Hide the guide and explore freely" title="Hide guide">
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
