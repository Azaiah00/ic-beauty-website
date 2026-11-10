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
    title: "Hair Wellness Coach & Educator",
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
  tiktok: "https://www.tiktok.com/@icbeautybrand", // as written by Iisha in her Nov 2026 newsletter
  facebook: "https://www.facebook.com/giftedhands804",
  instagramLegacy: "https://www.instagram.com/giftedhands804",
  youtube: "https://www.youtube.com/@i.c.beauty1561",
  youtubeChannel: "https://www.youtube.com/channel/UCbFR_jMa2G41eYhljQE_fYw",
  // Stan store retired (2026-10-30): every product now sells on-site at /shop (see src/lib/products.ts).
  /**
   * Iisha's Jotform intake system (2026-11-01). EVERY new salon client starts with the
   * discovery-call form (also her TikTok bio link). After the call she sends ONE of three
   * pathway intakes. Only "Maintenance & Style" has been shared so far; add the other two here.
   */
  discoveryFormId: "262988873070067",
  discoveryForm: "https://form.jotform.com/262988873070067",
  pathwayIntakes: {
    maintenanceStyle: "https://form.jotform.com/263017559235055",
  },
  /**
   * Square Appointments (2026-11-01): every "Book" button goes to Square until the custom booking
   * portal is built. /book embeds this booking flow on-site; bookings land in her Square calendar.
   */
  squareBooking: "https://book.squareup.com/appointments/bbc91c4d-3001-402c-b34d-c6630114f74f/location/EVVWFXT0K865D/services",
  /** Deep link to her free "Phase 1 15min Call To Recovery" service in Square. */
  squareDiscoveryCall: "https://book.squareup.com/appointments/bbc91c4d-3001-402c-b34d-c6630114f74f/location/EVVWFXT0K865D/services/OOAAONTVEIK2SEF2PMKETWD4",
  /** Retired 2026-11-01 (replaced by the discovery form + pathway intakes). Kept for reference only. */
  phase2FormLegacy: "https://form.jotform.com/232350414294046",
  /**
   * Phase 1 discovery-call booking. Her current Linktree points to the old Square site.
   * Until Square Appointments / Calendly URL is confirmed, Phase 1 requests go through
   * the on-site Netlify form at /book (real lead capture). Paste the scheduler URL here
   * and every "Book" button switches to it automatically.
   */
  phase1Scheduler: "" as string,
  /** On-site shop (the old Square Online store went offline at the 2026-10-30 DNS cut-over; /s/shop redirects here). */
  shop: "/shop",
  /** Her three affiliate storefronts (Iisha, 2026-11-09). AO Youth + the single red-light link were removed at her request (both live on her Solex store). */
  amazonStorefront: "https://a.co/d/0fwzp0lL", // Amazon "Beauty, Health & Wealth" storefront (icbeauty05)
  solexStore: "https://shop.solexnation.com/Icbeauty",
  // TEMPORARY (2026-11-09): her full-store OHS referral link is pending from Iisha. Until then this uses her
  // credited Digest-A-Meal link so every click carries code=ICBEAUTY. Swap in her "shop everything" link when it arrives.
  supplementsStore: "https://ohs.direct/aff/dam-offer?code=ICBEAUTY",
  digestiveEnzyme: "https://ohs.direct/aff/dam-offer?code=ICBEAUTY", // $1 Digest-A-Meal offer, her referral code
  amazonBloodTypeKit: "https://amzn.to/44EVfSq",
  amazonBloodTypeDiet: "https://amzn.to/3XcFtwy",
  amazonScalpMassager: "https://amzn.to/3yMlVos",
  amazonBlowdryer: "https://amzn.to/4at4UwU",
  frequencyVideo: "https://youtu.be/-MWHhgwO1l4",
  linktree: "https://linktr.ee/I.C.Beauty",
} as const;

/**
 * In-salon product orders from the website (Square checkout links). Pickup at the studio until
 * Iisha confirms she ships. NEEDS CLIENT CONFIRMATION: pickup only, or shipping too?
 */
export const retailOrders = {
  fulfillment: "pickup" as "pickup" | "ship",
  note: "Order online and pick up at the studio. Iisha will let you know when your order is ready.",
  paymentNote: "Website order: pickup at the studio",
};

export const bookHref = links.phase1Scheduler || "/book";

export const nav = [
  { label: "The H.A.I.R. Method", href: "/the-hair-method" },
  { label: "Client Programs", href: "/client-programs" },
  // "For Stylists" (/professional-education) and "Speaking" (/speaking) are paused until Iisha relaunches them (her request, 2026-11-08).
  { label: "Learn", href: "/learn" },
  { label: "The Hub", href: "/hub" },
  { label: "Shop", href: "/shop" },
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
