"use client";

/**
 * Lazy GSAP loader. GSAP + ScrollTrigger are fetched only after hydration, so they
 * never compete with first paint / LCP. Every motion component awaits this.
 */
type GsapMod = typeof import("gsap");
type STMod = typeof import("gsap/ScrollTrigger");
export type GsapBundle = { gsap: GsapMod["gsap"]; ScrollTrigger: STMod["ScrollTrigger"] };

let promise: Promise<GsapBundle> | null = null;

export function loadGsap(): Promise<GsapBundle> {
  if (!promise) {
    promise = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
      g.gsap.registerPlugin(s.ScrollTrigger);
      return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
    });
  }
  return promise;
}

export const motionOK = () => typeof document !== "undefined" && document.documentElement.classList.contains("js-motion");
