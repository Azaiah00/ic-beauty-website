/**
 * All page content in Iisha's own voice. Phrases in quotes below are lifted from her
 * own site / Instagram / notebook so the brand never sounds corporate.
 * Compliance: assess / support / educate / refer — never diagnose / treat / cure.
 */

export type Pillar = {
  letter: "H" | "A" | "I" | "R";
  word: string; // acronym word (Healthy Awareness Is Rare)
  phase: string; // phase name (DRAFT — Iisha to confirm)
  promise: "Embrace" | "Understand" | "Confidently Care";
  lens: string; // microscope magnification label used in the motion system
  summary: string;
  detail: string;
  includes: string[];
};

/** DRAFT phase names — built from her real two-phase process + notebook. Iisha confirms or renames. */
export const pillars: Pillar[] = [
  {
    letter: "H",
    word: "Healthy",
    phase: "History",
    promise: "Embrace",
    lens: "10×",
    summary: "Your hair has a story. We start by hearing all of it.",
    detail:
      "Hair loss didn't happen overnight, and it won't regrow overnight. Your 15-minute discovery call and intake look at the whole picture: styling history, tension, chemicals, stress, life changes, family patterns, and the gut and skin concerns most people never connect to their hair.",
    includes: ["Complimentary 15-minute discovery call", "Styling and tension history", "Lifestyle, stress, and wellness intake"],
  },
  {
    letter: "A",
    word: "Awareness",
    phase: "Analysis",
    promise: "Understand",
    lens: "50×",
    summary: "See what your scalp has been trying to tell you.",
    detail:
      "Your full consultation includes a microscopic scalp analysis and a wellness assessment. We look beneath the surface together, on screen, so you understand what is happening at the follicle and not just what you see in the mirror.",
    includes: ["Microscopic scalp analysis", "Wellness assessment", "Education you can see, in plain language"],
  },
  {
    letter: "I",
    word: "Is",
    phase: "Inside-out plan",
    promise: "Understand",
    lens: "100×",
    summary: "A plan built for your hair, your body, and your budget.",
    detail:
      "Every recovery journey is different, and so is every budget. Your personalized plan can include supplement recommendations, topical solutions, ozone or red light therapy, microneedling, cranial massage, and emotional healing tools. If anything points to a medical cause, you'll be referred to a board-certified dermatologist.",
    includes: ["Supplement recommendations", "Topical solutions", "Ozone or red light therapy", "Microneedling", "Cranial massage", "Emotional healing tools"],
  },
  {
    letter: "R",
    word: "Rare",
    phase: "Restore & retain",
    promise: "Confidently Care",
    lens: "200×",
    summary: "Keep growing long after your sessions with me.",
    detail:
      "Teaching a man to fish will always be worth more than a fish dinner. You get check-ins, progress photos taken over time, and a home regimen you actually understand, so you can care for your crown with confidence for years.",
    includes: ["Progress photos over time", "Check-ins and encouragement", "A home regimen made for YOU"],
  },
];

export const askYourself = [
  "Are you noticing more shedding than usual?",
  "Is your crown or hairline beginning to thin or space out?",
  "Have you experienced trauma, anxiety, or urges to pull at your hair?",
  "Does your scalp itch, burn, or feel overly sensitive?",
  "Do you deal with gut issues like acid reflux, irregular digestion, or an autoimmune condition?",
];

export type Offer = {
  id: string;
  name: string;
  kicker: string;
  audience: string;
  description: string;
  price: string; // "" -> NEEDS CLIENT CONFIRMATION
  duration?: string;
  cta: { label: string; href: string };
  external?: boolean;
};

