import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Phone, Clock, CalendarCheck, Sparkles, ClipboardList, ListChecks } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";
import { DiscoveryForm } from "@/components/forms/DiscoveryForm";
import { SquareBooking } from "@/components/forms/SquareBooking";
import { Disclaimer } from "@/components/sections/Disclaimer";
import { business, links } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Book with Iisha: Free Discovery Call & Hair Wellness Services in Richmond, VA",
  description:
    "Book online with Iisha C. Silver in Henrico (Richmond), VA. New clients start with a free Phase 1 call. Hair recovery consultations, maintenance visits, education sessions and more. Virtual options available.",
  alternates: { canonical: "/book" },
};

const steps = [
  { i: Phone, t: "New here? Start with the free Phase 1 call", d: "A complimentary 15-minute call. Iisha listens, asks the right questions and tells you honestly what she sees." },
  { i: CalendarCheck, t: "Pick a time that works", d: "Choose your service and time below. Your appointment goes straight onto Iisha's calendar." },
  { i: ClipboardList, t: "Share a little about your hair", d: "New clients: take two minutes to answer a few questions so Iisha is ready for your call." },
];

export default async function BookPage({ searchParams }: { searchParams: Promise<{ type?: string; profile?: string; service?: string }> }) {
  const { type, profile, service } = await searchParams;
  const classRequest = type === "class";
  const phase1 = service === "phase-1";
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "Book", path: "/book" }]))} />
      <PageHero
        crumbs={[{ name: "Book", href: "/book" }]}
        eyebrow={classRequest ? "Family & parent classes" : "Book with Iisha"}
        title={<>You don&apos;t have to do this <span className="italic-accent text-amethyst">alone.</span></>}
        lede={<p>Whether you&apos;re noticing thinning, dealing with an unhappy scalp or simply want to keep healthy hair healthy, new clients start with a free 15-minute Phase 1 call. Virtual options available.</p>}
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
              <p className="flex items-start gap-2"><ClipboardList className="mt-0.5 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" /><span>New client? <a href={links.discoveryForm} target="_blank" rel="noopener noreferrer" className="font-medium underline decoration-amethyst/40 underline-offset-4">Answer Iisha&apos;s quick questions</a> before your call.</span></p>
            </div>
          </div>
          <div className="order-1 rounded-card border border-plum-800/10 bg-paper p-3 sm:p-8 lg:order-2 lg:col-span-8">
            {classRequest ? (
              <Suspense fallback={<p className="text-plum-700">Loading form…</p>}>
                <DiscoveryForm />
              </Suspense>
            ) : (
              <>
                {profile && (
                  <p className="mb-5 flex items-start gap-2 rounded-xl bg-mist px-4 py-3 text-[0.95rem] text-plum-800">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
                    <span>Your Scalp Self-Check result: <strong>{profile.slice(0, 80)}</strong>. Mention it on your call so Iisha can start right where you are.</span>
                  </p>
                )}
                <div className="mb-4 flex flex-wrap gap-2">
                  <Link href="/book?service=phase-1" className={`inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-[0.78rem] font-medium uppercase tracking-[0.12em] ${phase1 ? "bg-plum-900 text-bone" : "border border-plum-800/20 text-plum-900 hover:border-plum-800/50"}`}>
                    <Phone className="h-4 w-4" aria-hidden="true" /> Free Phase 1 call
                  </Link>
                  <Link href="/book" className={`inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-[0.78rem] font-medium uppercase tracking-[0.12em] ${!phase1 ? "bg-plum-900 text-bone" : "border border-plum-800/20 text-plum-900 hover:border-plum-800/50"}`}>
                    <ListChecks className="h-4 w-4" aria-hidden="true" /> All services
                  </Link>
                </div>
                <SquareBooking key={phase1 ? "p1" : "all"} src={phase1 ? links.squareDiscoveryCall : links.squareBooking} title="Book an appointment with Iisha (Square Appointments)" />
              </>
            )}
          </div>
        </div>
        <div className="container-x mt-14"><Disclaimer /></div>
      </section>
    </>
  );
}
