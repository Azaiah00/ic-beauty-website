/**
 * THE H.A.I.R. CIRCLE COMMUNITY: every name, price, benefit, level and default message in one place.
 * Prices are never invented: an empty string renders a <Needs> marker until Iisha confirms it.
 * The team can change most of this later from the owner dashboard (Community → Plans & prices / Settings).
 */
import { membership } from "@/lib/portal/data";
import { funnel } from "@/lib/funnel";
import type { Category, Member, PlanConfig, PlanKey, Question, Ritual, Settings } from "./types";

export const COMMUNITY_NAME = "The H.A.I.R. Circle Community";
export const COMMUNITY_PROMISE = "Learn your hair, love your hair, and never do it alone.";
export const DEMO = process.env.NEXT_PUBLIC_COMMUNITY_DEMO !== "0";
export const TZ = "America/New_York";
export const GRACE_DAYS = 7;
export const UNDO_HOURS = 24;
export const BROADCAST_HOURS = 72;

export const EDUCATION_NOTE =
  "Education only. Nothing here diagnoses, treats or cures a medical condition. For sudden, patchy or painful hair loss, please see a board-certified dermatologist.";

export const PLAN_ORDER: PlanKey[] = ["free", "circle", "inner"];
export const planRank = (p: PlanKey) => PLAN_ORDER.indexOf(p);

export const PLANS: Record<PlanKey, PlanConfig> = {
  free: {
    key: "free",
    name: "Free Member",
    tagline: "Come in, look around, and start learning.",
    monthly: "Free",
    annual: "Free",
    trialDays: 0,
    benefits: [
      "The community feed and member directory",
      "The free classroom, including Start Here and the Red Flags self-check",
      "A monthly Community Live",
      "Levels, points and the leaderboard",
      "Read every answer in Ask Iisha",
    ],
  },
  circle: {
    key: "circle",
    name: "Circle Member",
    tagline: "The weekly curriculum, your own progress, and Iisha answering your questions.",
    // NEEDS CLIENT CONFIRMATION. Her old Stan membership was $13.99/mo (reference only, never shown as the price).
    monthly: membership.monthlyPrice,
    annual: membership.annualPrice,
    trialDays: membership.trialDays,
    benefits: [
      "The 12-week H.A.I.R. Circle curriculum, one new lesson every Monday",
      "My Journey: progress, habits and photo check-ins",
      "Post your questions in Ask Iisha",
      "The monthly Live Q&A with Iisha, plus replays",
      "The full download library",
      "Weekly check-in threads",
    ],
  },
  inner: {
    key: "inner",
    name: "Inner Circle",
    tagline: "Everything in Circle, plus Iisha's direct attention.",
    monthly: "", // NEEDS CLIENT CONFIRMATION
    annual: "", // NEEDS CLIENT CONFIRMATION
    trialDays: 0,
    seatCap: 0,
    benefits: [
      "Everything in Circle Member",
      "A monthly small-group coaching call with Iisha",
      "A quarterly 1:1 virtual hair and scalp review",
      "Ask Iisha questions answered within 48 hours",
      "The private Inner Circle Lounge",
      "The coaching replay vault",
      "Member pricing on programs, and early access",
    ],
  },
};

/** One-time program prices. Empty = <Needs>. */
export const PRICES: Record<string, string> = {
  "radiance-rewired": funnel.tripwire.price,
  "next-program": "",
  "next-program-member": "",
  "love-story-core": funnel.pilot.corePrice,
  "love-story-vip": funnel.pilot.vipPrice,
};

/** Skool's thresholds with I.C. Beauty's level names. */
export const LEVEL_POINTS = [0, 5, 20, 65, 155, 515, 2015, 8015, 33015];
export const LEVEL_NAMES = ["New Growth", "Rooted", "Nourished", "Strong Strands", "Thriving", "Radiant", "Crowned", "Legacy", "H.A.I.R. Icon"];
export const POINTS = { like: 1, lesson: 2, checkin: 1, lab: 2 };
export const LEVEL_UNLOCKS: Record<number, string> = { 3: "The Wash Day Blueprint mini-course" };

export function levelFor(points: number) {
  let level = 1;
  for (let i = 0; i < LEVEL_POINTS.length; i++) if (points >= LEVEL_POINTS[i]) level = i + 1;
  const next = LEVEL_POINTS[level] ?? null;
  const floor = LEVEL_POINTS[level - 1];
  return { level, next, toGo: next === null ? 0 : next - points, progress: next === null ? 1 : (points - floor) / (next - floor) };
}