export const clientOffers: Offer[] = [
  {
    id: "discovery",
    name: "Phase 1 · Discovery Call",
    kicker: "Start here",
    audience: "Anyone noticing thinning, shedding, or scalp discomfort",
    description:
      "A compassionate, no-pressure chat to understand your concerns and decide whether a deeper consultation is the right next step.",
    price: "Complimentary",
    duration: "15 minutes · phone or virtual",
    cta: { label: "Request your discovery call", href: "/book" },
  },
  {
    id: "consultation",
    name: "Phase 2 · Full Hair & Scalp Consultation",
    kicker: "The deep look",
    audience: "Clients ready to find the root of their hair concerns",
    description:
      "A microscopic scalp analysis and wellness assessment, followed by education, support, and a personalized plan. Complete the Phase 2 intake form before your visit.",
    price: "",
    duration: "In studio · virtual options available",
    cta: { label: "Complete the Phase 2 intake", href: "https://form.jotform.com/232350414294046" },
    external: true,
  },
  {
    id: "recovery-plan",
    name: "Hair Recovery Program",
    kicker: "Guided, not guessed",
    audience: "Clients following a personalized H.A.I.R. plan",
    description:
      "Your ongoing plan of in-studio services, home care, and check-ins. Spots are limited so each client gets real attention.",
    price: "",
    duration: "Designed around your needs and budget",
    cta: { label: "Ask about openings", href: "/book" },
  },
  {
    id: "virtual",
    name: "Virtual Hair Health Appointment",
    kicker: "Anywhere",
    audience: "Clients outside the Richmond area, or anyone who prefers home",
    description:
      "Guidance, regimen-building, and accountability over video. You get the H.A.I.R. approach from your own bathroom mirror.",
    price: "",
    cta: { label: "Request a virtual visit", href: "/book?type=virtual" },
  },
  {
    id: "sound",
    name: "Custom Sound Therapy",
    kicker: "Reset",
    audience: "Anyone carrying stress in their body and scalp",
    description:
      "A relaxation practice that pairs with your hair wellness routine. Includes how-to tips, weekly check-ins, and a free demo before you commit.",
    price: "$24.99",
    cta: { label: "Join on Stan", href: "https://stan.store/ICBeauty" },
    external: true,
  },
];

export const familyClasses = [
  {
    name: "Child Hair-Care",
    blurb:
      "It's wonderful that we're moving away from chemically relaxing our children's hair. But maintaining natural hair is a process, and it can get overwhelming fast. This hands-on session helps you handle styling day with ease. Small classes mean every parent gets guidance made for their little one.",
    learn: ["Choosing products for your child's hair type", "Proper shampoo techniques", "How to detangle without the tears", "Styling options"],
  },
  {
    name: "Shampooing & Flat Ironing",
    blurb:
      "We all want the sleek look sometimes, and getting to the salon isn't always possible. Learn to maintain your salon service and get a salon finish at home without heat damage.",
    learn: ["Choosing the right tools", "Prepping hair for heat", "How to avoid heat damage"],
  },
  {
    name: "Shampooing & Twisting",
    blurb:
      "It would be nice if we could all literally wash and go. If you haven't gotten the results you want, this hands-on session fills in the missing pieces of the puzzle.",
    learn: ["Proper sectioning", "The right products for the style you want", "Maintaining your twists", "Maximum moisture retention"],
  },
];

export const stylistClasses = [
  {
    id: "consultation",
    name: "Mastering the Consultation",
    format: "Live group class · take-home material + product kit",
    status: "Next dates announced to the waitlist first",
    blurb:
      "A step-by-step breakdown of the most important (and most underrated) part of a client's visit. Learn the formula for maximizing your income, keeping more clients, and delivering an experience they don't forget.",
    outcomes: ["Turn consultations into currency", "Raise retention and rebooking", "Get past the fear of selling with communication that feels natural"],
  },
  {
    id: "color",
    name: "Color with Confidence",
    format: "One-on-one session · tailored to you",
    status: "Booked individually",
    blurb:
      "Take the guesswork out of color. This session is built around your specific weak spots, so you cut the fluff and learn exactly what gets clients what they TRULY want.",
    outcomes: ["Stop guessing at formulas", "Grow your service menu and revenue", "Behind-the-chair knowledge you can use the next day"],
  },
  {
    id: "hair-method-pro",
    name: "The H.A.I.R. Method for Stylists",
    format: "Certification track · in development",
    status: "Join the waitlist to shape it",
    blurb:
      "Bring hair-wellness awareness into your own chair: spot early warning signs, have the hard conversation with care, and know when to refer out. Planned as a certification for salons that want the H.A.I.R. standard.",
    outcomes: ["Recognize early signs of tension and shedding", "Educate clients without overstepping", "Build a referral-ready, wellness-first service menu"],
  },
];

