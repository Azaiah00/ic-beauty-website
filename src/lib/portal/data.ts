/**
 * MEMBER PORTAL — DEMO DATA LAYER (single source for every portal screen).
 *
 * Demo mode: typed sample data, held in memory only (no localStorage, no backend).
 * Swap-later seam (backend-only change, the UI never changes):
 *   // TODO: Supabase — members, lessons, progress, habits, treatments tables + row-level security
 *   // TODO: Google sign-in (Supabase Auth) + Iisha's approval step before portal access
 *   // TODO: Square Subscriptions — monthly / annual plans, 14-day trial, webhooks → member status
 */

export const membership = {
  name: "The H.A.I.R. Circle",
  promise: "A new lesson every week. A portal that tracks your progress. Iisha in your corner.",
  /** Replaces her current "It's a WIN WIN" membership ($13.99/mo, 14-day free trial on Stan). */
  previousPrice: "$13.99/mo",
  /** NEEDS CLIENT CONFIRMATION — empty shows a marker. Recommendation in docs/funnels/hair-circle-funnel.md. */
  monthlyPrice: "" as string,
  annualPrice: "" as string,
  trialDays: 14,
  dropDay: "Monday",
} as const;

export type Lesson = {
  week: number;
  title: string;
  theme: "Embrace" | "Understand" | "Nourish" | "Confidently care";
  minutes: number;
  summary: string;
  takeaways: [string, string, string];
  action: string;
  reflection: string;
  worksheet: { title: string; file?: string };
  poster: string;
};

