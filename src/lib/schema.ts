import { SITE_URL, business, links, METHOD_DEFINITION } from "./site";
import { stylistClasses, faqs, type QA } from "./content";
import type { Article } from "./articles";

/** One linked @graph. Entities reference each other by @id so search + AI engines resolve one clear entity. */
export const ids = {
  business: `${SITE_URL}/#business`,
  person: `${SITE_URL}/#iisha`,
  website: `${SITE_URL}/#website`,
  method: `${SITE_URL}/the-hair-method#method`,
};

const dayMap: Record<string, string> = {
  Monday: "https://schema.org/Monday",
  Tuesday: "https://schema.org/Tuesday",
  Wednesday: "https://schema.org/Wednesday",
  Thursday: "https://schema.org/Thursday",
  Friday: "https://schema.org/Friday",
  Saturday: "https://schema.org/Saturday",
  Sunday: "https://schema.org/Sunday",
};

const sameAs = [links.instagram, links.facebook, links.youtube, links.stan, links.tiktok];

export function businessNode() {
  return {
    "@type": ["HairSalon", "HealthAndBeautyBusiness"],
    "@id": ids.business,
    name: business.name,
    legalName: business.legalName,
    slogan: "Where hair, health & education connect.",
    description:
      "Holistic hair loss and scalp wellness practice in Henrico (Richmond), Virginia, led by Iisha C. Silver, creator of The H.A.I.R. Wellness Method. Hair recovery consultations, microscopic scalp analysis, stylist education, and speaking.",
    url: SITE_URL,
    logo: `${SITE_URL}/brand/ic-mark-on-plum.png`,
    image: `${SITE_URL}/og.png`,
    telephone: "+1-804-397-3340",
    email: business.email,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.region,
      postalCode: business.address.postalCode,
      addressCountry: business.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: business.geo.lat, longitude: business.geo.lng },
    hasMap: business.mapsUrl,
    openingHoursSpecification: business.hours
      .filter((h) => h.open)
      .map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: dayMap[h.day], opens: h.open, closes: h.close })),
    areaServed: business.areaServed.map((a) => ({ "@type": a.startsWith("Virtual") ? "Place" : "City", name: a })),
    founder: { "@id": ids.person },
    employee: { "@id": ids.person },
    knowsAbout: ["Hair loss", "Scalp health", "Trichology", "Textured hair care", "Hair recovery", "Stylist education"],
    sameAs,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Hair wellness services",
      itemListElement: [
        { name: "Hair Recovery Discovery Call", desc: "Complimentary 15-minute discovery call.", price: "0" },
        { name: "Full Hair & Scalp Consultation", desc: "Microscopic scalp analysis, wellness assessment, and personalized plan." },
        { name: "Hair Recovery Program", desc: "Ongoing personalized plan with in-studio services, home care, and check-ins." },
        { name: "Virtual Hair Health Appointment", desc: "Hair-wellness guidance and regimen building by video." },
        { name: "Child Hair-Care Class", desc: "Hands-on natural hair care class for parents." },
        { name: "Mastering the Consultation (stylist class)", desc: "Consultation, retention, and communication training for stylists." },
      ].map((s) => ({
        "@type": "Offer",
        ...(s.price ? { price: s.price, priceCurrency: "USD" } : {}),
        itemOffered: { "@type": "Service", name: s.name, description: s.desc, provider: { "@id": ids.business } },
      })),
    },
  };
}

export function personNode() {
  return {
    "@type": "Person",
    "@id": ids.person,
    name: business.owner.name,
    givenName: "Iisha",
    alternateName: "Iisha Silver",
    jobTitle: business.owner.title,
    description:
      "Iisha C. Silver is a holistic hair recovery practitioner, service educator, and speaker in Richmond, Virginia, and the creator of The H.A.I.R. Wellness Method.",
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}/og.png`,
    worksFor: { "@id": ids.business },
    homeLocation: { "@type": "Place", name: "Richmond, Virginia" },
    knowsAbout: [
      "Trichology",
      "Hair loss in Black women",
      "Traction alopecia education",
      "Scalp health",
      "Textured and natural hair care",
      "Hair consultation",
      "Hair color",
      "Sound therapy",
      "Gut health and hair",
      "Children's natural hair care",
    ],
    // hasCredential: add once Iisha confirms issuing bodies (cosmetology license, trichology certification).
    sameAs,
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: SITE_URL,
    name: "I.C. Beauty",
    alternateName: "I.C. Beauty — Iisha C. Silver",
    publisher: { "@id": ids.business },
    inLanguage: "en-US",
  };
}

export function methodNode() {
  return {
    "@type": "DefinedTerm",
    "@id": ids.method,
    name: "The H.A.I.R. Wellness Method",
    alternateName: ["H.A.I.R. Wellness Method", "Healthy Awareness Is Rare"],
    description: METHOD_DEFINITION,
    url: `${SITE_URL}/the-hair-method`,
    inDefinedTermSet: { "@type": "DefinedTermSet", name: "I.C. Beauty signature methods", creator: { "@id": ids.person } },
  };
}

export function graph(...nodes: object[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path === "/" ? "" : it.path}`,
    })),
  };
}

export function faqNode(items: QA[], path: string) {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}${path}#faq`,
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export const allFaqs = faqs.flatMap((g) => g.items);

export function courseNodes() {
  return stylistClasses.map((c) => ({
    "@type": "Course",
    "@id": `${SITE_URL}/professional-education#${c.id}`,
    name: c.name,
    description: c.blurb,
    provider: { "@id": ids.business },
    instructor: { "@id": ids.person },
    teaches: c.outcomes,
    educationalLevel: "Professional",
    audience: { "@type": "EducationalAudience", educationalRole: "Licensed cosmetologists and stylists" },
  }));
}

export function articleNode(a: Article) {
  return {
    "@type": "Article",
    "@id": `${SITE_URL}/learn/${a.slug}#article`,
    headline: a.title,
    description: a.description,
    datePublished: a.published,
    dateModified: a.modified,
    author: { "@id": ids.person },
    publisher: { "@id": ids.business },
    mainEntityOfPage: `${SITE_URL}/learn/${a.slug}`,
    about: a.category,
    image: `${SITE_URL}/og.png`,
    citation: a.sources.map((s) => s.url),
    inLanguage: "en-US",
  };
}

export function serviceNode(name: string, description: string, path: string) {
  return {
    "@type": "Service",
    "@id": `${SITE_URL}${path}#service`,
    name,
    description,
    provider: { "@id": ids.business },
    areaServed: business.areaServed.map((a) => ({ "@type": "Place", name: a })),
    url: `${SITE_URL}${path}`,
  };
}