export const talks = [
  {
    title: "Healthy Awareness Is Rare",
    sub: "The H.A.I.R. Wellness Method",
    audience: "Women's organizations · conferences · corporate ERGs",
    takeaways: ["Why hair is a mirror of whole-body health", "The four phases of the H.A.I.R. Method", "Simple habits that protect your crown before loss begins"],
  },
  {
    title: "Your Crown, Your Health",
    sub: "Hair loss in Black women is a wellness conversation",
    audience: "HBCUs · sororities · churches · health fairs",
    takeaways: ["Shampoo frequency, tension, and the scarcity mindset", "The gut–skin–scalp connection", "When to see a stylist, and when to see a dermatologist"],
  },
  {
    title: "The Consultation Is the Service",
    sub: "Turning consultations into currency",
    audience: "Beauty schools · stylist associations · salon teams",
    takeaways: ["The consultation formula behind higher retention", "Communication that removes the fear of selling", "Wellness-first conversations that build trust"],
  },
  {
    title: "Raising Healthy Crowns",
    sub: "Natural hair care for parents",
    audience: "Schools · parent groups · community centers",
    takeaways: ["Wash day without the tears", "Products that fit your child's hair", "Protective styling without tension damage"],
  },
];

export const audiences = ["HBCUs", "Sororities", "Women's organizations", "Churches", "Corporate ERGs", "Beauty schools", "Stylist associations", "Health fairs", "Parent groups", "Professional audiences"];

export type HubItem = {
  name: string;
  type: "Digital guide" | "Free download" | "Membership" | "Supplement" | "Wellness tool" | "Hair tool" | "Video series" | "Wellness scan";
  price?: string;
  blurb: string;
  href: string;
  affiliate?: boolean;
  cta: string;
};

export const hubItems: HubItem[] = [
  {
    name: "Radiance Rewired",
    type: "Digital guide",
    price: "$7.99",
    blurb: "Transform your gut, transform your hair. The link between gut health and hair, food and lifestyle shifts, and how to nourish your strands from the inside out.",
    href: "https://stan.store/ICBeauty/p/radiance-rewired",
    cta: "I want to heal my gut",
  },
  {
    name: "Hair Health Checklist",
    type: "Free download",
    price: "Free",
    blurb: "A quick self-check you can run at home before small problems become big ones.",
    href: "https://stan.store/ICBeauty",
    cta: "Get my guide",
  },
  {
    name: "Psoriasis / Dermatitis Food List",
    type: "Free download",
    price: "Free",
    blurb: "A food list guide for clients managing an itchy, flaky, or irritated scalp alongside their physician's care.",
    href: "https://stan.store/ICBeauty/p/psoriasisdermatitis-food-list-guide",
    cta: "Download free",
  },
  {
    name: "It's a WIN WIN Membership",
    type: "Membership",
    price: "$13.99",
    blurb: "Exclusive how-to tips and weekly check-ins to keep you consistent between visits.",
    href: "https://stan.store/ICBeauty",
    cta: "Join the membership",
  },
  {
    name: "Digestive Enzyme",
    type: "Supplement",
    price: "$1 offer",
    blurb: "Iisha's current $1 digestive enzyme deal from Optimal Health Systems.",
    href: "https://www.optimalhealthsystems.com/cart/49244690350382:1",
    affiliate: true,
    cta: "Claim the $1 deal",
  },
  {
    name: "Supplement Collection",
    type: "Supplement",
    blurb: "The full Optimal Health Systems collection Iisha recommends to clients on a hair recovery journey.",
    href: "https://www.optimalhealthsystems.com/collections/all/",
    affiliate: true,
    cta: "Browse supplements",
  },
  {
    name: "AO Youth Collagen Booster",
    type: "Supplement",
    blurb: "A collagen-boosting supplement Iisha shares with clients.",
    href: "https://shop.solexnation.com/Icbeauty/product/1463",
    affiliate: true,
    cta: "View product",
  },
  {
    name: "Red Light Therapy",
    type: "Wellness tool",
    blurb: "An at-home red light device for clients who want to keep their routine going between sessions.",
    href: "https://shop.solexnation.com/Icbeauty/product/748",
    affiliate: true,
    cta: "View device",
  },
  {
    name: "AO Scan · 6-Day Pass",
    type: "Wellness scan",
    price: "$50.00",
    blurb: "A six-day pass for the holistic body-scanning wellness tool Iisha uses. It is for wellness insight only and is not a medical test.",
    href: "https://www.icbeautyinyou.com/s/shop",
    cta: "Get the pass",
  },
  {
    name: "Scalp Massager",
    type: "Hair tool",
    blurb: "Love on your scalp. The massager Iisha recommends for wash day.",
    href: "https://amzn.to/3yMlVos",
    affiliate: true,
    cta: "See on Amazon",
  },
  {
    name: "Blow Dryer with All Attachments",
    type: "Hair tool",
    blurb: "One of Iisha's favorite tools for a smooth, low-damage blow-out at home.",
    href: "https://amzn.to/4at4UwU",
    affiliate: true,
    cta: "See on Amazon",
  },
  {
    name: "Blood Type Home Kit + Diet Book",
    type: "Wellness tool",
    blurb: "For clients exploring the blood type diet as part of their wellness routine.",
    href: "https://amzn.to/44EVfSq",
    affiliate: true,
    cta: "See the kit",
  },
  {
    name: "Let's Talk About… (YouTube)",
    type: "Video series",
    price: "Free",
    blurb: "Iisha's video series: honest conversations on hair, health, and holistic solutions for a better life.",
    href: "https://www.youtube.com/@i.c.beauty1561",
    cta: "Watch the series",
  },
];

