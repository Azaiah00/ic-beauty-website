import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ArrowRight, MapPin, Clock, Phone } from "lucide-react";
import { img } from "@/lib/images";
import { Btn } from "@/components/ui/Btn";
import { Marquee } from "@/components/motion/Marquee";
import { ICMark } from "@/components/brand/ICMark";
import { SectionHead } from "@/components/sections/SectionHead";
import { MethodSteps } from "@/components/sections/MethodSteps";
import { CTABand } from "@/components/sections/CTABand";
import { FAQList } from "@/components/sections/FAQList";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Needs } from "@/components/ui/Needs";
import { pillars, askYourself, hubItems, faqs, testimonialsPlaceholder } from "@/lib/content";
import { articles } from "@/lib/articles";
import { business, bookHref, formatHour, METHOD_DEFINITION } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, faqNode } from "@/lib/schema";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const arms = [
  {
    n: "I",
    title: "Client Programs",
    sub: "Personalized hair wellness & self-care education",
    body: "Thinning, shedding, tender edges, an unhappy scalp. Begin with a complimentary discovery call, then a microscopic scalp analysis and a plan built from the inside out.",
    href: "/client-programs",
    cta: "Explore client programs",
    image: "scalp-ritual",
    alt: "A client relaxing during a scalp care ritual at the shampoo bowl",
  },
  {
    n: "II",
    title: "Professional Education",
    sub: "For stylists ready to elevate the chair",
    body: "Mastering the Consultation, Color with Confidence, and the H.A.I.R. Method for stylists. Turn your consultations into currency.",
    href: "/professional-education",
    cta: "See classes for stylists",
    image: "classroom",
    alt: "Stylists practicing sectioning on natural hair during a class",
  },
  {
    n: "III",
    title: "Speaking & Workshops",
    sub: "Organizations, HBCUs & professional audiences",
    body: "Keynotes and hands-on workshops that make hair a wellness conversation and leave your audience with healthy awareness.",
    href: "/speaking",
    cta: "Book Iisha to speak",
    image: "speaker",
    alt: "An engaged audience at a hair wellness talk",
  },
];