export const lessons: Lesson[] = [
  {
    week: 1, title: "Your Hair Story", theme: "Embrace", minutes: 12,
    summary: "Before we change anything, we understand where your hair has been: the styles, seasons, products and stresses that shaped it.",
    takeaways: ["Your hair has a history, and it explains a lot about today", "Guilt doesn't grow hair; awareness does", "Your baseline is your starting line, not a grade"],
    action: "Take your 4 baseline photos and fill in your Hair Baseline page.",
    reflection: "What's one thing you've always believed about your hair that might not be true?",
    worksheet: { title: "Hair Health Red Flags + Baseline", file: "/downloads/hair-health-red-flags-checklist.pdf" },
    poster: "funnel-hero-woman",
  },
  {
    week: 2, title: "Reading Your Scalp", theme: "Understand", minutes: 14,
    summary: "Shedding vs. breakage, flakes vs. dryness, tension vs. texture. Learn to read the signs yourself so you stop guessing.",
    takeaways: ["50–100 hairs a day is normal shedding", "Breakage in the same spot points to a habit", "Your scalp is skin, so treat it like skin"],
    action: "Do a hair-fall count on wash day and note where breakage shows up.",
    reflection: "Which sign has your hair been showing you the longest?",
    worksheet: { title: "Shedding vs. Breakage Log" },
    poster: "scalp-closeup",
  },
  {
    week: 3, title: "Wash Day, Reimagined", theme: "Confidently care", minutes: 16,
    summary: "Cleanse before you oil, condition with intention, and build a wash-day rhythm that works for your scalp and your schedule.",
    takeaways: ["Clean scalp first, then oils and stylers", "Rhythm beats perfection: pick a cadence you'll keep", "Fewer products, used on purpose"],
    action: "Plan your next two wash days with the Wash Day Blueprint.",
    reflection: "What makes wash day feel heavy for you, and what would make it lighter?",
    worksheet: { title: "Wash Day Blueprint", file: "/downloads/wash-day-blueprint.pdf" },
    poster: "funnel-routine",
  },
  {
    week: 4, title: "The Gut–Hair Connection", theme: "Nourish", minutes: 13,
    summary: "Your hair is built from what your body can absorb. We connect digestion, nutrients and your scalp, without extreme diets.",
    takeaways: ["Protein at every meal", "Color on your plate means antioxidants", "Notice patterns before cutting food groups"],
    action: "Start the 14-day flare journal in The Scalp-Calm Kitchen.",
    reflection: "How does your scalp feel on your most stressful, least-nourished days?",
    worksheet: { title: "The Scalp-Calm Kitchen", file: "/downloads/scalp-calm-kitchen-food-guide.pdf" },
    poster: "lm-food-cover",
  },
  { week: 5, title: "Low-Tension Styling", theme: "Confidently care", minutes: 15, summary: "Protective styles that actually protect: tension, weight, duration and how to give your edges a break.", takeaways: ["If it hurts, it's too tight", "Rotate tension points", "Rest between installs"], action: "Map your next 3 styles on the Style Planner.", reflection: "Which style do you love that your scalp doesn't?", worksheet: { title: "Low-Tension Style Planner" }, poster: "consultation" },
  { week: 6, title: "Moisture vs. Buildup", theme: "Understand", minutes: 12, summary: "Dry hair or coated hair? Learn the difference and how to reset.", takeaways: ["Water is the moisturizer", "Oils seal, they don't hydrate", "Buildup blocks what you apply"], action: "Do a clarifying reset and note the difference.", reflection: "What product are you holding onto out of habit?", worksheet: { title: "Product Reset Checklist" }, poster: "product-shelf" },
  { week: 7, title: "Stress, Sleep & Your Strands", theme: "Nourish", minutes: 14, summary: "How stress and sleep show up in your hair months later, and small rituals that help.", takeaways: ["Shedding can lag stress by 2–3 months", "Sleep is repair time", "Satin protects while you rest"], action: "Build a 10-minute evening scalp ritual.", reflection: "What drains you, and what restores you?", worksheet: { title: "Evening Ritual Card" }, poster: "studio" },
  { week: 8, title: "Edges & Hairline Care", theme: "Confidently care", minutes: 11, summary: "Gentle, consistent care for the most fragile hair you have.", takeaways: ["Less gel, less brushing, less tension", "Massage, don't scrub", "Early action matters most here"], action: "Swap one edge habit this week.", reflection: "How do you feel when you look at your hairline?", worksheet: { title: "Edges Care Plan" }, poster: "client-portrait" },
  { week: 9, title: "The Scalp Massage Ritual", theme: "Embrace", minutes: 10, summary: "A step-by-step massage routine for circulation, relaxation and connection.", takeaways: ["Pads, not nails", "5 minutes, most days", "Pair it with deep breaths"], action: "Massage 5 days this week and track it.", reflection: "What did you notice when you slowed down?", worksheet: { title: "Massage Ritual Guide" }, poster: "scalp-ritual" },
  { week: 10, title: "Building Your Shelf", theme: "Understand", minutes: 13, summary: "Read labels, choose with purpose, and build a small shelf that works.", takeaways: ["Know your top 3 needs", "Ingredients over hype", "One change at a time"], action: "Audit your shelf with the Shelf Builder.", reflection: "What would your hair ask you to stop buying?", worksheet: { title: "Shelf Builder" }, poster: "product-shelf" },
  { week: 11, title: "Seasons & Your Scalp", theme: "Nourish", minutes: 12, summary: "Adjusting your routine for cold, heat, humidity and travel.", takeaways: ["Winter wants more moisture", "Summer wants more cleansing", "Travel kits save routines"], action: "Write your seasonal swap list.", reflection: "When does your scalp struggle most during the year?", worksheet: { title: "Seasonal Swap List" }, poster: "studio" },
  { week: 12, title: "Your 90-Day Review", theme: "Embrace", minutes: 15, summary: "Retake your baseline, compare your photos, and celebrate how far you've come.", takeaways: ["Progress is more than length", "Habits are the real results", "Set your next 90 days"], action: "Retake the Red Flags checklist and baseline photos.", reflection: "What's the new story you tell about your hair?", worksheet: { title: "90-Day Review" }, poster: "funnel-hero-woman" },
];