/** Retail haircare exactly as listed on her current Square store (2026-10-20). Prices: CONFIRM before launch. */
export const retail: { name: string; price: string; group: "Cleanse" | "Condition" | "Style" | "Treat"; status?: string }[] = [
  { name: "Rosemary Carbon Shampoo", price: "$35.95", group: "Cleanse" },
  { name: "Sea Moss Fusion Shampoo", price: "$31.95", group: "Cleanse" },
  { name: "XTC Shampoo", price: "$32.95", group: "Cleanse", status: "Out of stock" },
  { name: "Honey Almond Shampoo", price: "$20.00", group: "Cleanse" },
  { name: "Organic Shampoo", price: "$19.95", group: "Cleanse" },
  { name: "Moisturizing Shampoo", price: "$13.00", group: "Cleanse" },
  { name: "Deep Cleanse Shampoo", price: "$13.00", group: "Cleanse" },
  { name: "Rosemary Carbon Conditioner", price: "$35.95", group: "Condition" },
  { name: "Sea Moss Fusion Conditioner", price: "$31.95", group: "Condition" },
  { name: "XTC Conditioner", price: "$32.95", group: "Condition", status: "Out of stock" },
  { name: "Moisturizing Conditioner", price: "$15.00", group: "Condition" },
  { name: "Honey Almond Leave In Conditioner", price: "$19.95", group: "Condition" },
  { name: "Moisture Lock w/ Shea Butter", price: "$18.00", group: "Condition" },
  { name: "Sea Moss Blow-Drying Spray", price: "$45.95", group: "Style" },
  { name: "Sea Moss Curl Gel", price: "$35.95", group: "Style" },
  { name: "Holding Spray", price: "$27.95", group: "Style" },
  { name: "Rosemary Foam", price: "$26.00", group: "Style" },
  { name: "Honey Almond Foam", price: "$25.00", group: "Style" },
  { name: "Coconut Milk Styling Foam", price: "$24.00", group: "Style" },
  { name: "Rose Water Spray", price: "$23.95", group: "Style" },
  { name: "All Texture Holding Gel", price: "$19.95", group: "Style" },
  { name: "S3 Spray", price: "$19.95", group: "Style" },
  { name: "Growth Crème", price: "$19.95", group: "Treat" },
  { name: "Natural Oil", price: "$16.95", group: "Treat" },
  { name: "TCB Oil", price: "$16.00", group: "Treat", status: "Low stock" },
  { name: "Organic Complex", price: "$15.95", group: "Treat" },
];

