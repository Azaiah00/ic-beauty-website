import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Clock, Check, ShieldAlert } from "lucide-react";
import { img } from "@/lib/images";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { CTABand } from "@/components/sections/CTABand";
import { FAQList } from "@/components/sections/FAQList";
import { Disclaimer } from "@/components/sections/Disclaimer";
import { Btn } from "@/components/ui/Btn";
import { Needs } from "@/components/ui/Needs";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { GrowthCycle } from "@/components/motion/GrowthCycle";
import { clientOffers, familyClasses, askYourself, faqs, pillars } from "@/lib/content";
import { bookHref, business } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb, faqNode, serviceNode } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Hair Loss Recovery & Scalp Analysis in Richmond, VA",
  description:
    "Thinning, shedding, or tender edges? Start with a free 15-minute discovery call, then a microscopic scalp analysis and personalized hair recovery plan with Iisha C. Silver in Henrico / Richmond, VA. Virtual options available.",
  alternates: { canonical: "/client-programs" },
};

const redFlags = ["Sudden or patchy hair loss", "Smooth, shiny, or scarred skin where hair used to grow", "Pain, burning, or open sores on the scalp", "Crusting, pus, or spreading redness"];

export default function ClientProgramsPage() {
  const recoveryFaq = faqs[0].items;
  return (
    <>
      <JsonLd
        data={graph(
          breadcrumb([{ name: "Client Programs", path: "/client-programs" }]),
          serviceNode("Hair Loss Recovery Program", "Personalized hair recovery and scalp wellness program with microscopic scalp analysis, wellness assessment, and an inside-out plan.", "/client-programs"),
          faqNode(recoveryFaq, "/client-programs"),
        )}
      />
      <PageHero
        crumbs={[{ name: "Client Programs", href: "/client-programs" }]}
        eyebrow="Client Programs · Road to hair recovery"
        title={<>Struggling with hair loss? <span className="italic-accent text-amethyst">There is help.</span></>}
        lede={<p>Personalized hair wellness and self-care education for thinning, shedding, tender edges, and an unhappy scalp. We find what&apos;s happening beneath the surface, then build a plan made for you.</p>}
        image={{ src: img("consultation"), alt: "A smiling client during a hair and scalp consultation", label: "Consultation" }}
      >
        <Btn href={bookHref}>Book a free discovery call</Btn>
        <Btn href="/scalp-check" variant="outline">Scalp Self-Check</Btn>
      </PageHero>

      {/* Two steps */}
      <section className="bg-paper py-24 sm:py-32" aria-labelledby="start-title">
        <div className="container-x">
          <SectionHead id="start-title" eyebrow="Here's how to get started" title={<>Two simple steps <span className="italic-accent text-amethyst">to real answers.</span></>} lede="You never pay for more than you need. The discovery call tells us both whether a full consultation is the right next step." />
          <div className="mt-16 grid gap-6 lg:grid-cols-2">
            {clientOffers.slice(0, 2).map((o, i) => (
              <article key={o.id} className={`relative flex flex-col rounded-card p-9 sm:p-12 ${i === 0 ? "bg-plum-950 text-bone" : "border border-plum-800/12 bg-bone"}`} data-reveal>
                <div className="flex items-baseline justify-between">
                  <p className={`eyebrow ${i === 0 ? "text-brass-soft" : "text-amethyst"}`}>{o.kicker}</p>
                  <span className={`font-display text-[3.5rem] italic leading-none ${i === 0 ? "text-brass-soft" : "text-brass-deep"}`} aria-hidden="true">{i === 0 ? "I" : "II"}</span>
                </div>
                <h3 className={`mt-6 font-display text-[2.4rem] leading-[1.08] ${i === 0 ? "text-bone" : "text-plum-900"}`}>{o.name}</h3>
                <p className={`mt-4 flex-1 ${i === 0 ? "text-lilac" : "text-plum-700"}`}>{o.description}</p>
                <dl className={`mt-8 grid grid-cols-2 gap-6 border-t pt-6 ${i === 0 ? "border-lilac/15" : "border-plum-800/10"}`}>
                  <div>
                    <dt className={`eyebrow ${i === 0 ? "text-lilac" : "text-plum-700"}`}>Investment</dt>
                    <dd className="mt-2 font-display text-[1.7rem] leading-none">{o.price || <Needs tone={i === 0 ? "light" : "dark"}>Confirm price</Needs>}</dd>
                  </div>
                  <div>
                    <dt className={`eyebrow ${i === 0 ? "text-lilac" : "text-plum-700"}`}>Format</dt>
                    <dd className="mt-2 text-[0.95rem]">{o.duration}</dd>
                  </div>
                </dl>
                <div className="mt-9"><Btn href={o.cta.href} variant={i === 0 ? "light" : "primary"}>{o.cta.label}</Btn></div>
              </article>
            ))}
          </div>
          <div className="mt-14 grid items-center gap-10 lg:grid-cols-12" data-reveal>
            <p className="eyebrow text-brass-deep lg:col-span-3">Your personalized plan may include</p>
            <ul className="flex flex-wrap gap-2.5 lg:col-span-9">
              {[...pillars[2].includes, "& more"].map((x) => (
                <li key={x} className="inline-flex items-center gap-2 rounded-pill border border-plum-800/15 bg-bone px-4 py-2 text-[0.92rem] text-plum-900">
                  <Check className="h-3.5 w-3.5 text-amethyst" aria-hidden="true" strokeWidth={2} />
                  {x}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Ask yourself + refer out */}
      <section className="bg-bone py-24 sm:py-32" aria-labelledby="signs-title">
        <div className="container-x grid items-start gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHead id="signs-title" eyebrow="Ask yourself" title={<>Is your scalp <span className="italic-accent text-amethyst">asking for help?</span></>} />
            <ul className="mt-10 divide-y divide-plum-800/10 border-y border-plum-800/10">
              {askYourself.map((q) => (
                <li key={q} className="flex items-start gap-4 py-4 font-display text-[1.35rem] leading-snug text-plum-900" data-reveal>
                  <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
                  {q}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-plum-700" data-reveal>If you answered &ldquo;yes&rdquo; to any of these, a personalized consultation can provide the answers you&apos;ve been searching for.</p>
          </div>
          <div className="rounded-card border border-plum-800/12 bg-paper p-9 sm:p-11 lg:col-span-5 lg:col-start-8" data-reveal>
            <ShieldAlert className="h-7 w-7 text-amethyst" aria-hidden="true" strokeWidth={1.25} />
            <h3 className="mt-6 font-display text-[2.1rem] leading-tight text-plum-900">When we refer out</h3>
            <p className="mt-4 text-plum-700">Some hair loss has a medical cause and needs a physician first. If you notice any of the following, see a board-certified dermatologist. Iisha will tell you honestly when she sees signs that call for a referral, and she&apos;s happy to work alongside your doctor.</p>
            <ul className="mt-6 space-y-3">
              {redFlags.map((r) => (
                <li key={r} className="flex items-start gap-3 text-plum-900"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amethyst" aria-hidden="true" />{r}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Image band */}
      {img("scalp-ritual") && (
        <section className="relative h-[62vh] min-h-[24rem] overflow-hidden bg-plum-950" aria-label="Love on your scalp">
          <div className="absolute -inset-y-[10%] inset-x-0" data-parallax="10">
            <Image src={img("scalp-ritual")!} alt="A client relaxing during a scalp care ritual" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-plum-950/80 via-plum-950/35 to-transparent" />
          <div className="container-x relative flex h-full items-center">
            <p className="max-w-xl font-display text-[clamp(2.2rem,1.5rem+2.8vw,4.2rem)] leading-[1.04] text-bone" data-reveal>
              Love on your scalp. <span className="italic-accent text-brass-soft">Consider it self-care.</span>
            </p>
          </div>
        </section>
      )}

      {/* Ongoing support */}
      <section className="bg-paper py-24 sm:py-32" aria-labelledby="more-title">
        <div className="container-x">
          <SectionHead id="more-title" eyebrow="Ongoing support" title={<>Guided, <span className="italic-accent text-amethyst">not guessed.</span></>} lede="Consultation bookings open in waves, and Iisha takes on a limited number of new treatment-plan clients at a time." />
          <div className="mt-14 grid gap-px overflow-hidden rounded-card border border-plum-800/10 bg-plum-800/10 lg:grid-cols-3">
            {clientOffers.slice(2).map((o) => (
              <article key={o.id} className="flex flex-col bg-paper p-9" data-reveal="fade">
                <p className="eyebrow text-amethyst">{o.kicker}</p>
                <h3 className="mt-4 font-display text-[2rem] leading-tight text-plum-900">{o.name}</h3>
                <p className="mt-2 text-[0.88rem] text-plum-700">{o.audience}</p>
                <p className="mt-4 flex-1 text-plum-700">{o.description}</p>
                <p className="mt-7 font-display text-[1.6rem] text-plum-900">{o.price || <Needs>Confirm price</Needs>}</p>
                <div className="mt-6"><Btn href={o.cta.href} variant="outline">{o.cta.label}</Btn></div>
              </article>
            ))}
          </div>
          <p className="mt-6 flex items-center gap-2 text-[0.92rem] text-plum-700"><Clock className="h-4 w-4 text-amethyst" aria-hidden="true" strokeWidth={1.5} />{business.bookingNote}</p>
        </div>
      </section>

      {/* Growth cycle */}
      <section className="bg-mist py-24 sm:py-32" aria-labelledby="cycle-title">
        <div className="container-x">
          <SectionHead id="cycle-title" eyebrow="Understand your hair" title={<>Why recovery takes <span className="italic-accent text-amethyst">months, not days.</span></>} lede="Every strand runs on its own cycle. Once you understand it, the timeline makes sense, and patience gets easier." />
          <div className="mt-14"><GrowthCycle /></div>
        </div>
      </section>

      {/* Family classes */}
      <section id="classes" className="scroll-mt-24 bg-bone py-24 sm:py-32" aria-labelledby="family-title">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <SectionHead id="family-title" eyebrow="Hands-on classes for families" title={<>Teach a man to fish, <span className="italic-accent text-amethyst">he eats for life.</span></>} lede="Every class includes take-home material and a product kit so you can put your new skills to use right away." />
              <div className="mt-9" data-reveal><Btn href="/book?type=class">Request a class seat</Btn></div>
              <div className="mt-12">
                <PhotoSlot src={img("parent-child")} shape="arch" ratio="aspect-[4/5]" label="Parent and child wash day" alt="A mother gently detangling her daughter's natural coily hair" />
              </div>
            </div>
          </div>
          <div className="divide-y divide-plum-800/10 lg:col-span-6 lg:col-start-7">
            {familyClasses.map((c, i) => (
              <article key={c.name} className="py-10 first:pt-0" data-reveal>
                <p className="font-display text-[1.1rem] italic text-brass-deep">Class {["I", "II", "III"][i]}</p>
                <h3 className="mt-2 font-display text-[2.3rem] leading-tight text-plum-900">{c.name}</h3>
                <p className="mt-4 text-plum-700">{c.blurb}</p>
                <ul className="mt-6 flex flex-wrap gap-2">
                  {c.learn.map((l) => (
                    <li key={l} className="rounded-pill border border-plum-800/15 px-3.5 py-1.5 text-[0.86rem] text-plum-800">{l}</li>
                  ))}
                </ul>
                <p className="mt-6"><Needs>Confirm price + next date</Needs></p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-paper py-24 sm:py-32" aria-labelledby="cfaq-title">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHead id="cfaq-title" eyebrow="Hair recovery FAQ" title="Honest answers" />
            <a href="https://form.jotform.com/232350414294046" target="_blank" rel="noopener noreferrer" className="link-underline mt-8 inline-flex items-center gap-2 font-sans text-[0.75rem] font-medium uppercase tracking-[0.14em] text-amethyst" data-reveal>
              Phase 2 intake form <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} />
            </a>
          </div>
          <div className="lg:col-span-8">
            <FAQList items={recoveryFaq} />
            <div className="mt-10"><Disclaimer /></div>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
