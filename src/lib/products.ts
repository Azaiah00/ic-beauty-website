/**
 * I.C. BEAUTY SHOP — every digital product sells on her own site (the Stan store is being retired).
 *
 * PAYMENTS: not live yet. Each paid product has a `checkoutUrl` seam:
 *   - empty  → the "Get it" button opens an on-site request form (Netlify "product-request"),
 *              and Iisha replies with a secure Square payment link.
 *   - filled → the button goes straight to that Square checkout link (Square Online checkout / payment link).
 * When the Phase 2 Square integration ships, only this file changes, not the pages.
 *
 * Prices are as listed on her Stan store (verified 2026-10-30). Confirm before launch.
 */

export type Product = {
  slug: string;
  name: string;
  kind: "Digital guide" | "Free download" | "Audio" | "Membership";
  price: string; // display price
  priceNote?: string;
  tagline: string;
  description: string;
  includes: string[];
  image: string; // key in /public/images (img() helper)
  /** Free products deliver through the funnel (email capture first). */
  freeHref?: string;
  /** Products with their own funnel (e.g. the membership) link there instead of a product page. */
  redirectTo?: string;
  /** Square payment link; empty = request form. */
  checkoutUrl: string;
  /** Owed asset: the original file still has to be sent to us to recreate. */
  needsSource?: string;
  featured?: boolean;
};

export const products: Product[] = [
  {
    slug: "hair-health-red-flags",
    name: "Hair Health Red Flags Most People Ignore",
    kind: "Free download",
    price: "Free",
    tagline: "The 5-minute self-check for what your hair is trying to tell you.",
    description:
      "Thirteen signs across your scalp, routine and body, a simple score, and exactly what to do next, plus a hair baseline page so you can see your progress in 30 days.",
    includes: ["13-point red flags checklist", "Your score + next steps", "When to see a dermatologist", "My Hair Baseline tracker"],
    image: "mock-checklist",
    freeHref: "/hair-love",
    checkoutUrl: "",
    featured: true,
  },
  {
    slug: "scalp-calm-kitchen",
    name: "The Scalp-Calm Kitchen",
    kind: "Free download",
    price: "Free",
    tagline: "Best foods for psoriasis & seborrheic dermatitis.",
    description:
      "A 10-page food guide: six scalp-calm food groups, a build-a-plate visual, three simple recipes, a printable grocery list and a 14-day flare journal to find your personal triggers.",
    includes: ["6 food groups explained", "Build-a-plate guide", "3 photographed recipes", "Grocery list + 14-day flare journal"],
    image: "mock-food-guide",
    freeHref: "/hair-love",
    checkoutUrl: "",
  },
  {
    slug: "radiance-rewired",
    name: "Radiance Rewired",
    kind: "Digital guide",
    price: "$7.99",
    tagline: "Transform your gut, transform your hair.",
    description:
      "The link between gut health and hair, the food and lifestyle shifts that support it, and how to nourish your strands from the inside out. The perfect next step after the checklist.",
    includes: ["The gut–hair connection, explained simply", "Food & lifestyle shifts", "How to nourish your hair from the inside out", "Instant digital download"],
    image: "lm-food-cover",
    checkoutUrl: "",
    needsSource: "Original Radiance Rewired file (to recreate in the new design)",
    featured: true,
  },
  {
    slug: "custom-sound-therapy",
    name: "Custom Sound Therapy",
    kind: "Audio",
    price: "$24.99",
    tagline: "A personalized sound session for calm and restoration.",
    description:
      "A custom sound therapy session created for you by Iisha, part of her holistic, inside-out approach to stress and well-being.",
    includes: ["Personalized to you", "Delivered digitally", "Listen anywhere"],
    image: "scalp-ritual",
    checkoutUrl: "",
    needsSource: "Details of how Custom Sound Therapy is delivered (file, call, or both)",
  },
  {
    slug: "hair-circle",
    name: "The H.A.I.R. Circle",
    kind: "Membership",
    price: "14-day free trial",
    priceNote: "then monthly",
    tagline: "A new lesson every week, and a portal that tracks your progress.",
    description:
      "Iisha's monthly membership (replaces the WIN WIN membership): weekly lessons with worksheets, habit and progress tracking, monthly live Q&A, and care notes for clients in treatment.",
    includes: ["A new lesson every Monday", "Progress, habit & photo tracking", "Monthly live Q&A", "Care notes for clients"],
    image: "funnel-community",
    redirectTo: "/circle",
    checkoutUrl: "",
  },
];

export const productBySlug = (slug: string) => products.find((p) => p.slug === slug);