export type QA = { q: string; a: string };

export const faqs: { group: string; items: QA[] }[] = [
  {
    group: "Hair recovery",
    items: [
      {
        q: "How much does hair recovery treatment cost?",
        a: "Every person's hair loss is different, and so is every budget. Iisha believes everyone deserves a chance to heal and regrow their hair. Recovery takes an investment of time, effort, and money, and your plan is designed to fit your needs where you are. Pricing is shared after your complimentary discovery call.",
      },
      {
        q: "What happens on the free discovery call?",
        a: "It's a compassionate, no-pressure 15-minute conversation about what you're noticing, how long it has been happening, and what you've tried. Together you decide whether a full consultation is the right next step. Nothing is sold to you on the call.",
      },
      {
        q: "What is included in the full consultation?",
        a: "A microscopic scalp analysis and a wellness assessment to look for root causes, plus education, support, and a personalized plan. That plan may include supplement recommendations, topical solutions, ozone or red light therapy, microneedling, cranial massage, and emotional healing tools.",
      },
      {
        q: "How long until I see results?",
        a: "Your hair loss didn't happen overnight, and it won't regrow overnight. Hair grows in cycles that run for months and years, so recovery is measured in months, with progress photos taken along the way. Results vary from person to person, and consistency matters most.",
      },
      {
        q: "Do you diagnose or treat alopecia?",
        a: "No. I.C. Beauty provides scalp assessment, hair care services, and hair-wellness education, which are not medical care. If your assessment points to a possible medical cause, such as sudden patchy loss, scarring, pain, or sores, Iisha will recommend that you see a board-certified dermatologist, and she is happy to work alongside your physician.",
      },
      {
        q: "Do you offer virtual appointments?",
        a: "Yes. Virtual hair health appointments are available for clients outside the Richmond area and for anyone who prefers to meet from home.",
      },
    ],
  },
  {
    group: "Booking & studio",
    items: [
      {
        q: "Where is the studio?",
        a: "I.C. Beauty is at 8030 W Broad St, Suite 117, Henrico, VA 23294, in Richmond's West End near Short Pump, with easy access from Glen Allen, Richmond, and the rest of Henrico County.",
      },
      {
        q: "What are your hours?",
        a: "Wednesday 1–6 pm, Thursday 11 am–9 pm, Friday 11 am–6:30 pm, and Saturday 11 am–6 pm. The studio is closed Sunday, Monday, and Tuesday. Appointment openings are typically 4–12 weeks out, so book early.",
      },
      {
        q: "How far out should I book?",
        a: "Openings usually run 4–12 weeks out. Iisha takes on a limited number of new treatment-plan clients at a time, so requesting your discovery call now holds your place in line.",
      },
    ],
  },
  {
    group: "Classes & speaking",
    items: [
      {
        q: "Do you teach classes for stylists?",
        a: "Yes. Mastering the Consultation is a live group class, and Color with Confidence is a one-on-one session tailored to your weak spots. Every class includes take-home material and a product kit so you can put your new skills to work right away.",
      },
      {
        q: "Do you teach parents how to care for their child's natural hair?",
        a: "Yes. The hands-on Child Hair-Care class covers product selection for your child's hair type, proper shampoo technique, detangling without the tears, and styling options. Classes are small so every parent gets customized guidance.",
      },
      {
        q: "Can I book Iisha to speak at my event?",
        a: "Yes. Iisha speaks to HBCUs, sororities, churches, women's organizations, beauty schools, and professional audiences on hair wellness, the H.A.I.R. Wellness Method, and turning consultations into currency. Send an inquiry from the Speaking page with your date, audience, and format.",
      },
    ],
  },
];

export const testimonialsPlaceholder = [
  { quote: "NEEDS REAL REVIEW — paste a verbatim Google review here (with the client's permission).", name: "Client name", detail: "Hair recovery client" },
  { quote: "NEEDS REAL REVIEW — paste a verbatim stylist testimonial from Mastering the Consultation.", name: "Stylist name", detail: "Class graduate" },
  { quote: "NEEDS REAL REVIEW — paste an organizer quote from a past workshop or talk.", name: "Organizer", detail: "Event host" },
];
