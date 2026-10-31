import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { img } from "@/lib/images";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { MethodSteps } from "@/components/sections/MethodSteps";
import { CTABand } from "@/components/sections/CTABand";
import { Disclaimer } from "@/components/sections/Disclaimer";
import { Btn } from "@/components/ui/Btn";
import { Needs } from "@/components/ui/Needs";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { pillars } from "@/lib/content";
import { METHOD_DEFINITION, bookHref } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb, faqNode } from "@/lib/schema";

export const metadata: Metadata = {
  title: "The H.A.I.R. Wellness Method™: Healthy Awareness Is Rare",
  description:
    "The H.A.I.R. Wellness Method™ is Iisha C. Silver's four-phase approach to understanding, maintaining, and teaching healthy hair practices: History, Analysis, Inside-out plan, Restore & retain.",
  alternates: { canonical: "/the-hair-method" },
};

const methodFaq = [
  { q: "What does H.A.I.R. stand for?", a: "H.A.I.R. stands for Healthy Awareness Is Rare. Its four phases are History, Analysis, Inside-out plan, and Restore & retain." },
  { q: "Who created the H.A.I.R. Wellness Method?", a: "The H.A.I.R. Wellness Method™ was created by Iisha C. Silver, holistic hair recovery practitioner, educator, and founder of I.C. Beauty LLC in Henrico (Richmond), Virginia." },
  { q: "Is the H.A.I.R. Method a medical treatment?", a: "No. It is a hair-wellness and education framework. It does not diagnose or treat medical conditions, and clients who show signs of a medical cause are referred to a board-certified dermatologist." },
];

const differences = [
  { old: "Treats only the strand you can see", now: "Looks beneath the surface at the scalp, the body, and your history" },
  { old: "One product for everyone", now: "A personalized plan built around your hair, your body, and your budget" },
  { old: "You leave dependent on the salon", now: "You leave knowing how to care for your crown yourself" },
  { old: "Shame and guessing", now: "Compassion, education, and progress you can see" },
];

const rooms = [
  { t: "For clients", d: "The full H.A.I.R. experience: discovery call, microscopic scalp analysis, personalized plan, and progress check-ins.", href: "/client-programs", c: "Client Programs", image: "consultation" },
  { t: "For stylists", d: "Bring wellness-first awareness into your chair: spot early signs, have the conversation with care, and know when to refer out.", href: "/professional-education", c: "Professional Education", image: "classroom" },
  { t: "For organizations", d: "Keynotes and workshops that turn hair into a wellness conversation for HBCUs, sororities, churches, and professional audiences.", href: "/speaking", c: "Speaking & Workshops", image: "speaker" },
];

export default function MethodPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "The H.A.I.R. Method", path: "/the-hair-method" }]), faqNode(methodFaq, "/the-hair-method"))} />
      <PageHero
        crumbs={[{ name: "The H.A.I.R. Method", href: "/the-hair-method" }]}
        eyebrow="Signature intellectual property"
        title={
          <>
            The H.A.I.R. <span className="italic-accent text-amethyst">Wellness</span> Method<sup className="ml-1 align-super text-[0.3em] tracking-normal">™</sup>
          </>
        }
        lede={<p>{METHOD_DEFINITION}</p>}
        image={{ src: img("scalp-closeup"), alt: "A practitioner gently parting healthy coily hair to examine the scalp", label: "Scalp analysis" }}
      >
        <Btn href={bookHref}>Experience it</Btn>
        <Btn href="#phases" variant="outline">The four phases</Btn>
      </PageHero>

      <section className="bg-paper py-24 sm:py-32" aria-labelledby="why-title">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHead id="why-title" eyebrow="Why awareness is rare" title={<>Most of us only notice our hair <span className="italic-accent text-amethyst">when something goes wrong.</span></>} />
            <div className="mt-8 space-y-5 text-[1.08rem] text-plum-700" data-reveal>
              <p>Trichology looks beneath the surface. Internal imbalances, lifestyle, and emotional stress can quietly contribute to thinning, shedding, or scalp discomfort long before anyone connects the dots.</p>
              <p>The H.A.I.R. Wellness Method is a new approach to understanding, maintaining, and teaching healthy hair practices. It gives you the awareness to notice early, the understanding to know why, and the confidence to care for your crown for life.</p>
            </div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="eyebrow text-brass-deep" data-reveal>A different standard</p>
            <ul className="mt-5 divide-y divide-plum-800/10 border-y border-plum-800/10">
              {differences.map((d) => (
                <li key={d.now} className="py-5" data-reveal>
                  <p className="text-[0.92rem] text-plum-700 line-through decoration-brass/60">{d.old}</p>
                  <p className="mt-1.5 flex items-start gap-2.5 font-display text-[1.35rem] leading-snug text-plum-900">
                    <Check className="mt-1.5 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" strokeWidth={2} />
                    {d.now}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="phases" className="scroll-mt-24 bg-plum-950 py-24 text-bone sm:py-32" aria-labelledby="phases-title">
        <div className="container-x">
          <div className="mb-16">
            <SectionHead tone="dark" id="phases-title" eyebrow="The four phases" title={<>History. Analysis. Inside-out. <span className="italic-accent text-brass-soft">Restore.</span></>} />
            <p className="mt-5" data-reveal><Needs tone="light">Draft phase names · Iisha to confirm</Needs></p>
          </div>
          <MethodSteps pillars={pillars} tone="dark" image={{ src: img("consultation"), alt: "A client during her hair and scalp consultation", label: "Consultation" }} />
          <p className="mt-16 text-center font-display text-[clamp(1.8rem,1.3rem+1.8vw,3rem)] italic text-lilac" data-reveal>
            Embrace <span className="text-brass-soft">·</span> Understand <span className="text-brass-soft">·</span> Confidently Care
          </p>
        </div>
      </section>

      <section className="bg-bone py-24 sm:py-32" aria-labelledby="ways-title">
        <div className="container-x">
          <SectionHead id="ways-title" align="center" eyebrow="One method · three rooms" title={<>Experience it, teach it, <span className="italic-accent text-amethyst">or bring it to your people.</span></>} />
          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {rooms.map((w) => (
              <Link key={w.t} href={w.href} className="group block">
                <PhotoSlot src={img(w.image)} alt={w.c} label={w.c} shape="arch" ratio="aspect-[4/5]" sizes="(min-width: 1024px) 30vw, 100vw" />
                <div className="mt-7" data-reveal>
                  <h3 className="font-display text-[2rem] text-plum-900 group-hover:text-amethyst">{w.t}</h3>
                  <p className="mt-3 text-plum-700">{w.d}</p>
                  <span className="mt-5 inline-flex items-center gap-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900">{w.c} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" strokeWidth={1.5} /></span>
                </div>
              </Link>
            ))}
          </div>
          <div className="mx-auto mt-24 max-w-3xl">
            <SectionHead align="center" eyebrow="Quick answers" title="About the method" />
            <div className="mt-10 divide-y divide-plum-800/10 border-y border-plum-800/10">
              {methodFaq.map((f) => (
                <div key={f.q} className="py-6" data-reveal>
                  <h3 className="font-display text-[1.6rem] text-plum-900">{f.q}</h3>
                  <p className="mt-2 text-plum-700">{f.a}</p>
                </div>
              ))}
            </div>
            <div className="mt-10"><Disclaimer /></div>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