/** Demo member — the portal shows the experience 3 weeks in. */
export const demoMember = {
  firstName: "Tasha",
  plan: "Monthly",
  joined: "2026-10-12",
  currentWeek: 3,
  isClient: true, // also books in-salon / virtual sessions with Iisha
  nextDrop: "Monday",
};

export const habits = [
  { key: "water", label: "Water through the day" },
  { key: "protein", label: "Protein at every meal" },
  { key: "massage", label: "5-minute scalp massage" },
  { key: "satin", label: "Satin at night" },
  { key: "tension", label: "Low-tension style" },
] as const;
export type HabitKey = (typeof habits)[number]["key"];
export const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** This week's habit grid seed (true = done). Today = Thu (index 3) in the demo. */
export const habitSeed: Record<HabitKey, boolean[]> = {
  water: [true, true, false, true, false, false, false],
  protein: [true, false, true, true, false, false, false],
  massage: [true, true, true, false, false, false, false],
  satin: [true, true, true, true, false, false, false],
  tension: [true, true, true, true, false, false, false],
};
export const todayIndex = 3;

/** Weekly self-ratings (1–10). Week 0 = baseline. */
export const checkIns = [
  { week: 0, label: "Baseline", scalp: 4, breakage: 3, routine: 3, feeling: 4, score: 8 },
  { week: 1, label: "Week 1", scalp: 5, breakage: 4, routine: 5, feeling: 5, score: 7 },
  { week: 2, label: "Week 2", scalp: 6, breakage: 5, routine: 6, feeling: 6, score: 6 },
  { week: 3, label: "Week 3", scalp: 7, breakage: 5, routine: 7, feeling: 7, score: 5 },
];
export const metrics = [
  { key: "scalp", label: "Scalp comfort" },
  { key: "breakage", label: "Breakage & shedding" },
  { key: "routine", label: "Routine confidence" },
  { key: "feeling", label: "How I feel about my hair" },
] as const;

export const photoCheckIns = [
  { label: "Baseline", date: "Oct 12", image: "client-portrait" },
  { label: "Week 3", date: "Nov 2", image: null as string | null },
];

/** Treatment log — sessions with Iisha (sample entries for the demo). */
export const treatments = [
  {
    id: "t2",
    date: "Oct 24, 2026",
    service: "Full Hair & Scalp Consultation",
    format: "In studio · Henrico",
    notes: "Microscope check showed light buildup at the crown and dryness along the part. Tension at the temples is easing since we changed styles. Keep cleansing every 7–10 days and continue the scalp massage.",
    homeCare: [
      { item: "Gentle cleanse every 7–10 days", done: true },
      { item: "5-minute scalp massage, 5 days a week", done: true },
      { item: "Low-tension styles only for 6 weeks", done: false },
      { item: "Start the 14-day flare journal", done: false },
    ],
  },
  {
    id: "t1",
    date: "Oct 10, 2026",
    service: "Phase 1 Discovery Call",
    format: "Virtual · 15 minutes",
    notes: "Talked through hair history and goals. Main concern: breakage at the temples and an itchy scalp. Recommended a full consultation and the H.A.I.R. Circle for weekly support.",
    homeCare: [{ item: "Take baseline photos", done: true }],
  },
];
export const nextAppointment = { date: "Nov 21, 2026", time: "2:00 pm", service: "Progress Check-In", format: "Virtual" };

export const downloads = [
  { title: "Hair Health Red Flags + Baseline", kind: "Checklist", file: "/downloads/hair-health-red-flags-checklist.pdf", week: 1 },
  { title: "Wash Day Blueprint", kind: "Worksheet", file: "/downloads/wash-day-blueprint.pdf", week: 3 },
  { title: "The Scalp-Calm Kitchen", kind: "Food guide", file: "/downloads/scalp-calm-kitchen-food-guide.pdf", week: 4 },
];
