import type { Metadata } from "next";
import { img } from "@/lib/images";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { CTABand } from "@/components/sections/CTABand";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { Needs } from "@/components/ui/Needs";
import { ICMark } from "@/components/brand/ICMark";
import { Btn } from "@/components/ui/Btn";
import { bookHref } from "@/lib/site";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb, personNode } from "@/lib/schema";

export const metadata: Metadata = {
  title: "About Iisha C. Silver, Hair Recovery Practitioner",
  description:
    "Meet Iisha C. Silver: Brooklyn roots, Richmond-based hair and scalp specialist, service educator, and creator of The H.A.I.R. Wellness Method™. Founder of I.C. Beauty LLC.",
  alternates: { canonical: "/about" },
  openGraph: { type: "profile" },
};

const modalities = ["Cosmetology", "Trichology", "Hair color", "Sound therapy", "Holistic body scanning", "Gut & hair wellness", "Craniosacral therapy (in training)"];

export default function AboutPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "About Iisha", path: "/about" }]), { "@type": "ProfilePage", mainEntity: personNode() })} />
      <PageHero
        crumbs={[{ name: "About Iisha", href: "/about" }]}
        eyebrow="Meet Iisha · Founder of I.C. Beauty LLC"
        title={<>I chase peace. <span className="italic-accent text-amethyst">Everything else comes naturally.</span></>}
        lede={<p>Iisha C. Silver is a hair and scalp specialist, service educator, and speaker in Richmond, Virginia, and the creator of The H.A.I.R. Wellness Method™.</p>}
        image={{ src: img("iisha-hero") ?? img("iisha-portrait"), alt: "Portrait of Iisha C. Silver in her white coat in front of the I.C. Beauty logo", label: "Signature portrait", position: "50% 18%" }}
      >
        <Btn href={bookHref}>Book with Iisha</Btn>
      </PageHero>

      <section className="bg-paper py-24 sm:py-32" aria-labelledby="story-title">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <ICMark className="h-32 w-auto text-plum-900" />
              <p className="mt-8 font-display text-[1.6rem] italic leading-snug text-plum-900">I.C. Beauty <span className="text-brass">·</span> I.C. Success <span className="text-brass">·</span> I.C. You</p>
              <p className="mt-4 max-w-xs text-[0.95rem] text-plum-700">The I is an exclamation point and the C sits in the dot. Together they say <em>I see</em>: awareness first.</p>
            </div>
          </div>
          <div className="lg:col-span-7 lg:col-start-6">
            <SectionHead id="story-title" eyebrow="My story" title={<>On the days my hair looked good, <span className="italic-accent text-amethyst">I felt good.</span></>} />
            <div className="mt-10 space-y-6 text-[1.12rem] leading-[1.85] text-plum-800" data-reveal>
              <p><span className="float-left mr-3 mt-1 font-display text-[4.6rem] leading-[0.8] text-amethyst">M</span>y roots trace back to Brooklyn, NY, where my love for hair was sparked at an early age. Growing up, entrepreneurship wasn&apos;t something that was nurtured. But passion? That came naturally.</p>
              <p>I never imagined I&apos;d become a business owner, but life has a way of shaping us through every joy, loss, lesson, and breakthrough. One thing I&apos;ve learned along the way: on the days my hair looked good, I felt good. That connection between self-care and self-worth planted the seed for what would one day become I.C. Beauty LLC.</p>
              <p>Over the years my work grew from the chair into something bigger. I now use everything I know, from sound therapy to cosmetology to trichology and a range of holistic modalities, to teach women (and a few men) how to love on their scalps and manage their hair. Our hair is part of our bodies. It grows out of the largest organ, the skin. Better self-care leads to healthier hair.</p>
              <p>My goal is to teach clients how to keep growing long after their treatments with me. I&apos;m always here to lean on, check in, encourage, and of course take the progress pics. But teaching a man to fish will always be more valuable than a fish dinner.</p>
              <p>At I.C. Beauty, we believe everyone has a story. My mission is to help you show up looking your best while living, writing, and owning yours.</p>
            </div>
            <p className="mt-10 font-display text-[2rem] italic text-amethyst" data-reveal>— Iisha</p>
          </div>
        </div>
      </section>

      <section className="bg-plum-950 py-24 text-bone sm:py-32" aria-labelledby="iish-title">
        <div className="container-x grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="eyebrow text-brass-soft" data-reveal>&lsquo;Indestructible Iish&rsquo;</p>
            <h2 id="iish-title" className="mt-5 text-title" data-reveal>The route might shift, but <span className="italic-accent text-brass-soft">the destination remains the same.</span></h2>
            <p className="mt-7 text-lede text-lilac" data-reveal>Strength that doesn&apos;t crumble under pressure, doesn&apos;t fold when the path gets messy, and doesn&apos;t dim when the journey reroutes. Built from purpose, protected by grace, and powered by grit. Detours don&apos;t derail you. They refine you.</p>
          </div>
          <div className="border-t border-lilac/15 pt-10 lg:col-span-5 lg:col-start-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0" data-reveal>
            <p className="eyebrow text-brass-soft">Training & modalities</p>
            <ul className="mt-6 flex flex-wrap gap-2.5">
              {modalities.map((m) => (
                <li key={m} className="rounded-pill border border-lilac/25 px-4 py-2 text-[0.92rem] text-lilac">{m}</li>
              ))}
            </ul>
            <p className="mt-8 text-[0.92rem] text-lilac">Credentials, issuing bodies, and years of experience will be listed here.</p>
            <div className="mt-3"><Needs tone="light">VA license · trichology certification · years in practice</Needs></div>
          </div>
        </div>
      </section>

      <section className="bg-bone py-24 sm:py-32" aria-labelledby="gallery-title">
        <div className="container-x">
          <SectionHead id="gallery-title" eyebrow="Inside the studio" title={<>A calm place to <span className="italic-accent text-amethyst">be seen and heard.</span></>} />
          <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-12 lg:gap-6">
            <div className="col-span-2 lg:col-span-7"><PhotoSlot src={img("studio-1") ?? img("studio")} ratio="aspect-[16/10]" label="The studio" alt="The I.C. Beauty studio" /></div>
            <div className="col-span-2 lg:col-span-5"><PhotoSlot src={img("studio-2") ?? img("consultation")} ratio="aspect-[16/10] lg:aspect-auto lg:h-full" position="50% 30%" label="Consultation" alt="A consultation in the studio" /></div>
            <div className="lg:col-span-4"><PhotoSlot src={img("studio-3") ?? img("scalp-ritual")} ratio="aspect-square" label="Scalp care" alt="A scalp care ritual" /></div>
            <div className="lg:col-span-4"><PhotoSlot src={img("studio-4") ?? img("product-shelf")} ratio="aspect-square" label="Product shelf" alt="Curated haircare on a studio shelf" /></div>
            <div className="col-span-2 lg:col-span-4"><PhotoSlot src={img("studio-5") ?? img("scalp-closeup")} ratio="aspect-[2/1] lg:aspect-square" label="Scalp analysis" alt="Healthy coily hair parted to the scalp" /></div>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
