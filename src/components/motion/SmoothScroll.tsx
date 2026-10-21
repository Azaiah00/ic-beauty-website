"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { loadGsap, motionOK, type GsapBundle } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Global motion runtime (loaded after hydration — never blocks first paint):
 *  - Lenis smooth scroll driving GSAP ScrollTrigger (one RAF loop via gsap.ticker)
 *  - Batched [data-reveal] entrances, re-bound on every route change
 *  - Fully disabled for prefers-reduced-motion (content is never hidden for those users or crawlers)
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);
  const gsapRef = useRef<GsapBundle | null>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    (window as Window & { __icbReady?: boolean }).__icbReady = true; // read by the boot safety net (no DOM mutation → no style recalc)
    if (reduced) {
      document.documentElement.classList.remove("js-motion");
      return;
    }
    // Phones keep native momentum scrolling (better feel + no permanent RAF loop on weak CPUs).
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let cancelled = false;
    let cleanup = () => {};
    Promise.all([loadGsap(), import("lenis")]).then(([g, { default: LenisCtor }]) => {
      if (cancelled) return;
      gsapRef.current = g;
      const lenis = new LenisCtor({ lerp: 0.11, anchors: { offset: -96 }, autoRaf: false });
      lenisRef.current = lenis;
      window.__lenis = lenis;
      lenis.on("scroll", g.ScrollTrigger.update);
      const tick = (time: number) => lenis.raf(time * 1000);
      g.gsap.ticker.add(tick);
      g.gsap.ticker.lagSmoothing(0);
      window.dispatchEvent(new Event("icb:motion"));
      cleanup = () => {
        g.gsap.ticker.remove(tick);
        lenis.destroy();
        lenisRef.current = null;
        window.__lenis = undefined;
      };
    });
    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (lenisRef.current) {
      if (hash && document.querySelector(hash)) lenisRef.current.scrollTo(hash, { immediate: true, offset: -96 });
      else lenisRef.current.scrollTo(0, { immediate: true });
    }
    if (!motionOK()) return;
    let cancelled = false;
    let revert = () => {};
    loadGsap().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        // Content is VISIBLE by default (CSS never hides it). Only elements still below the fold are
        // hidden here — after GSAP is live — so a stalled script can never leave the page blank.
        const below = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.92;
        const texts = gsap.utils.toArray<HTMLElement>("[data-reveal]:not([data-reveal='image'])").filter(below);
        const images = gsap.utils.toArray<HTMLElement>("[data-reveal='image']").filter(below);
        gsap.set(texts, { opacity: 0, y: (_i: number, el: HTMLElement) => (el.dataset.reveal === "fade" ? 0 : 24) });
        gsap.set(images, { clipPath: "inset(0 0 100% 0)" });
        // Text & blocks: soft rise + fade
        if (texts.length)
          ScrollTrigger.batch(texts, {
            start: "top 90%",
            once: true,
            onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", stagger: 0.08, overwrite: true }),
          });
        // Images: an elegant curtain unveil (bottom-up) with a gentle settle
        if (images.length)
          ScrollTrigger.batch(images, {
            start: "top 88%",
            once: true,
            onEnter: (els) => {
              gsap.to(els, { clipPath: "inset(0 0 0% 0)", duration: 1.6, ease: "expo.out", stagger: 0.12, overwrite: true });
              els.forEach((el) => {
                const img = el.querySelector("img");
                if (img) gsap.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 2.2, ease: "expo.out" });
              });
            },
          });
        // Slow parallax drift on marked images (desktop only — subtle, never gimmicky)
        if (window.matchMedia("(min-width: 1024px)").matches) {
          gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
            const amt = Number(el.dataset.parallax || 8);
            gsap.fromTo(el, { yPercent: -amt / 2 }, { yPercent: amt / 2, ease: "none", scrollTrigger: { trigger: el.parentElement || el, start: "top bottom", end: "bottom top", scrub: true } });
          });
        }
      });
      const r = requestAnimationFrame(() => ScrollTrigger.refresh());
      revert = () => {
        cancelAnimationFrame(r);
        ctx.revert();
      };
    });
    return () => {
      cancelled = true;
      revert();
    };
  }, [pathname]);

  return null;
}
