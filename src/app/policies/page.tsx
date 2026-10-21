import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { Needs } from "@/components/ui/Needs";
import { DISCLAIMER, AFFILIATE_NOTE, business } from "@/lib/site";

export const metadata: Metadata = {
  title: "Policies & Disclosures",
  description: "I.C. Beauty booking, cancellation, privacy, wellness disclaimer, photo consent, and affiliate disclosure policies.",
  alternates: { canonical: "/policies" },
  robots: { index: true, follow: true },
};

const sections: { id: string; t: string; body: React.ReactNode }[] = [
  { id: "disclaimer", t: "Wellness & medical disclaimer", body: <p>{DISCLAIMER}</p> },
  {
    id: "booking",
    t: "Booking, deposits & cancellations",
    body: (
      <>
        <p>Appointment openings are typically 4–12 weeks out. Please arrive on time. Late arrivals may need to be shortened or rescheduled so other clients are not affected.</p>
        <p className="mt-3"><Needs>Iisha to confirm deposit amount, cancellation window, no-show fee, and late policy</Needs></p>
      </>
    ),
  },
  {
    id: "photos",
    t: "Progress photos & consent",
    body: <p>Progress photos are part of your recovery journey and are taken to monitor change over time. They are never shared publicly without your written permission, and you can withdraw permission at any time.</p>,
  },
  {
    id: "privacy",
    t: "Privacy",
    body: (
      <>
        <p>When you submit a form on this site, we collect the information you provide (such as your name, email, phone, and details about your hair concerns) to respond to your request and provide services. We do not sell your personal information. Form submissions are processed by our website host (Netlify). Hair and wellness details you share are treated as confidential and used only to support your care.</p>
        <p className="mt-3">To request a copy or deletion of your information, email <a className="underline" href={`mailto:${business.email}`}>{business.email}</a>.</p>
      </>
    ),
  },
  { id: "affiliate", t: "Affiliate disclosure", body: <p>{AFFILIATE_NOTE}</p> },
  {
    id: "terms",
    t: "Terms of use",
    body: <p>All content on this site, including The H.A.I.R. Wellness Method™, articles, and class materials, is the property of {business.legalName} and may not be reproduced without permission. Content is educational and does not create a practitioner–client relationship until services are booked.</p>,
  },
  { id: "refunds", t: "Products, classes & refunds", body: <p><Needs>Iisha to confirm refund/exchange policy for retail products, digital products, and class tickets</Needs></p> },
];

export default function PoliciesPage() {
  return (
    <>
      <PageHero crumbs={[{ name: "Policies", href: "/policies" }]} eyebrow="Terms & policies" title="Policies" lede={<p>Last updated October 2026.</p>} />
      <section className="bg-bone py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <nav aria-label="Policy sections" className="lg:col-span-3">
            <ul className="sticky top-28 space-y-2 text-[0.95rem]">
              {sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="text-plum-800 link-underline">{s.t}</a></li>)}
            </ul>
          </nav>
          <div className="space-y-12 lg:col-span-8 lg:col-start-5">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-28">
                <h2 className="font-display text-[1.9rem] text-plum-900">{s.t}</h2>
                <div className="mt-4 text-[1.05rem] leading-relaxed text-plum-800">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
