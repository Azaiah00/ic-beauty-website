import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Link-preview cards (Open Graph / iMessage / social). Each funnel + portal page gets its own
 * 1200x630 card in /public/og/ that shows the real page, so links sent in a text thread are
 * easy to tell apart. Regenerate the images with `scripts/og-cards` (see docs/funnels) after
 * a page design changes.
 */
type Share = { title: string; description: string; image: string; alt: string };

export const shareCards: Record<string, Share> = {
  "/demo": {
    title: "I.C. Beauty demo: both funnels + the member portal",
    description: "Walk through every step: free checklist, $7.99 guide, February pilot, The H.A.I.R. Circle and the member portal.",
    image: "/og/demo.jpg",
    alt: "Demo walkthrough of the I.C. Beauty funnels and member portal",
  },
  "/hair-love": {
    title: "Free: Hair Health Red Flags Most People Ignore",
    description: "Your hair has been talking. A free 5-minute self-check from hair wellness educator Iisha C. Silver.",
    image: "/og/hair-love.jpg",
    alt: "Free Hair Health Red Flags checklist sign-up page",
  },
  "/hair-love/welcome": {
    title: "Your checklist is ready",
    description: "Download Hair Health Red Flags plus the bonus Scalp-Calm Kitchen guide, and see your next step.",
    image: "/og/hair-love-welcome.jpg",
    alt: "Thank-you page with the free downloads",
  },
  "/shop/radiance-rewired": {
    title: "Radiance Rewired: transform your gut, transform your hair",
    description: "The gut–hair connection, the food shifts that support it, and how to nourish your strands from the inside out. $7.99.",
    image: "/og/radiance-rewired.jpg",
    alt: "Radiance Rewired digital guide product page",
  },
  "/hair-love/30-days": {
    title: "30 Days to a New Love Story with Your H.A.I.R.",
    description: "Iisha C. Silver's virtual hair education program. Founding pilot cohort, February 2027. Limited seats.",
    image: "/og/30-days.jpg",
    alt: "30 Days to a New Love Story with Your H.A.I.R. program page",
  },
  "/hair-love/reserved": {
    title: "Your founding-seat application is in",
    description: "What happens next for the February pilot of 30 Days to a New Love Story with Your H.A.I.R.",
    image: "/og/reserved.jpg",
    alt: "Pilot application received page",
  },
  "/circle": {
    title: "The H.A.I.R. Circle: monthly hair wellness membership",
    description: "A new lesson every week. A portal that tracks your progress. Iisha in your corner. 14-day free trial.",
    image: "/og/circle.jpg",
    alt: "The H.A.I.R. Circle membership page",
  },
  "/circle/join": {
    title: "Join The H.A.I.R. Circle: 14-day free trial",
    description: "Choose monthly or annual and continue with Google or email.",
    image: "/og/circle-join.jpg",
    alt: "Join The H.A.I.R. Circle sign-up page",
  },
  "/circle/welcome": {
    title: "Welcome to The H.A.I.R. Circle",
    description: "Your first three steps, then straight into your member portal.",
    image: "/og/circle-welcome.jpg",
    alt: "Circle welcome page with the first three steps",
  },
  "/portal": {
    title: "Member home: this week's lesson, progress and habits",
    description: "The H.A.I.R. Circle member portal: your lesson, progress rings, daily habits and next session with Iisha.",
    image: "/og/portal.jpg",
    alt: "Member portal home screen",
  },
  "/portal/lessons": {
    title: "Lesson library: a new lesson every Monday",
    description: "Twelve weeks of the H.A.I.R. Wellness Method, unlocking one Monday at a time.",
    image: "/og/portal-lessons.jpg",
    alt: "Member portal lesson library",
  },
  "/portal/lessons/3": {
    title: "Week 3: Wash Day, Reimagined",
    description: "Inside a lesson: the video, three takeaways, an action step, the Wash Day Blueprint worksheet and a private journal.",
    image: "/og/portal-lesson-3.jpg",
    alt: "Inside the Week 3 lesson",
  },
  "/portal/progress": {
    title: "Progress tracking: check-ins, trends and photos",
    description: "Weekly self-ratings, a trend chart, the habit grid and photo check-ins, all in one place.",
    image: "/og/portal-progress.jpg",
    alt: "Member portal progress tracking page",
  },
  "/portal/treatments": {
    title: "My care with Iisha: session notes + home-care plan",
    description: "Everything from your appointments: Iisha's notes, your home-care checklist and your next session.",
    image: "/og/portal-care.jpg",
    alt: "Member portal care page with session notes",
  },
  "/portal/downloads": {
    title: "Downloads library",
    description: "Every guide and worksheet you've unlocked, ready to download.",
    image: "/og/portal-downloads.jpg",
    alt: "Member portal downloads library",
  },
  "/shop": {
    title: "Shop I.C. Beauty: hair wellness guides & membership",
    description: "Digital guides, free downloads and The H.A.I.R. Circle membership from Iisha C. Silver.",
    image: "/og/shop.jpg",
    alt: "I.C. Beauty shop page",
  },
};

/** Open Graph + Twitter metadata for a path. Returns {} for paths without a card (they keep the site default). */
export function shareMeta(path: string): Pick<Metadata, "openGraph" | "twitter"> {
  const c = shareCards[path];
  if (!c) return {};
  const images = [{ url: c.image, width: 1200, height: 630, alt: c.alt }];
  return {
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "I.C. Beauty",
      url: `${SITE_URL}${path}`,
      title: c.title,
      description: c.description,
      images,
    },
    twitter: { card: "summary_large_image", title: c.title, description: c.description, images: [c.image] },
  };
}
