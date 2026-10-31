/**
 * FUNNEL CONFIG — "30 Days to a New Love Story with Your H.A.I.R."
 * Every funnel fact lives here so pages never hard-code prices, dates, links or file paths.
 *
 * Flow:  TikTok Live / IG bio  →  /hair-love (free checklist opt-in)
 *        →  /hair-love/welcome (instant download + bonus + $7.99 Radiance Rewired + pilot invite)
 *        →  /hair-love/30-days (pilot sales page + founding-seat application)
 *        →  /hair-love/reserved (application received)
 * Short links for saying out loud on Live: /hairlove and /free → /hair-love (see next.config.ts).
 */

export const funnel = {
  basePath: "/hair-love",

  leadMagnet: {
    title: "Hair Health Red Flags Most People Ignore",
    subtitle: "A simple self-check to help you understand what your hair may be trying to tell you.",
    file: "/downloads/hair-health-red-flags-checklist.pdf",
    pages: 5,
    items: 13,
  },

  bonus: {
    title: "The Scalp-Calm Kitchen",
    subtitle: "Best foods for psoriasis & seborrheic dermatitis: 6 food groups, a build-a-plate guide, 3 recipes, a grocery list and a 14-day flare journal",
    file: "/downloads/scalp-calm-kitchen-food-guide.pdf",
    pages: 10,
  },

  /** Low-cost offer shown right after opt-in: sold on-site (Stan store is being retired). Price as listed on her Stan store, 2026-10-30. */
  tripwire: {
    slug: "radiance-rewired",
    name: "Radiance Rewired",
    tagline: "Transform your gut, transform your hair.",
    price: "$7.99",
    href: "/shop/radiance-rewired",
  },

  pilot: {
    name: "30 Days to a New Love Story with Your H.A.I.R.",
    short: "The 30-Day H.A.I.R. Love Story",
    acronym: "Healthy Awareness Is Rare",
    format: "Virtual education program",
    when: "February 2027",
    /** Exact start date — NEEDS CLIENT CONFIRMATION (empty = shows a marker). */
    startDate: "" as string,
    /** Founding-member pricing — NEEDS CLIENT CONFIRMATION (empty = shows a marker, never a made-up number). */
    corePrice: "" as string,
    vipPrice: "" as string,
    /** Seat cap for the pilot — NEEDS CLIENT CONFIRMATION. */
    seats: "" as string,
    /** Square payment links for each tier. Until set, the funnel collects applications and Iisha sends the link. */
    coreCheckout: "" as string,
    vipCheckout: "" as string,
  },

  /** Drop the Kie / Iisha video files here (in /public/videos) and they appear automatically. */
  video: {
    welcome: "" as string,
    welcomePoster: "/images/funnel-hero-woman.jpg",
    /** 34-second promo made with Kie (Veo 3.1 + Suno). Replace with an Iisha-recorded version any time. */
    pilot: "/videos/hair-love-30-days.mp4" as string,
    pilotPoster: "/images/hair-love-video-poster.jpg",
  },
} as const;

/** The four weeks map 1:1 to her method phases and her "Embrace, Understand, Confidently Care" promise. */
export const pilotWeeks = [
  {
    week: "Week 1",
    theme: "Embrace",
    phase: "H — History",
    title: "Meet your hair where it is",
    body: "We start with your story: your hair history, the styles, products and seasons that shaped it. You'll take a baseline photo, learn your hair's real needs, and let go of the guilt.",
  },
  {
    week: "Week 2",
    theme: "Understand",
    phase: "A — Analysis",
    title: "Learn what your scalp is saying",
    body: "Shedding vs. breakage, flakes vs. dryness, tension vs. texture. You'll learn to read the signs yourself, so you stop guessing and start choosing on purpose.",
  },
  {
    week: "Week 3",
    theme: "Nourish",
    phase: "I — Inside-out plan",
    title: "Care from the inside out",
    body: "Food, gut, stress and sleep, the parts of hair health most routines skip. You'll build simple, realistic habits that support your hair from the inside.",
  },
  {
    week: "Week 4",
    theme: "Confidently care",
    phase: "R — Restore & retain",
    title: "Your routine, for life",
    body: "Wash day, protective styling, low-tension habits and product choices, put together into one routine you can actually keep. You leave with a plan, not a pile of products.",
  },
] as const;

export const pilotIncludes = [
  { title: "Weekly live virtual lessons", body: "Learn with Iisha in real time each week, with live Q&A. Replays included." },
  { title: "The H.A.I.R. video library", body: "Step-by-step maintenance and hair-care routine videos you can rewatch any time." },
  { title: "Your 30-day care plan", body: "Daily and weekly actions, a progress tracker and photo check-ins to see your own change." },
  { title: "A private community", body: "Women on the same journey, with accountability and encouragement so you don't quit on week two." },
] as const;

/** Tier features are a proposal for Iisha to approve — see docs/funnels/hair-love-funnel.md. */
export const pilotTiers = [
  {
    key: "core",
    name: "The Love Story",
    tag: "Core",
    features: [
      "4 weekly live virtual lessons + replays",
      "Full H.A.I.R. video library",
      "Your 30-day care plan + progress tracker",
      "Private community & weekly check-ins",
      "Founding-member price (pilot only)",
    ],
  },
  {
    key: "vip",
    name: "The Love Story VIP",
    tag: "VIP",
    features: [
      "Everything in The Love Story",
      "A 1:1 virtual hair & scalp session with Iisha",
      "A personalized product & routine plan",
      "Priority Q&A with Iisha during the 30 days",
      "A 30-day follow-up check-in after the program",
    ],
  },
] as const;

export const pilotFaq = [
  {
    q: "When does it start, and how much time does it take?",
    a: "The pilot runs in February 2027. Plan on about 2–3 hours a week: one live lesson (replays are included if you miss it), plus short daily care actions.",
  },
  {
    q: "Is it really virtual? I'm not in Richmond.",
    a: "Yes. Everything happens online, so you can join from anywhere. VIP sessions with Iisha are virtual too.",
  },
  {
    q: "What's a “pilot,” and why join now?",
    a: "This is the very first group. Founding members get the lowest price this program will ever have, closer access to Iisha, and a real say in shaping it. In return, we ask for honest feedback and, if you're happy, a short video about your experience.",
  },
  {
    q: "I'm dealing with real thinning or bald spots. Is this for me?",
    a: "This is an education program, not medical treatment. If you're experiencing sudden, patchy or painful hair loss, start with a Phase 1 Discovery Call and a board-certified dermatologist. Many women do both: medical care plus the daily habits this program teaches.",
  },
  {
    q: "Do I need to buy a bunch of products?",
    a: "No. A big part of the 30 days is learning to use fewer, better products with purpose. Iisha will never require you to buy anything to complete the program.",
  },
  {
    q: "What happens after I apply?",
    a: "Iisha personally reviews every application. If it's a good fit, you'll get a text or email with your secure payment link to lock in your founding seat. Seats are limited so everyone gets real attention.",
  },
] as const;