export default function HomePage() {
  const homeFaqs = faqs[0].items.slice(0, 4).concat(faqs[1].items.slice(0, 1));
  const featured = hubItems.filter((h) => ["Radiance Rewired", "Hair Health Checklist", "It's a WIN WIN Membership"].includes(h.name));
  return (
    <>
      <JsonLd data={graph(faqNode(homeFaqs, "/"))} />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-bone">
        <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[38%] bg-mist lg:block" />
        <div className="container-x relative grid items-center gap-14 pb-20 pt-32 lg:min-h-[100svh] lg:grid-cols-12 lg:gap-10 lg:pb-14 lg:pt-32">
          <div className="lg:col-span-6">
            <p className="eyebrow flex items-center gap-4 text-amethyst rise" style={{ ["--d" as string]: 1 }}>
              <span className="h-px w-10 bg-brass" aria-hidden="true" />
              Hair loss & scalp wellness · Richmond, VA
            </p>
            <h1 className="mt-7 text-[clamp(3.1rem,1.7rem+4.6vw,6.4rem)] leading-[0.98] text-plum-900 rise" style={{ ["--d" as string]: 2 }}>
              Where hair, health <span className="italic-accent text-amethyst">&amp; education</span> connect.
            </h1>
            <p className="mt-8 max-w-xl text-lede text-plum-700 rise" style={{ ["--d" as string]: 3 }}>
              I&apos;m Iisha C. Silver, hair and scalp specialist, educator, and creator of <span className="text-plum-900">The H.A.I.R. Wellness Method™</span>. I help you understand what your scalp has been trying to tell you, then teach you to care for it with confidence.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 rise" style={{ ["--d" as string]: 4 }}>
              <Btn href={bookHref} size="lg">Book a free discovery call</Btn>
              <Btn href="/scalp-check" variant="outline" size="lg">Take the Scalp Self-Check</Btn>
            </div>
            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-plum-800/10 pt-8 rise" style={{ ["--d" as string]: 5 }}>
              {[
                ["15 min", "Complimentary discovery call"],
                ["Microscopic", "Scalp & wellness analysis"],
                ["In studio", "or virtual, anywhere"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="font-display text-[1.7rem] leading-none text-plum-900">{k}</dt>
                  <dd className="mt-2 text-[0.82rem] leading-snug text-plum-700">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative mx-auto w-full max-w-[26rem] lg:col-span-5 lg:col-start-8 lg:max-w-[min(30rem,62svh)]">
            <div aria-hidden="true" className="arch absolute -right-4 top-6 -bottom-4 left-4 border border-brass/60" />
            <PhotoSlot
              src={img("iisha-portrait")}
              alt="Iisha C. Silver, hair and scalp specialist and founder of I.C. Beauty, in her white coat in front of the I.C. Beauty logo"
              label="Signature portrait of Iisha"
              shape="arch"
              ratio="aspect-[4/5]"
              priority
              position="50% 18%"
              sizes="(min-width: 1024px) 40vw, 100vw"
            />
            <div className="absolute -bottom-8 -left-2 max-w-[17rem] rounded-card bg-paper/95 p-5 shadow-[0_24px_60px_-30px_rgba(58,29,69,0.45)] backdrop-blur sm:-left-10 rise" style={{ ["--d" as string]: 6 }}>
              <p className="font-display text-[1.35rem] leading-tight text-plum-900">Iisha C. Silver</p>
              <p className="mt-1 text-[0.8rem] leading-snug text-plum-700">Hair & Scalp Specialist · Educator · Speaker</p>
              <p className="mt-3 border-t border-plum-800/10 pt-3 text-[0.78rem] italic text-amethyst">Creator of The H.A.I.R. Wellness Method™</p>
            </div>
          </div>
        </div>
      </section>

      {/* Motto marquee */}
      <div className="border-y border-plum-800/10 bg-paper py-6 font-display text-[clamp(1.6rem,1.1rem+1.6vw,2.6rem)] italic text-plum-800">
        <Marquee
          items={["I.C. Beauty", "I.C. Success", "I.C. You", "Healthy Awareness Is Rare", "Embrace", "Understand", "Confidently Care"]}
          separator={<ICMark className="h-6 w-auto text-brass" title="" />}
        />
      </div>

      {/* ============ PROBLEM ============ */}
      <section className="bg-bone py-24 sm:py-36" aria-labelledby="ask-title">
        <div className="container-x grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <PhotoSlot src={img("consultation")} alt="A smiling client during a hair and scalp consultation in the studio" label="Consultation in the studio" ratio="aspect-[4/5]" parallax={6} />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <SectionHead
              id="ask-title"
              eyebrow="You're not alone"
              title={<>Hair loss can feel like <span className="italic-accent text-amethyst">an emotional rollercoaster.</span></>}
              lede="On the days my hair looked good, I felt good. When it starts thinning, it takes your confidence with it. With proper guidance, healing is possible."
            />
            <p className="eyebrow mt-12 text-brass-deep" data-reveal>Ask yourself</p>
            <ul className="mt-4 divide-y divide-plum-800/10 border-y border-plum-800/10">
              {askYourself.map((q) => (
                <li key={q} className="flex gap-5 py-4" data-reveal>
                  <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-brass" aria-hidden="true" />
                  <p className="font-display text-[1.35rem] leading-snug text-plum-900">{q}</p>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-6" data-reveal>
              <Btn href={bookHref}>Book your discovery call</Btn>
              <Btn href="/client-programs" variant="text">How hair recovery works</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* ============ THREE PATHS ============ */}
      <section className="bg-paper py-24 sm:py-36" aria-labelledby="paths-title">
        <div className="container-x">
          <SectionHead
            id="paths-title"
            align="center"
            eyebrow="One method · three paths"
            title={<>The H.A.I.R. Wellness Method, <span className="italic-accent text-amethyst">for you, your chair, and your community.</span></>}
            lede={METHOD_DEFINITION}
          />
          <div className="mt-20 grid gap-10 lg:grid-cols-3 lg:gap-8">
            {arms.map((a, i) => (
              <Link key={a.title} href={a.href} className={`group block ${i === 1 ? "lg:mt-16" : ""}`}>
                <PhotoSlot src={img(a.image)} alt={a.alt} label={a.title} shape="arch" ratio="aspect-[4/5]" sizes="(min-width: 1024px) 30vw, 100vw" />
                <div className="mt-8" data-reveal>
                  <p className="font-display text-[1.1rem] italic text-brass-deep">{a.n}.</p>
                  <h3 className="mt-1 font-display text-[2.3rem] leading-tight text-plum-900 transition-colors group-hover:text-amethyst">{a.title}</h3>
                  <p className="eyebrow mt-2 text-amethyst">{a.sub}</p>
                  <p className="mt-4 text-plum-700">{a.body}</p>
                  <span className="mt-6 inline-flex items-center gap-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900">
                    {a.cta}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true" strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ THE METHOD ============ */}
      <section className="bg-plum-950 py-24 text-bone sm:py-36" aria-labelledby="method-title">
        <div className="container-x">
          <div className="mb-16 flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead
              tone="dark"
              id="method-title"
              eyebrow="Signature method"
              title={<>Healthy <span className="italic-accent text-brass-soft">Awareness</span> Is Rare.</>}
              lede="Your hair loss didn't happen overnight, and it won't regrow overnight. Four guided phases take you from questions to confident care."
            />
            <div data-reveal><Btn href="/the-hair-method" variant="outline-light">Explore the method</Btn></div>
          </div>
          <MethodSteps
            pillars={pillars}
            tone="dark"
            image={{ src: img("scalp-closeup"), alt: "Hands gently parting healthy coily hair to show the scalp", label: "Scalp analysis detail" }}
          />
          <p className="mt-16 text-center font-display text-[clamp(1.8rem,1.3rem+1.8vw,3rem)] italic text-lilac" data-reveal>
            Embrace <span className="text-brass-soft">·</span> Understand <span className="text-brass-soft">·</span> Confidently Care
          </p>
        </div>
      </section>

      {/* ============ MEET IISHA ============ */}
      <section className="bg-bone py-24 sm:py-36" aria-labelledby="meet-title">
        <div className="container-x grid items-center gap-16 lg:grid-cols-12">
          <div className="relative order-2 lg:order-1 lg:col-span-5">
            <PhotoSlot src={img("iisha-portrait")} alt="Iisha C. Silver smiling, holding a notepad in her white coat" label="Iisha in the studio" ratio="aspect-[4/5]" position="60% 40%" parallax={6} />
            <div className="absolute -right-4 -top-6 hidden h-28 w-28 items-center justify-center rounded-full bg-plum-900 text-center text-bone shadow-xl sm:flex lg:-right-8">
              <span className="font-display text-[0.95rem] italic leading-tight">Brooklyn<br />roots</span>
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-6 lg:col-start-7">
            <SectionHead id="meet-title" eyebrow="Meet Iisha · Founder of I.C. Beauty" title={<>Brooklyn roots. <span className="italic-accent text-amethyst">Richmond crown care.</span></>} />
            <div className="mt-8 space-y-5 text-[1.08rem] text-plum-700" data-reveal>
              <p>My roots trace back to Brooklyn, NY, where my love for hair was sparked at an early age. Growing up, entrepreneurship wasn&apos;t something that was nurtured. But passion? That came naturally.</p>
              <p>Today I bring together cosmetology, trichology, sound therapy, and holistic wellness to teach women (and a few men) how to love on their scalps and care for their hair. Everyone has a story. My mission is to help you show up looking your best while living, writing, and owning yours.</p>
            </div>
            <blockquote className="mt-10 border-l-2 border-brass pl-6 font-display text-[1.7rem] italic leading-snug text-plum-900" data-reveal>
              &ldquo;Teaching a man to fish will always be more valuable than a fish dinner.&rdquo;
              <footer className="mt-3 font-sans text-[0.72rem] font-medium uppercase not-italic tracking-[0.2em] text-amethyst">Iisha C. Silver</footer>
            </blockquote>
            <div className="mt-10" data-reveal><Btn href="/about">Read Iisha&apos;s story</Btn></div>
          </div>
        </div>
      </section>

      {/* ============ PROOF ============ */}
      <section className="bg-paper py-24 sm:py-36" aria-labelledby="proof-title">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead
              id="proof-title"
              eyebrow="Resilience with receipts"
              title={<>Recovery is a journey. <span className="italic-accent text-amethyst">Every step, documented.</span></>}
              lede="Progress photos at every check-in, shared only with permission, so you can see the change for yourself."
            />
            <div data-reveal><Needs>Client-consented progress photos</Needs></div>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {["Week 1", "Week 8", "Month 6", "Year 1"].map((w, wi) => (
              <div key={w}>
                <PhotoSlot src={img(`progress-${wi + 1}`)} ratio="aspect-square" label={`Client progress, ${w}`} alt={`Client hair recovery progress, ${w}`} />
                <p className="eyebrow mt-3 text-amethyst">{w}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[0.82rem] text-plum-700">Individual results vary. Photos shared with each client&apos;s written permission.</p>
          <div className="mt-20 grid gap-10 lg:grid-cols-3">
            {testimonialsPlaceholder.map((t) => (
              <figure key={t.detail} className="border-t border-plum-800/15 pt-8" data-reveal>
                <span className="font-display text-5xl leading-none text-brass" aria-hidden="true">&ldquo;</span>
                <blockquote className="mt-2 font-display text-[1.35rem] italic leading-snug text-plum-900/70">{t.quote}</blockquote>
                <figcaption className="eyebrow mt-6 text-plum-700">{t.name} · {t.detail}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ============ THE HUB ============ */}
      <section className="bg-bone py-24 sm:py-36" aria-labelledby="hub-title">
        <div className="container-x grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHead
              id="hub-title"
              eyebrow="The Hub"
              title={<>Everything for your journey, <span className="italic-accent text-amethyst">in one place.</span></>}
              lede="Iisha's guides, the membership, supplements, tools, and professional haircare, all thoughtfully curated so you keep growing between visits."
            />
            <ul className="mt-10 divide-y divide-plum-800/10 border-y border-plum-800/10">
              {featured.map((h) => (
                <li key={h.name} data-reveal>
                  <a href={h.href} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-6 py-5">
                    <span>
                      <span className="eyebrow text-amethyst">{h.type}</span>
                      <span className="mt-1 block font-display text-[1.6rem] leading-tight text-plum-900 group-hover:text-amethyst">{h.name}</span>
                    </span>
                    <span className="flex items-center gap-4">
                      <span className="font-display text-xl text-plum-700">{h.price}</span>
                      <ArrowUpRight className="h-4 w-4 text-plum-900" aria-hidden="true" strokeWidth={1.5} />
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-10" data-reveal><Btn href="/hub">Visit The Hub</Btn></div>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <PhotoSlot src={img("product-shelf")} alt="Curated haircare and scalp-care tools on a studio shelf" label="Studio product shelf" shape="arch" ratio="aspect-[4/5]" parallax={6} />
          </div>
        </div>
      </section>

      {/* ============ LEARN ============ */}
      <section className="bg-paper py-24 sm:py-36" aria-labelledby="learn-title">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <SectionHead id="learn-title" eyebrow="Class is in session" title={<>The Hair Wellness <span className="italic-accent text-amethyst">Library</span></>} lede="Straight answers to the questions Iisha hears every week, backed by dermatology sources." />
            <div data-reveal><Btn href="/learn" variant="outline">All articles</Btn></div>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-card border border-plum-800/10 bg-plum-800/10 lg:grid-cols-3">
            {articles.slice(0, 3).map((a) => (
              <Link key={a.slug} href={`/learn/${a.slug}`} className="group flex flex-col bg-paper p-8 transition-colors hover:bg-bone sm:p-10" data-reveal="fade">
                <span className="eyebrow text-amethyst">{a.category} · {a.minutes} min read</span>
                <h3 className="mt-5 flex-1 font-display text-[1.75rem] leading-snug text-plum-900 group-hover:text-amethyst">{a.title}</h3>
                <span className="mt-8 inline-flex items-center gap-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900">
                  Read <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" strokeWidth={1.5} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ + VISIT ============ */}
      <section className="bg-bone py-24 sm:py-36" aria-labelledby="faq-title">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead id="faq-title" eyebrow="Questions, answered" title="What clients ask first" />
            <div className="mt-10"><FAQList items={homeFaqs} /></div>
            <div className="mt-8" data-reveal><Btn href="/faq" variant="text">See every FAQ</Btn></div>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9" aria-label="Visit the studio">
            <div className="sticky top-28 rounded-card bg-plum-950 p-9 text-bone" data-reveal>
              <p className="eyebrow text-brass-soft">Visit the studio</p>
              <p className="mt-4 font-display text-[1.9rem] leading-tight">{business.address.street}<br />{business.address.city}, VA {business.address.postalCode}</p>
              <p className="mt-2 text-[0.9rem] text-lilac">Richmond&apos;s West End, minutes from Short Pump and Glen Allen.</p>
              <dl className="mt-7 space-y-1 text-[0.92rem]">
                {business.hours.map((h) => (
                  <div key={h.day} className="flex justify-between border-b border-lilac/10 py-2">
                    <dt className="text-lilac">{h.day}</dt>
                    <dd>{h.open ? `${formatHour(h.open)} – ${formatHour(h.close)}` : "Closed"}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-brass-soft"><Clock className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />{business.bookingNote}</p>
              <div className="mt-7 flex flex-col gap-2">
                <a href={business.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-pill bg-bone px-5 py-3.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900 hover:bg-white"><MapPin className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />Get directions</a>
                <a href={business.phoneHref} className="inline-flex items-center justify-center gap-2 rounded-pill border border-lilac/30 px-5 py-3.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] hover:border-bone"><Phone className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />{business.phone}</a>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <CTABand />
    </>
  );
}
