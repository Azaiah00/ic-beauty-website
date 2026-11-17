/** The contract every Lab component follows. See docs/community/LABS.md. */
export type LabProps = {
  actor: { id: string; name: string };
  /** Call once when the member finishes. Score is 0 to 100. */
  onComplete: (score: number) => void;
};

/** True when the member asked their device for less motion. Safe on the server (returns false). */
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
