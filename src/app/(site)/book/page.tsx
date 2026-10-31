import type { Metadata } from "next";
import { Suspense } from "react";
import { Phone, Clock, ClipboardList, MessageCircle, Microscope } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { DiscoveryForm } from "@/components/forms/DiscoveryForm";
import { Disclaimer } from "@/components/sections/Disclaimer";
import { Btn } from "@/components/ui/Btn";
import { business, links } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Book a Free Hair Loss Discovery Call in Richmond, VA",
  description:
    "Request your complimentary 15-minute hair recovery discovery call with Iisha C. Silver. In studio in Henrico (Short Pump area), by phone, or by video. Openings typically 4–12 weeks out.",
  alternates: { canonical: "/book" },
};

const steps = [
  { i: MessageCircle, t: "Request your call", d: "Tell Iisha what's going on. It takes about 2 minutes." },
  { i: Phone, t: "15-minute discovery call", d: "Complimentary, compassionate, and no pressure. Decide together if a full consultation fits." },
  { i: Microscope, t: "Full consultation", d: "Microscopic scalp analysis, wellness assessment, and your personalized plan." },
];

export default function BookPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "Book", path: "/book" }]))} />
      <PageHero
        crumbs={[{ name: "Book", href: "/book" }]}
        eyebrow="Phase 1 · Complimentary discovery call"
        title={<>You don&apos;t have to do this <span className="italic-accent text-amethyst">alone.</span></>}
        lede={<p>Take the first step toward hair recovery. Request your free 15-minute discovery call and Iisha will reach out to confirm your time.</p>}
      />
      <section className="bg-bone py-16 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-12">
          <div className="order-2 lg:order-1 lg:col-span-4">
            <ol className="space-y-6">
              {steps.map((s, i) => (
                <li key={s.t} className="flex gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-plum-900 text-bone"><s.i className="h-5 w-5" aria-hidden="true" strokeWidth={1.25} /></span>
                  <div>
                    <p className="eyebrow text-amethyst">Step {i + 1}</p>
                    <p className="mt-1 font-display text-[1.35rem] text-plum-900">{s.t}</p>
                    <p className="mt-1 text-plum-700">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className="mt-10 space-y-3 rounded-card bg-mist p-6 text-[0.95rem] text-plum-800">
              <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-amethyst" aria-hidden="true" />{business.bookingNote}</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-amethyst" aria-hidden="true" />Prefer to call or text? <a href={business.phoneHref} className="font-medium underline decoration-amethyst/40 underline-offset-4">{business.phone}</a></p>
              <p className="flex items-start gap-2"><ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />Already had your discovery call? Complete the Phase 2 intake.</p>
              <Btn href={links.phase2Form} variant="outline">Phase 2 intake form</Btn>
            </div>
          </div>
          <div className="order-1 rounded-card border border-plum-800/10 bg-paper p-6 sm:p-10 lg:order-2 lg:col-span-8">
            <Suspense fallback={<p className="text-plum-700">Loading form…</p>}>
              <DiscoveryForm />
            </Suspense>
          </div>
        </div>
        <div className="container-x mt-14"><Disclaimer /></div>
      </section>
    </>
  );
}
