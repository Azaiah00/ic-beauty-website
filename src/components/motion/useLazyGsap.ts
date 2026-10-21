"use client";

import { useEffect } from "react";
import { loadGsap, motionOK, type GsapBundle } from "@/lib/gsap";

/**
 * Runs `setup` once GSAP has lazy-loaded (only when motion is allowed).
 * Everything created inside is scoped to a gsap.context and reverted on unmount.
 */
export function useLazyGsap(scope: React.RefObject<HTMLElement | null>, setup: (g: GsapBundle) => void | (() => void), deps: unknown[] = []) {
  useEffect(() => {
    if (!motionOK() || !scope.current) return;
    let cancelled = false;
    let revert = () => {};
    loadGsap().then((g) => {
      if (cancelled || !scope.current) return;
      let extra: void | (() => void);
      const ctx = g.gsap.context(() => {
        extra = setup(g);
      }, scope.current);
      revert = () => {
        if (typeof extra === "function") extra();
        ctx.revert();
      };
    });
    return () => {
      cancelled = true;
      revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
