import type { Metadata } from "next";
import Image from "next/image";
import { Check, Download, Mic2, Users, Video, Clock } from "lucide-react";
import { img } from "@/lib/images";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { Btn } from "@/components/ui/Btn";
import { Needs } from "@/components/ui/Needs";
import { Marquee } from "@/components/motion/Marquee";
import { ICMark } from "@/components/brand/ICMark";
import { SpeakingForm } from "@/components/forms/SpeakingForm";
import { talks, audiences } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb, serviceNode } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Hair Wellness Speaker for HBCUs & Organizations",
  description:
    "Keynotes and workshops on hair wellness, hair loss awareness in Black women, and turning consultations into currency. Book Iisha C. Silver, creator of The H.A.I.R. Wellness Method™, for HBCUs, sororities, churches, and professional audiences.",
  alternates: { canonical: "/speaking" },
};

const reasons = [
  { t: "She's lived it behind the chair", d: "Years of hands-on cosmetology, color, and hair recovery work. Every talk is grounded in real clients, not theory." },
  { t: "Warm, direct, culturally fluent", d: "Iisha talks to Black women about their crowns the way a trusted sister would: honest, funny, and caring." },
  { t: "Your audience leaves with a plan", d: "Every session ends with simple, specific habits people can start that week, plus a resource your organization can share." },
  { t: "A framework people remember", d: "The H.A.I.R. Wellness Method gives your audience language they'll repeat long after the event." },
];

