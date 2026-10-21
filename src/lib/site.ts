/**
 * SINGLE SOURCE OF TRUTH — every verified fact about I.C. Beauty lives here.
 * Verified 2026-10-20 from icbeautyinyou.com, linktr.ee/I.C.Beauty, stan.store/ICBeauty
 * and instagram.com/i.c.beautybrand. Anything not verified is flagged `confirm: true`
 * and surfaces on the site as a visible NEEDS CLIENT CONFIRMATION marker in dev.
 */

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.icbeautyinyou.com").replace(/\/$/, "");

export const business = {
  name: "I.C. Beauty",
  legalName: "I.C. Beauty LLC",
  tagline: "Where hair, health & education connect.",
  motto: ["I.C. Beauty", "I.C. Success", "I.C. You"] as const,
  owner: {
    name: "Iisha C. Silver",
    shortName: "Iisha",
    nickname: "Indestructible Iish",
    title: "Holistic Hair Recovery Practitioner & Service Educator",
    roots: "Brooklyn, NY",
  },
  phone: "(804) 397-3340",
  phoneHref: "tel:+18043973340",
  email: "icbeautyinyou@gmail.com",
  address: {
    street: "8030 W Broad St, Suite 117",
    city: "Henrico",
    region: "VA",
    regionName: "Virginia",
    postalCode: "23294",
    country: "US",
  },
  /** Google Maps pin for 8030 W Broad St, Henrico VA 23294 (verified 2026-10-20). */
  geo: { lat: 37.6270193, lng: -77.530197 },
  mapsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=8030+W+Broad+St+Suite+117+Henrico+VA+23294",
  areaServed: ["Henrico", "Richmond", "Short Pump", "Glen Allen", "Chesterfield", "Mechanicsville", "Virtual (anywhere)"],
  /** Hours exactly as published on icbeautyinyou.com */
  hours: [
    { day: "Monday", short: "Mon", open: null, close: null },
    { day: "Tuesday", short: "Tue", open: null, close: null },
    { day: "Wednesday", short: "Wed", open: "13:00", close: "18:00" },
    { day: "Thursday", short: "Thu", open: "11:00", close: "21:00" },
    { day: "Friday", short: "Fri", open: "11:00", close: "18:30" },
    { day: "Saturday", short: "Sat", open: "11:00", close: "18:00" },
    { day: "Sunday", short: "Sun", open: null, close: null },
  ],
  bookingNote: "Appointment openings are typically 4–12 weeks out.",
} as const;

/** Every outbound link she currently uses — verified live 2026-10-20. */
export const links = {
  instagram: "https://www.instagram.com/i.c.beautybrand/",
  tiktok: "https://www.tiktok.com/@i.c.beautybrand", // she states "same name" as IG — CONFIRM
  facebook: "https://www.facebook.com/giftedhands804",
  instagramLegacy: "https://www.instagram.com/giftedhands804",
  youtube: "https://www.youtube.com/@i.c.beauty1561",
  youtubeChannel: "https://www.youtube.com/channel/UCbFR_jMa2G41eYhljQE_fYw",
  stan: "https://stan.store/ICBeauty",
  stanRadiance: "https://stan.store/ICBeauty/p/radiance-rewired",
  stanFoodList: "https://stan.store/ICBeauty/p/psoriasisdermatitis-food-list-guide",
  phase2Form: "https://form.jotform.com/232350414294046",
  /**
   * Phase 1 discovery-call booking. Her current Linktree points to the old Square site.
   * Until Square Appointments / Calendly URL is confirmed, Phase 1 requests go through
   * the on-site Netlify form at /book (real lead capture). Paste the scheduler URL here
   * and every "Book" button switches to it automatically.
   */
  phase1Scheduler: "" as string,
  /** Square Online retail store. Move it to shop.icbeautyinyou.com before DNS cut-over. */
  shop: "https://www.icbeautyinyou.com/s/shop",
  supplementsStore: "https://www.optimalhealthsystems.com/collections/all/",
  digestiveEnzyme: "https://www.optimalhealthsystems.com/cart/49244690350382:1",
  aoYouth: "https://shop.solexnation.com/Icbeauty/product/1463",
  redLight: "https://shop.solexnation.com/Icbeauty/product/748",
  amazonBloodTypeKit: "https://amzn.to/44EVfSq",
  amazonBloodTypeDiet: "https://amzn.to/3XcFtwy",
  amazonScalpMassager: "https://amzn.to/3yMlVos",
  amazonBlowdryer: "https://amzn.to/4at4UwU",
  frequencyVideo: "https://youtu.be/-MWHhgwO1l4",
  linktree: "https://linktr.ee/I.C.Beauty",
} as const;

export const bookHref = links.phase1Scheduler || "/book";

export const nav = [
  { label: "The H.A.I.R. Method", href: "/the-hair-method" },
  { label: "Client Programs", href: "/client-programs" },
  { label: "For Stylists", href: "/professional-education" },
  { label: "Speaking", href: "/speaking" },
  { label: "Learn", href: "/learn" },
  { label: "The Hub", href: "/hub" },
  { label: "About", href: "/about" },
] as const;

/** The one canonical definition sentence — repeated verbatim site-wide for entity clarity (GEO). */
export const METHOD_DEFINITION =
  "The H.A.I.R. Wellness Method™ (Healthy Awareness Is Rare) is Iisha C. Silver's four-phase approach to understanding, maintaining, and teaching healthy hair practices — History, Analysis, Inside-out plan, and Restore & retain — connecting hair, health, and education.";

export const DISCLAIMER =
  "I.C. Beauty provides cosmetology, scalp care, and hair-wellness education services. We do not diagnose, treat, or cure any medical condition, and our services are not a substitute for care from a licensed physician. If your assessment suggests a possible medical cause of hair loss, we will recommend you see a board-certified dermatologist. Individual results vary.";

export const AFFILIATE_NOTE =
  "Some links on this page are affiliate or referral links. Iisha may earn a commission at no extra cost to you. She only shares products she uses or recommends to clients. Supplements are not intended to diagnose, treat, cure, or prevent any disease — talk with your physician before starting any supplement.";

export function formatHour(t: string | null) {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "pm" : "am";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return m ? `${hh}:${String(m).padStart(2, "0")} ${ampm}` : `${hh} ${ampm}`;
}
