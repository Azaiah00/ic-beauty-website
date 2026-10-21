"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X, Focus } from "lucide-react";
import { links } from "@/lib/site";

const KEY = "icb-lens-seen";
const SKIP = ["/book", "/scalp-check", "/contact", "/links"];

/**
 * Gamified exit-intent: "Bring it into focus."
 * A blurred card the visitor brings into focus to reveal the free Hair Health Checklist.
 * Desktop: fires on exit intent. Mobile: after 55% scroll depth + 25s. Once per session.
 */
export function ExitIntent() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (SKIP.some((p) => pathname.startsWith(p))) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(KEY) === "1";
    } catch {}
    if (seen) return;
    const start = Date.now();
    const show = () => {
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      lastFocus.current = document.activeElement as HTMLElement;
      setOpen(true);
      cleanup();
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && Date.now() - start > 8000) show();
    };
    const onScroll = () => {
      const depth = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      if (depth > 0.55 && Date.now() - start > 25000) show();
    };
    const fine = window.matchMedia("(pointer: fine)").matches;
    const cleanup = () => {
      document.removeEventListener("mouseout", onLeave);
      window.removeEventListener("scroll", onScroll);
    };
    if (fine) document.addEventListener("mouseout", onLeave);
    else window.addEventListener("scroll", onScroll, { passive: true });
    return cleanup;
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    window.__lenis?.stop();
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const close = () => {
    setOpen(false);
    lastFocus.current?.focus?.();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-plum-950/55 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true" aria-labelledby="lens-title" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="relative w-full max-w-lg overflow-hidden rounded-card bg-bone text-plum-900 shadow-2xl">
        <button ref={closeRef} onClick={close} className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-plum-900/20 text-plum-900 hover:bg-plum-900 hover:text-bone" aria-label="Close">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="p-8 sm:p-10">
          <p className="eyebrow text-amethyst">Before you go</p>
          <h2 id="lens-title" className="mt-3 font-display text-[2.4rem] leading-[1.05]">Bring your hair health <span className="italic-accent text-amethyst">into focus.</span></h2>
          <div className="relative mt-6">
            <div className={`rounded-card border border-plum-900/10 bg-paper p-6 transition-[filter,transform] duration-[1200ms] ease-[var(--ease-lens)] ${focused ? "blur-0" : "scale-[0.98] blur-[7px]"}`} aria-hidden={!focused}>
              <p className="eyebrow text-brass-deep">Free download</p>
              <p className="mt-2 font-display text-2xl">The Hair Health Checklist</p>
              <p className="mt-2 text-[0.95rem] text-plum-700">Iisha&apos;s at-home self-check. Catch small changes before they become big ones.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={links.stan} target="_blank" rel="noopener noreferrer" tabIndex={focused ? 0 : -1} className="rounded-pill bg-plum-900 px-5 py-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-bone hover:bg-amethyst">Get my free checklist</a>
                <Link href="/scalp-check" tabIndex={focused ? 0 : -1} onClick={close} className="rounded-pill border border-plum-900/25 px-5 py-3 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-plum-900 hover:border-plum-900">Take the 2-min Self-Check</Link>
              </div>
            </div>
            {!focused && (
              <button onClick={() => setFocused(true)} className="absolute inset-0 m-auto flex h-14 w-64 items-center justify-center gap-2 rounded-pill bg-plum-900 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-bone shadow-xl transition hover:bg-amethyst">
                <Focus className="h-5 w-5" aria-hidden="true" /> Tap to focus the lens
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