export default function SpeakingPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "Speaking & Workshops", path: "/speaking" }]), serviceNode("Hair wellness keynotes and workshops", "Keynotes, workshops, and panels on hair wellness, hair loss awareness, children's natural hair care, and stylist consultation skills.", "/speaking"))} />
      <PageHero
        crumbs={[{ name: "Speaking & Workshops", href: "/speaking" }]}
        eyebrow="Speaking & Workshops"
        title={<>Your crown is a <span className="italic-accent text-amethyst">health conversation.</span></>}
        lede={<p>Keynotes and hands-on workshops for organizations, HBCUs, and professional audiences, led by Iisha C. Silver, educator, hair and scalp specialist, and creator of The H.A.I.R. Wellness Method™.</p>}
        image={{ src: img("iisha-speaking") ?? img("iisha-portrait"), alt: "Iisha C. Silver, speaker and educator", label: "Iisha speaking", position: "55% 25%" }}
      >
        <Btn href="#inquire">Check availability</Btn>
        <Btn href="#talks" variant="outline">Signature talks</Btn>
      </PageHero>

      <div className="border-y border-plum-800/10 bg-paper py-6 font-display text-[1.8rem] italic text-plum-800">
        <Marquee items={audiences} separator={<ICMark className="h-5 w-auto text-brass" title="" />} />
      </div>

      <section id="talks" className="scroll-mt-24 bg-bone py-24 sm:py-32" aria-labelledby="talks-title">
        <div className="container-x">
          <SectionHead id="talks-title" eyebrow="Signature talks" title={<>Four talks. <span className="italic-accent text-amethyst">Tailored to your room.</span></>} lede="Each one can be a 45–60 minute keynote, a 90–180 minute hands-on workshop, a panel, or a virtual session." />
          <div className="mt-16 divide-y divide-plum-800/10 border-y border-plum-800/10">
            {talks.map((t, i) => (
              <article key={t.title} className="grid gap-6 py-10 lg:grid-cols-12" data-reveal>
                <span className="font-display text-[1.2rem] italic text-brass-deep lg:col-span-1">{["I", "II", "III", "IV"][i]}.</span>
                <div className="lg:col-span-5">
                  <h3 className="font-display text-[2.4rem] leading-[1.05] text-plum-900">{t.title}</h3>
                  <p className="mt-2 font-display text-[1.3rem] italic text-amethyst">{t.sub}</p>
                  <p className="eyebrow mt-4 text-plum-700">Best for: {t.audience}</p>
                </div>
                <ul className="space-y-2.5 lg:col-span-5 lg:col-start-8">
                  {t.takeaways.map((k) => (
                    <li key={k} className="flex items-start gap-2.5 text-plum-800">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" strokeWidth={2} />
                      {k}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              { i: Mic2, t: "Keynote", d: "45–60 minutes" },
              { i: Users, t: "Hands-on workshop", d: "90–180 minutes" },
              { i: Video, t: "Virtual session", d: "Anywhere, live Q&A" },
            ].map((f) => (
              <div key={f.t} className="flex items-center gap-4 rounded-card bg-mist p-6" data-reveal>
                <f.i className="h-6 w-6 text-amethyst" aria-hidden="true" strokeWidth={1.25} />
                <div>
                  <p className="font-display text-[1.35rem] text-plum-900">{f.t}</p>
                  <p className="text-[0.9rem] text-plum-700">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {img("speaker") && (
        <section className="relative h-[60vh] min-h-[22rem] overflow-hidden bg-plum-950" aria-hidden="true">
          <div className="absolute -inset-y-[10%] inset-x-0" data-parallax="10">
            <Image src={img("speaker")!} alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-plum-950/30" />
        </section>
      )}

      <section className="bg-plum-950 py-24 text-bone sm:py-32" aria-labelledby="reasons-title">
        <div className="container-x">
          <SectionHead tone="dark" id="reasons-title" eyebrow="Why organizers book Iisha" title={<>Resilience with receipts. <span className="italic-accent text-brass-soft">Content with care.</span></>} />
          <div className="mt-16 grid gap-x-16 gap-y-12 md:grid-cols-2">
            {reasons.map((r, i) => (
              <div key={r.t} className="border-t border-lilac/15 pt-8" data-reveal>
                <span className="font-display text-[1.2rem] italic text-brass-soft">{["I", "II", "III", "IV"][i]}.</span>
                <h3 className="mt-3 font-display text-[2rem] leading-tight">{r.t}</h3>
                <p className="mt-3 text-lilac">{r.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 grid gap-4 md:grid-cols-2">
            <div className="flex flex-col justify-between gap-4 rounded-card border border-lilac/15 p-8" data-reveal>
              <p className="eyebrow text-brass-soft">Hosted by</p>
              <p className="text-lilac">Logos of past host organizations will appear here.</p>
              <Needs tone="light">Host logos + 2 organizer quotes</Needs>
            </div>
            <div className="flex flex-col justify-between gap-4 rounded-card bg-plum-900 p-8" data-reveal>
              <p className="flex items-center gap-3 font-display text-[1.8rem]"><Download className="h-6 w-6 text-brass-soft" aria-hidden="true" strokeWidth={1.25} />Speaker one-sheet</p>
              <p className="text-lilac">Bio, headshot, talk descriptions, and tech needs. Forward it to your committee.</p>
              <Needs tone="light">One-sheet PDF owed</Needs>
            </div>
          </div>
        </div>
      </section>

      <section id="inquire" className="scroll-mt-24 bg-bone py-24 sm:py-32" aria-labelledby="inq-title">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead id="inq-title" eyebrow="Speaking inquiry" title={<>Bring healthy awareness <span className="italic-accent text-amethyst">to your audience.</span></>} />
            <p className="mt-8 flex items-center gap-2 text-plum-700" data-reveal><Clock className="h-4 w-4 text-amethyst" aria-hidden="true" strokeWidth={1.5} />Replies within 3 business days.</p>
            <p className="mt-2 text-[0.92rem] text-plum-700" data-reveal>Community, church, and nonprofit rates available on request.</p>
          </div>
          <div className="rounded-card border border-plum-800/10 bg-paper p-7 sm:p-11 lg:col-span-8" data-reveal>
            <SpeakingForm />
          </div>
        </div>
      </section>
    </>
  );
}
