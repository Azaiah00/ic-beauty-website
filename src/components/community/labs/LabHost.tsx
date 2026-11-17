"use client";

/**
 * Loads one Lab by id. Each Lab is a separate lazy chunk (next/dynamic, no server render), so a heavy
 * interactive never touches the main bundle. To add a Lab: register it in src/lib/community/labs.ts and
 * add one line to COMPONENTS below. Contract: docs/community/LABS.md.
 */
import dynamic from "next/dynamic";
import { useCallback, useRef, type ComponentType } from "react";
import { useAct } from "@/components/community/client";
import type { LabProps } from "./types";

const loading = () => (
  <p role="status" className="rounded-card border border-plum-800/10 bg-paper p-8 text-center text-plum-700">
    Opening your Lab…
  </p>
);

const COMPONENTS: Record<string, ComponentType<LabProps>> = {
  "growth-cycle": dynamic(() => import("./GrowthCycle"), { ssr: false, loading }),
  "shed-or-broken": dynamic(() => import("./ShedOrBroken"), { ssr: false, loading }),
  "build-your-wash-day": dynamic(() => import("./BuildYourWashDay"), { ssr: false, loading }),
};

export const hasLabComponent = (id: string) => id in COMPONENTS;

export function LabHost({ id, actor }: { id: string; actor: LabProps["actor"] }) {
  const { run } = useAct();
  const sent = useRef(false);
  const onComplete = useCallback(
    (score: number) => {
      if (sent.current) return; // one completion per visit, even if the member plays again
      sent.current = true;
      void run("lab.complete", { id, score: Math.max(0, Math.min(100, Math.round(score))) });
    },
    [id, run],
  );
  const Lab = COMPONENTS[id];
  if (!Lab) return <p className="rounded-card border border-plum-800/10 bg-paper p-8 text-center text-plum-700">This Lab is coming soon.</p>;
  return <Lab actor={actor} onComplete={onComplete} />;
}
