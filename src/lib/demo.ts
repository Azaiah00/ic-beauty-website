/**
 * PRESENTER DEMO MODE — click through every funnel step without typing or creating real leads.
 *
 * Turned on ONLY for the current browser tab by visiting /demo (or any page with ?demo=1).
 * While on: forms are pre-filled with sample data, submitting skips the network (no Netlify entries),
 * and a floating Back / Next bar walks through the steps below. Real visitors never see any of this.
 * Turn off with the "Exit demo" button (or close the tab).
 */

export const DEMO_KEY = "icb-demo";

export type DemoStep = { path: string; title: string; funnel: 1 | 2; say: string[] };

export const demoSteps: DemoStep[] = [
  {
    path: "/hair-love", funnel: 1, title: "Free checklist sign-up",
    say: [
      "This is where TikTok Live and IG bio traffic lands. Say icbeautyinyou.com/free on a Live and it comes here.",
      "One job only: get the free checklist. No menu, no distractions.",
      "Only name and email are required; phone is optional, so more people finish.",
    ],
  },
  {
    path: "/hair-love/welcome", funnel: 1, title: "Thank-you page + $7.99 offer",
    say: [
      "She gets both PDFs instantly, plus a copy by email.",
      "A video from you goes here: what her score means and what to do next.",
      "Radiance Rewired for $7.99 turns a free lead into a buyer while she's most interested.",
      "Then the invitation to the February pilot.",
    ],
  },
  {
    path: "/shop/radiance-rewired", funnel: 1, title: "Radiance Rewired (on your site, not Stan)",
    say: [
      "Every product now sells on your own site. Stan is gone.",
      "Until Square checkout is connected, she requests it and you text her the payment link.",
    ],
  },
  {
    path: "/hair-love/30-days", funnel: 1, title: "30-day pilot sales page",
    say: [
      "The hook, the video, the 4 weeks mapped to Embrace, Understand, Nourish and Confidently care.",
      "Core and VIP side by side; the dashed boxes are where your prices and dates go.",
      "She applies (5 quick questions), so you choose who's in the February pilot.",
    ],
  },
  {
    path: "/hair-love/reserved", funnel: 1, title: "Application received",
    say: ["She knows exactly what happens next: you review, you text her the seat link, she gets ready for February."],
  },
  {
    path: "/circle", funnel: 2, title: "The H.A.I.R. Circle membership",
    say: [
      "The monthly membership that replaces the WIN WIN membership.",
      "A new lesson every Monday, a private portal, and you in her corner every week.",
      "14-day free trial, then monthly or yearly.",
    ],
  },
  {
    path: "/circle/join", funnel: 2, title: "Join (Google sign-in or email)",
    say: ["Pick monthly or annual, then one tap with Google. No passwords to remember."],
  },
  {
    path: "/circle/welcome", funnel: 2, title: "Welcome + first 3 actions",
    say: ["The first two weeks decide whether a member stays, so she gets three simple things to do today."],
  },
  {
    path: "/portal", funnel: 2, title: "Member home",
    say: [
      "This week's lesson, her progress rings, today's habits and her streak.",
      "Her next session with you, and what unlocks on Monday.",
      "Tap a habit or Mark complete and watch the rings move.",
    ],
  },
  {
    path: "/portal/lessons", funnel: 2, title: "Lesson library",
    say: ["12 weeks planned. Finished weeks are marked, future weeks unlock every Monday."],
  },
  {
    path: "/portal/lessons/3", funnel: 2, title: "Inside a lesson",
    say: ["Your video, three takeaways, one action step, the worksheet (Wash Day Blueprint) and her private reflection journal."],
  },
  {
    path: "/portal/progress", funnel: 2, title: "Progress tracking",
    say: [
      "Weekly check-in sliders, a trend chart she can watch climb, the habit grid and photo check-ins.",
      "Seeing progress is what keeps people paying every month.",
    ],
  },
  {
    path: "/portal/treatments", funnel: 2, title: "My care with Iisha",
    say: [
      "For your clients: your session notes, their home-care plan as a checklist, and the next appointment.",
      "You never have to repeat yourself, and she never forgets what you said in the chair.",
    ],
  },
  {
    path: "/portal/downloads", funnel: 2, title: "Downloads library",
    say: ["Every guide and worksheet she's unlocked, all in one place."],
  },
];

/** Sample data used to pre-fill every form while demo mode is on. */
export const demoSample = {
  firstName: "Iisha",
  fullName: "Iisha Silver",
  email: "demo@icbeautyinyou.com",
  phone: "(804) 555-0123",
  frustration: "Breakage keeps showing up at my temples and my scalp itches by day four.",
  goal: "Wash days that feel calm, edges coming back, and actually knowing what my hair needs.",
};

export function isDemoActive(): boolean {
  try {
    return typeof window !== "undefined" && sessionStorage.getItem(DEMO_KEY) === "1";
  } catch {
    return false;
  }
}
