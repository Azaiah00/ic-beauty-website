/**
 * LABS REGISTRY: interactive learning pieces. This file is only the list (safe on the server and in tests).
 * The components themselves are loaded lazily in src/components/community/labs/LabHost.tsx, so a heavy
 * interactive never touches the main bundle. Contract and review checklist: docs/community/LABS.md.
 */
import type { PlanKey } from "./types";

export type LabMeta = {
  id: string;
  title: string;
  promise: string;
  minutes: number;
  /** Key in /public/images. */
  cover: string;
  /** Lowest plan that can open it. Leave out for every member. */
  minPlan?: PlanKey;
  /** Free members can also open it once they reach this level. */
  levelUnlock?: number;
  /** "Coming soon": only the team sees the card, and it has no component yet. */
  teamOnly?: boolean;
};

export const LABS: LabMeta[] = [
  { id: "growth-cycle", title: "The Hair Growth Cycle", promise: "Drag through the four phases and watch a follicle grow, rest and shed.", minutes: 5, cover: "scalp-closeup" },
  { id: "shed-or-broken", title: "Shed or Broken?", promise: "A quick sorting game. Learn to tell a shed hair from a broken one.", minutes: 4, cover: "consultation" },
  { id: "build-your-wash-day", title: "Build Your Wash Day", promise: "Put the steps in order and print your own routine card.", minutes: 6, cover: "funnel-routine", minPlan: "circle" },

  // Reserved for richer pieces built later in a separate session. Team-only "Coming soon" cards.
  { id: "follicle-explorer", title: "Follicle Explorer 3D", promise: "Rotate and zoom a scalp cross-section and tap each structure to learn what it does.", minutes: 8, cover: "scalp-closeup", teamOnly: true },
  { id: "porosity-lab", title: "Porosity Lab", promise: "Watch a water drop on low, medium and high porosity strands, with sliders for cuticle lift and product weight.", minutes: 6, cover: "product-shelf", teamOnly: true },
  { id: "tension-meter", title: "Tension Meter", promise: "Pick a style, tightness and weeks worn, and see when to give your edges a break.", minutes: 5, cover: "client-portrait", teamOnly: true },
  { id: "myth-or-fact", title: "Grandma Said… Myth or Fact", promise: "A swipe game on the things we were all told about trims, greasing and braids.", minutes: 5, cover: "funnel-community", teamOnly: true },
  { id: "ingredient-decoder", title: "Ingredient Decoder", promise: "Paste a label and get plain-language education about common ingredient families.", minutes: 6, cover: "product-shelf", teamOnly: true },
  { id: "my-hair-story", title: "My H.A.I.R. Story", promise: "Map your hair history on a timeline, saved privately to My Journey.", minutes: 10, cover: "funnel-hero-woman", teamOnly: true },
];

export const lab = (id: string) => LABS.find((l) => l.id === id);
export const labGate = (l: LabMeta) => ({ minPlan: l.minPlan, levelUnlock: l.levelUnlock, teamOnly: l.teamOnly });
