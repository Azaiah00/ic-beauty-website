/**
 * The Hair Wellness Library — cornerstone AEO/GEO articles.
 * Format: question-led H1 → 40–60 word direct answer → depth → sources → referral line.
 * Every factual claim cites a dermatology source. Iisha should review and personalize before launch.
 */

export type Article = {
  slug: string;
  title: string;
  question: string;
  description: string;
  answer: string; // 40–60 words, definition-first (lifted by AI answers)
  category: "Hair loss" | "Scalp care" | "Everyday care" | "Inside out" | "The Method";
  published: string;
  modified: string;
  minutes: number;
  sections: { h2: string; body: string[]; list?: string[] }[];
  sources: { label: string; url: string }[];
  cta: { label: string; href: string };
};

const REVIEWED = "2026-10-20";

export const articles: Article[] = [
  {
    slug: "what-does-a-hair-loss-specialist-do",
    title: "What does a hair loss specialist do, and how is that different from a dermatologist?",
    question: "What does a hair loss specialist (trichology practitioner) do?",
    description:
      "How a holistic hair loss practitioner assesses your scalp, what happens in a consultation, and when you should see a dermatologist instead. From Iisha C. Silver in Henrico, VA.",
    answer:
      "A hair loss specialist trained in trichology studies the hair and scalp, looks for patterns behind thinning and shedding, and builds a care and education plan. A dermatologist is a physician who diagnoses and medically treats hair and scalp disease. The two work best together. The specialist supports and educates, and the dermatologist diagnoses and prescribes.",
    category: "Hair loss",
    published: "2026-10-20",
    modified: REVIEWED,
    minutes: 5,
    sections: [
      {
        h2: "Trichology looks beneath the surface",
        body: [
          "Trichology is the study of the hair and scalp. A trichology-trained practitioner looks past the strand itself. Lifestyle, stress, styling habits, nutrition, and emotional load can all show up in your hair before you notice them anywhere else.",
          "At I.C. Beauty, that means slowing down and hearing your whole story before anyone touches your hair.",
        ],
      },
      {
        h2: "What happens in a consultation",
        body: ["Iisha's process runs in two phases so you never pay for more than you need."],
        list: [
          "Phase 1: a complimentary 15-minute discovery call to understand your concerns.",
          "Phase 2: a full consultation with a microscopic scalp analysis and a wellness assessment.",
          "A personalized plan that may include supplement recommendations, topical solutions, ozone or red light therapy, microneedling, cranial massage, and emotional healing tools.",
          "Progress photos and check-ins so you can see the journey over time.",
        ],
      },
      {
        h2: "When to see a dermatologist",
        body: [
          "Some hair loss has a medical cause and needs a physician. See a board-certified dermatologist if you notice sudden or patchy loss, shiny or scarred skin where hair used to be, pain, burning, open sores, or crusting on the scalp. Iisha will tell you when she sees signs that call for a referral, and she is happy to work alongside your doctor.",
        ],
      },
    ],
    sources: [
      { label: "American Academy of Dermatology — Hair loss: Who gets and causes", url: "https://www.aad.org/public/diseases/hair-loss/causes/18-causes" },
      { label: "American Academy of Dermatology — Hairstyles that pull can lead to hair loss", url: "https://www.aad.org/public/diseases/hair-loss/causes/hairstyles" },
    ],
    cta: { label: "Book a complimentary discovery call", href: "/book" },
  },
  {
    slug: "how-often-should-black-women-shampoo",
    title: "How often should Black women shampoo their hair?",
    question: "How often should Black women wash their hair?",
    description:
      "Dermatologists recommend washing textured hair once a week or every other week. Iisha explains why stretching wash day too long can hurt your scalp, and how to make it self-care.",
    answer:
      "The American Academy of Dermatology recommends washing Black and textured hair once a week or every other week and conditioning every time you wash. Going much longer lets product, oil, and buildup sit on the scalp. That can leave hair dry and the scalp irritated, which is a poor environment for healthy growth.",
    category: "Everyday care",
    published: "2026-10-20",
    modified: REVIEWED,
    minutes: 4,
    sections: [
      {
        h2: "Ladies, we have to shampoo more often",
        body: [
          "Wanting to keep a style for what seems like forever often comes from a scarcity mindset. I get it. A salon visit costs more than it did ten years ago, and so do gas, groceries, and healthcare.",
          "But creating healthier habits before hair loss begins will save you the emotional turmoil that comes with losing your self-image and confidence. If you can budget for a salon visit once a month, plan to shampoo in between. Consider it self-care. Love on your scalp.",
        ],
      },
      {
        h2: "What dermatologists recommend",
        body: ["The American Academy of Dermatology's everyday care tips for Black hair include:"],
        list: [
          "Wash your hair once a week or every other week.",
          "Use conditioner every time you wash, and coat the ends.",
          "Use a hot oil treatment twice a month.",
          "Use a heat-protecting product before styling.",
          "Make sure braids, cornrows, or weaves are not too tight. If it hurts while your hair is being styled, ask the stylist to stop and redo it.",
        ],
      },
      {
        h2: "Wearing protective styles? Still care for your scalp",
        body: [
          "Long-wear styles are not the enemy. Neglecting the scalp underneath is. Ask your stylist how to cleanse your scalp while the style is in, and give your edges regular breaks from tension.",
        ],
      },
    ],
    sources: [{ label: "American Academy of Dermatology — Black hair: Tips for everyday care", url: "https://www.aad.org/public/everyday-care/hair-scalp-care/hair/care-african-american" }],
    cta: { label: "Learn wash day the right way in a class", href: "/client-programs#classes" },
  },
  {
    slug: "early-signs-of-traction-alopecia",
    title: "Early signs your edges are thinning from tension, and what to do now",
    question: "What are the early signs of traction alopecia?",
    description:
      "Broken hairs at the forehead, a receding hairline, and thin patches where hair is pulled tight are early warning signs of tension hair loss. Here is what to watch for and what to do.",
    answer:
      "Early warning signs of traction alopecia include broken hairs around the forehead, a hairline that is starting to recede, and thin patches where hair is pulled tightly. A tight or painful style is a red flag. The AAD notes this loss can become permanent the longer it continues, so act early and see a dermatologist.",
    category: "Hair loss",
    published: "2026-10-20",
    modified: REVIEWED,
    minutes: 5,
    sections: [
      {
        h2: "Check your hairline once a month",
        body: ["Dermatologists suggest watching for:"],
        list: ["Broken hairs around your forehead", "A receding hairline", "Patches of hair loss where hair is pulled tightly", "Pain, stinging, crusting, or 'tenting' of the scalp while a style is in"],
      },
      {
        h2: "Pain equals damage",
        body: [
          "If a style hurts while it's being installed, it's too tight. Ask your stylist to stop and redo it. Thicker braids and locs, kept shorter, pull less. The AAD suggests wearing braids no longer than 6 to 8 weeks and giving your hair regular breaks from tight styling.",
        ],
      },
      {
        h2: "Why acting early matters",
        body: [
          "According to the AAD, traction alopecia can become permanent the longer it goes on. Once hair stops growing and only smooth, shiny skin remains, it cannot grow back. See a board-certified dermatologist as soon as you notice signs. A hair wellness practitioner can then help you change habits, care for your scalp, and choose lower-tension styles.",
        ],
      },
    ],
    sources: [{ label: "American Academy of Dermatology — Hairstyles that pull can lead to hair loss", url: "https://www.aad.org/public/diseases/hair-loss/causes/hairstyles" }],
    cta: { label: "Take the 2-minute Scalp Self-Check", href: "/scalp-check" },
  },
  {
    slug: "gut-health-and-hair",
    title: "Can gut health and nutrition affect your hair?",
    question: "Can nutrition and gut health affect hair loss?",
    description:
      "Too little protein, iron, biotin, or zinc can cause noticeable hair loss. Iisha explains why her approach looks at your hair from the inside out.",
    answer:
      "Yes. The American Academy of Dermatology notes that getting too little biotin, iron, protein, or zinc can cause noticeable hair loss. Your body has to absorb nutrients to use them, which is why Iisha's assessment asks about digestion, diet, stress, and lifestyle, not just your hair routine. Confirm deficiencies with your physician before supplementing.",
    category: "Inside out",
    published: "2026-10-20",
    modified: REVIEWED,
    minutes: 4,
    sections: [
      {
        h2: "Your hair grows out of your body",
        body: [
          "It's important to remember that hair is part of the body. It grows out of the largest organ, your skin. Better self-care leads to healthier hair. Don't wait until the problem arises. Be proactive and learn a regimen that is right for YOU.",
        ],
      },
      {
        h2: "What the research supports",
        body: [
          "Dermatologists list low biotin, iron, protein, or zinc among the causes of hair loss, and say hair can regrow once the body gets what it was missing. Stressful events, illness, and childbirth can also trigger heavy shedding a few months later.",
        ],
      },
      {
        h2: "Go deeper",
        body: [
          "Iisha's guide Radiance Rewired walks through the gut and hair connection, food and lifestyle shifts, and supplement information for energy, immunity, and stronger strands. Use it alongside, not instead of, your physician's advice.",
        ],
      },
    ],
    sources: [
      { label: "American Academy of Dermatology — Hair loss: Who gets and causes", url: "https://www.aad.org/public/diseases/hair-loss/causes/18-causes" },
      { label: "American Academy of Dermatology — Do you have hair loss or hair shedding?", url: "https://www.aad.org/public/diseases/hair-loss/insider/shedding" },
    ],
    cta: { label: "Get Radiance Rewired ($7.99)", href: "https://stan.store/ICBeauty/p/radiance-rewired" },
  },
  {
    slug: "shedding-vs-hair-loss",
    title: "Is it shedding or hair loss? How to tell the difference",
    question: "How many hairs a day is normal to shed?",
    description:
      "Shedding 50 to 100 hairs a day is normal. Here is how to tell everyday shedding from excessive shedding and true hair loss, and when to get help.",
    answer:
      "Shedding 50 to 100 hairs a day is normal, according to the American Academy of Dermatology. Excessive shedding often appears a few months after childbirth, major stress, illness, high fever, surgery, or big weight loss, and usually settles within six to nine months. Hair that stops growing back, or thins in patches, needs an assessment.",
    category: "Hair loss",
    published: "2026-10-20",
    modified: REVIEWED,
    minutes: 4,
    sections: [
      {
        h2: "Normal shedding is part of the growth cycle",
        body: [
          "Every hair cycles through growth (anagen, which lasts years), a brief transition (catagen), and rest (telogen, a few months) before it falls out and a new hair starts. Losing some hair every day is a sign the cycle is working.",
        ],
      },
      {
        h2: "Common shedding triggers",
        body: ["The AAD lists these as common triggers of excessive shedding, usually noticed a few months after the event:"],
        list: ["Childbirth", "High stress", "High fever, surgery, or recovering from illness", "Losing 20 pounds or more", "Stopping birth control pills"],
      },
      {
        h2: "When it's more than shedding",
        body: [
          "If shedding doesn't settle, if your part is widening, or if your crown or hairline is spacing out, book a discovery call. A microscopic scalp analysis shows what is happening at the follicle so you are no longer guessing.",
        ],
      },
    ],
    sources: [
      { label: "American Academy of Dermatology — Do you have hair loss or hair shedding?", url: "https://www.aad.org/public/diseases/hair-loss/insider/shedding" },
      { label: "Wolfram LJ. Human hair: a unique physicochemical composite. J Am Acad Dermatol. 2003 (via BioNumbers, Harvard)", url: "https://bionumbers.hms.harvard.edu/bionumber.aspx?id=114255" },
    ],
    cta: { label: "Book a complimentary discovery call", href: "/book" },
  },
  {
    slug: "what-is-the-hair-wellness-method",
    title: "What is the H.A.I.R. Wellness Method?",
    question: "What is the H.A.I.R. Wellness Method?",
    description:
      "Healthy Awareness Is Rare. The four-phase approach created by Iisha C. Silver for understanding, maintaining, and teaching healthy hair practices.",
    answer:
      "The H.A.I.R. Wellness Method™ (Healthy Awareness Is Rare) is Iisha C. Silver's four-phase approach to understanding, maintaining, and teaching healthy hair practices: History, Analysis, Inside-out plan, and Restore & retain. It connects hair, health, and education for clients, stylists, and organizations.",
    category: "The Method",
    published: "2026-10-20",
    modified: REVIEWED,
    minutes: 3,
    sections: [
      {
        h2: "Why awareness is rare",
        body: [
          "Most of us only pay attention to our hair when something goes wrong. The H.A.I.R. Method flips that. It teaches the awareness to notice early, the understanding to know why, and the confidence to care for your crown for life.",
        ],
      },
      {
        h2: "The four phases",
        body: ["Each phase builds toward the promise: Embrace, Understand, Confidently Care."],
        list: [
          "H — History: your hair has a story, so we hear all of it.",
          "A — Analysis: a microscopic scalp analysis and wellness assessment.",
          "I — Inside-out plan: a personalized plan for your hair, body, and budget.",
          "R — Restore & retain: check-ins, progress photos, and a regimen you can keep up.",
        ],
      },
      {
        h2: "Three ways to experience it",
        body: [
          "Clients experience the method through Client Programs, stylists learn it through Professional Education, and organizations bring it to their communities through Speaking & Workshops.",
        ],
      },
    ],
    sources: [],
    cta: { label: "Explore the full method", href: "/the-hair-method" },
  },
];

export function getArticle(slug: string) {
  return articles.find((a) => a.slug === slug);
}
