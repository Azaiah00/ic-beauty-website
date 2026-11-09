/**
 * Every form on the site, in one place: what it's called in the owner dashboard, which fields are
 * required, which Square customer group it tags, the statuses Iisha can set, and the confirmation
 * email the person receives. Server-only. Add a form here and it works everywhere (API, dashboard, CSV).
 */
import { SITE_URL, business } from "@/lib/site";
import { funnel } from "@/lib/funnel";
import type { Submission } from "./store";

const U = (p: string) => `${SITE_URL}${p}`;
const BOOK = U("/book");

export type Confirmation = { subject: string; heading: string; paragraphs: string[]; cta?: { label: string; href: string }; links?: { label: string; href: string }[] };

export type FormDef = {
  label: string;
  /** Short label for tabs. */
  tab: string;
  required: string[];
  group: string;
  statuses: string[];
  confirmation?: (s: Submission) => Confirmation;
};

const first = (s: Submission) => (s.name.split(/\s+/)[0] || "there").replace(/^\w/, (c) => c.toUpperCase());
const LEAD = ["New", "Contacted", "Booked", "Not a fit"];

export const FORMS: Record<string, FormDef> = {
  "pilot-application": {
    label: "30-Day Program applications",
    tab: "30-Day Program",
    required: ["name", "email"],
    group: "Website: 30-Day Program applicants",
    statuses: ["New", "Contacted", "Accepted", "Paid", "Waitlist", "Not a fit"],
    confirmation: (s) => ({
      subject: "Your founding-seat application is in",
      heading: `${first(s)}, your application is in.`,
      paragraphs: [
        `Thank you for applying for the founding group of <strong>${funnel.pilot.name}</strong>, the ${funnel.pilot.when} pilot.`,
        "I read every application myself. I'll reach out personally by email or text with your next steps, so keep an eye out for a message from me.",
        "While you wait, start with the free Hair Health Red Flags checklist. It's the same place we'll begin together.",
      ],
      cta: { label: "Get the free checklist", href: U(funnel.leadMagnet.file) },
      links: [{ label: "Questions? Call or text " + business.phone, href: business.phoneHref }],
    }),
  },
  "hair-love-optin": {
    label: "Free checklist sign-ups",
    tab: "Checklist",
    required: ["email"],
    group: "Website: Free checklist",
    statuses: ["New", "Contacted", "Bought guide", "Applied to program"],
    confirmation: (s) => ({
      subject: "Your Hair Health Red Flags checklist is here",
      heading: `${first(s)}, your checklist is ready.`,
      paragraphs: [
        "Here's your copy of <strong>Hair Health Red Flags Most People Ignore</strong>, plus your free bonus, <strong>The Scalp-Calm Kitchen</strong>.",
        "Set aside five quiet minutes, go through it honestly, and tally your score. Your hair has been talking. This is how you start listening.",
        `When you're ready for the next step, <strong>${funnel.pilot.name}</strong> is my virtual program starting ${funnel.pilot.when}. Founding seats are limited.`,
      ],
      cta: { label: "Download your checklist", href: U(funnel.leadMagnet.file) },
      links: [
        { label: "Download the bonus: The Scalp-Calm Kitchen", href: U(funnel.bonus.file) },
        { label: "See the 30-day program", href: U("/hair-love/30-days") },
      ],
    }),
  },
  "circle-join": {
    label: "H.A.I.R. Circle sign-ups",
    tab: "Circle",
    required: ["email"],
    group: "Website: H.A.I.R. Circle founding list",
    statuses: ["New", "Invited", "Member", "Not a fit"],
    confirmation: (s) => ({
      subject: "You're on the founding list for The H.A.I.R. Circle",
      heading: `${first(s)}, you're on the list.`,
      paragraphs: [
        "Thank you for joining the founding list for <strong>The H.A.I.R. Circle</strong>, my monthly hair wellness membership.",
        "Founding members hear first when doors open, along with the founding-member price and how to start your 14-day free trial. Nothing is charged today.",
      ],
      cta: { label: "Get the free checklist while you wait", href: U(funnel.leadMagnet.file) },
    }),
  },
  "scalp-check": {
    label: "Scalp Self-Check results",
    tab: "Scalp Check",
    required: ["email"],
    group: "Website: Scalp Self-Check",
    statuses: LEAD,
    confirmation: (s) => ({
      subject: `Your Scalp Self-Check result: ${s.data.profile || "your next step"}`,
      heading: `${first(s)}, here's your result.`,
      paragraphs: [
        `Your Scalp Self-Check result is <strong>${s.data.profile || "ready"}</strong>.`,
        s.data["refer-flag"] === "yes"
          ? "Some of your answers are worth checking with a board-certified dermatologist or your doctor. I'm happy to talk through what to ask and how we can support your scalp alongside that care."
          : "The best next step is a complimentary 15-minute discovery call, so I can hear your story and tell you honestly what I see. Request it with the button below and I'll personally reach out to schedule it.",
        "Mention your result on the call so we can start right where you are.",
      ],
      cta: { label: "Request a complimentary discovery call", href: BOOK },
    }),
  },
  "discovery-call": {
    label: "Class & session requests",
    tab: "Requests",
    required: ["name", "email"],
    group: "Website: Session & class requests",
    statuses: LEAD,
    confirmation: (s) => ({
      subject: "We got your request",
      heading: `Thank you, ${first(s)}.`,
      paragraphs: [
        `Your request${s.data["request-type"] ? ` for <strong>${s.data["request-type"]}</strong>` : ""} came through. I'll reach out personally to find a time that works.`,
        `If it's urgent, call or text me at ${business.phone}.`,
      ],
    }),
  },
  contact: {
    label: "Contact messages",
    tab: "Contact",
    required: ["name", "email"],
    group: "Website: Contact form",
    statuses: ["New", "Replied", "Closed"],
    confirmation: (s) => ({
      subject: "Thanks for reaching out to I.C. Beauty",
      heading: `Thank you, ${first(s)}.`,
      paragraphs: ["Your message came through, and I'll get back to you personally.", `If it's time-sensitive, call or text ${business.phone}.`],
    }),
  },
  "speaking-inquiry": {
    label: "Speaking inquiries",
    tab: "Speaking",
    required: ["name", "email"],
    group: "Website: Speaking inquiries",
    statuses: ["New", "Contacted", "Booked", "Declined"],
    confirmation: (s) => ({
      subject: "Your speaking inquiry is in",
      heading: `Thank you, ${first(s)}.`,
      paragraphs: [
        `Thank you for thinking of me for ${s.data.organization ? `<strong>${s.data.organization}</strong>` : "your event"}. I'll review the details and follow up personally about availability and next steps.`,
      ],
    }),
  },
  "class-waitlist": {
    label: "Stylist class waitlist",
    tab: "Class waitlist",
    required: ["name", "email"],
    group: "Website: Stylist class waitlist",
    statuses: ["New", "Invited", "Enrolled"],
    confirmation: (s) => ({
      subject: "You're on the waitlist",
      heading: `You're on the list, ${first(s)}.`,
      paragraphs: [`You're on the waitlist${s.data.class ? ` for <strong>${s.data.class}</strong>` : ""}. You'll hear first when dates and seats open.`],
    }),
  },
  "product-request": {
    label: "Product requests & early lists",
    tab: "Products",
    required: ["email"],
    group: "Website: Product requests",
    statuses: ["New", "Early list", "Link sent", "Paid", "Delivered"],
    confirmation: (s) =>
      /notify/i.test(s.data.request ?? "")
        ? {
            subject: `You're on the early list for ${s.data.product || "my new guide"}`,
            heading: `You're on the list, ${first(s)}.`,
            paragraphs: [
              `<strong>${s.data.product || "My new guide"}</strong> is almost ready. You'll be the first to know the moment it launches.`,
              "In the meantime, your free Hair Health Red Flags checklist is the best place to start.",
            ],
            cta: { label: "Get the free checklist", href: U(funnel.leadMagnet.file) },
          }
        : {
            subject: `Your request for ${s.data.product || "your guide"}`,
            heading: `Thank you, ${first(s)}.`,
            paragraphs: [`Your request for <strong>${s.data.product || "your guide"}</strong> came through. I'll send your secure checkout link personally.`],
          },
  },
  newsletter: {
    label: "Newsletter sign-ups",
    tab: "Newsletter",
    required: ["email"],
    group: "Website: Newsletter",
    statuses: ["Subscribed", "Unsubscribed"],
    confirmation: () => ({
      subject: "Welcome to the H.A.I.R. Letter",
      heading: "Welcome. You're in.",
      paragraphs: ["You'll get seasonal scalp care tips, new classes and first access to programs, straight from me. No spam, ever.", "Start here with the free Hair Health Red Flags checklist."],
      cta: { label: "Get the free checklist", href: U(funnel.leadMagnet.file) },
    }),
  },
};

export const formNames = Object.keys(FORMS);