export const CATEGORIES: Category[] = [
  { id: "start-here", name: "Start Here", description: "Welcome, guidelines and introductions.", post: "everyone", view: "everyone", order: 1 },
  { id: "announcements", name: "Announcements", description: "News from Iisha and the team.", post: "team", view: "everyone", order: 2 },
  { id: "general", name: "General", description: "Everyday conversation.", post: "everyone", view: "everyone", order: 3 },
  { id: "wins", name: "Wins & Progress", description: "Big or small, share it here.", post: "everyone", view: "everyone", order: 4 },
  { id: "ask-iisha", name: "Ask Iisha", description: "Circle members ask. Everyone can read the answers.", post: "circle", view: "everyone", order: 5 },
  { id: "wash-day", name: "Wash Day & Routines", description: "Routines, rhythms and what's working.", post: "everyone", view: "everyone", order: 6 },
  { id: "scalp-wellness", name: "Scalp & Wellness", description: "Scalp care, food, stress and sleep.", post: "everyone", view: "everyone", order: 7, note: EDUCATION_NOTE },
  { id: "inner-lounge", name: "Inner Circle Lounge", description: "A private room for Inner Circle members.", post: "inner", view: "inner", order: 8 },
];

export const QUESTIONS: Question[] = [
  { id: "goal", label: "What's your biggest hair goal right now?" },
  { id: "found", label: "How did you find Iisha?", choices: ["TikTok", "Instagram", "YouTube", "A friend", "I'm a client", "Other"] },
  { id: "client", label: "Are you a current I.C. Beauty client?", choices: ["Yes", "Not yet"] },
];

export const GUIDELINES = [
  "Be kind. We lift each other up here.",
  "Share your own experience. No selling, no links to products you profit from.",
  "This is education and encouragement, not medical advice.",
  "What's shared in the Circle stays in the Circle.",
].join("\n");

// DEMO COPY: replace with Iisha's real welcome message (Community → Settings).
export const WELCOME_MESSAGE =
  "Welcome to the Circle, {first}. I'm so glad you're here. Start with the Start Here checklist, introduce yourself, and tell me your hair goal. Healthy awareness is rare, and you just chose it.";

export const RITUALS: Ritual[] = [
  { id: "monday-drop", title: "This week's lesson is live", body: "A new lesson just opened in the Classroom. Watch it, do the action step, then come back and tell us **one thing** you're taking with you.", categoryId: "announcements", weekday: 1, enabled: true },
  { id: "wash-day-wednesday", title: "Wash Day Wednesday check-in", body: "How did wash day go this week? Tell us what you did, what felt lighter, and what you'd change next time.", categoryId: "wash-day", weekday: 3, enabled: true },
  { id: "friday-wins", title: "Friday Wins: what went right this week?", body: "Big or small, it counts. Drank your water, kept your satin on, said something kind about your hair. Share your win below.", categoryId: "wins", weekday: 5, enabled: true },
  { id: "monthly-theme", title: "This month's theme", body: "A new month, a new focus for the Circle. Read the theme, pick one small habit, and share it below so we can cheer you on.", categoryId: "announcements", monthlyDay: 1, enabled: true },
];

export const BADGES: Record<string, string> = {
  founding: "Founding Member",
  graduate: "30-Day Graduate",
  spotlight: "Spotlight",
};

export const CHECKLIST: { key: keyof Member["checklist"]; label: string; href: string }[] = [
  { key: "intro", label: "Introduce yourself", href: "/community?compose=intro" },
  { key: "watch", label: "Watch “Welcome to the Circle”", href: "/community/classroom/start-here/welcome" },
  { key: "goal", label: "Set your hair goal", href: "/community/settings#goal" },
  { key: "download", label: "Grab the free Hair Health Red Flags checklist", href: "/community/classroom/red-flags/self-check" },
];

export const INTRO_TEMPLATE = {
  title: "Hi, I'm new here",
  body: "My name is \nI'm joining from \nMy hair right now: \nMy biggest hair goal: \nOne thing I'd love help with: ",
};

export function defaultSettings(now: Date): Settings {
  return {
    name: COMMUNITY_NAME,
    promise: COMMUNITY_PROMISE,
    cover: "funnel-community",
    questions: QUESTIONS,
    guidelines: GUIDELINES,
    welcomeMessage: WELCOME_MESSAGE,
    autoApprove: { free: true, paid: false },
    points: { lesson: true, checkin: true, lab: true },
    levelNames: LEVEL_NAMES,
    rituals: RITUALS,
    ritualLog: [],
    categories: CATEGORIES,
    plans: PLANS,
    prices: PRICES,
    digest: false,
    seededAt: now.toISOString(),
  };
}

/** "$13.99" → 13.99. Anything that isn't a confirmed price → null. */
export function priceNumber(p: string | undefined) {
  if (!p) return null;
  const n = Number(p.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const firstName = (name: string) => name.split(/\s+/)[0] || name;

export function initials(name: string) {
  const parts = name.replace(/\(.*?\)/g, "").trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase() || "?";
}
