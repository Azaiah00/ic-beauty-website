"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { Needs } from "@/components/ui/Needs";

/** "You're in, Tasha." Uses the first name saved at opt-in (session only), falling back gracefully. */
export function FirstName({ fallback = "love", suffix = "" }: { fallback?: string; suffix?: string }) {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    try {
      const n = sessionStorage.getItem("icb-first-name");
      if (n) setName(n.charAt(0).toUpperCase() + n.slice(1));
    } catch {}
  }, []);
  return (
    <>
      {name ?? fallback}
      {suffix}
    </>
  );
}

/**
 * Video frame for the funnel (Kie promo now, Iisha's own video later).
 * With no `src` it shows the poster + an owed-asset marker, so the layout is final before the video exists.
 */
export function FunnelVideo({ src, poster, label, ratio = "aspect-video" }: { src?: string; poster: string; label: string; ratio?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`relative overflow-hidden rounded-card bg-plum-900 ${ratio} shadow-[0_30px_60px_-30px_rgba(36,19,42,0.55)]`}>
      {src && playing ? (
        <video src={src} poster={poster} controls autoPlay playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <button
          type="button"
          onClick={() => src && setPlaying(true)}
          className="group absolute inset-0 h-full w-full text-left"
          aria-label={src ? `Play: ${label}` : label}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-[1.02]" loading="lazy" />
          <span className="absolute inset-0 bg-gradient-to-t from-plum-950/80 via-plum-950/20 to-transparent" />
          <span className="absolute left-1/2 top-[42%] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-bone/95 text-amethyst shadow-xl transition duration-500 group-hover:scale-105 sm:top-1/2 sm:h-20 sm:w-20">
            <Play className="ml-1 h-6 w-6 sm:h-8 sm:w-8" fill="currentColor" aria-hidden="true" />
          </span>
          <span className="absolute inset-x-4 bottom-3.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 sm:inset-x-5 sm:bottom-5">
            <span className="font-display text-[1rem] italic leading-tight text-bone sm:text-[1.25rem]">{label}</span>
            {!src && <Needs tone="light">Video coming</Needs>}
          </span>
        </button>
      )}
    </div>
  );
}

/** Mobile-only sticky CTA that appears after the hero scrolls away (one action, always in reach). */
export function StickyCta({ href, label, after = 600 }: { href: string; label: string; after?: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    // Hide whenever the target form is on screen, so the bar never covers the form's own button.
    const target = href.startsWith("#") ? document.querySelector(href) : null;
    let targetVisible = false;
    const io = target
      ? new IntersectionObserver(([e]) => {
          targetVisible = e.isIntersecting;
          onScroll();
        })
      : null;
    if (target && io) io.observe(target);
    function onScroll() {
      const nearEnd = window.innerHeight + window.scrollY > document.documentElement.scrollHeight - 900;
      setShow(window.scrollY > after && !nearEnd && !targetVisible);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io?.disconnect();
    };
  }, [after, href]);
  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-plum-800/10 bg-bone/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-transform duration-500 md:hidden ${show ? "translate-y-0" : "translate-y-full"}`}
      aria-hidden={!show}
    >
      <a
        href={href}
        tabIndex={show ? 0 : -1}
        className="flex min-h-[3.25rem] w-full items-center justify-center rounded-pill bg-amethyst font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_10px_24px_rgba(110,63,134,0.3)]"
      >
        {label}
      </a>
    </div>
  );
}
