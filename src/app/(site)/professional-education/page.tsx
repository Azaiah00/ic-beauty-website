import type { Metadata } from "next";
import { Check, Package } from "lucide-react";
import { img } from "@/lib/images";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { CTABand } from "@/components/sections/CTABand";
import { Btn } from "@/components/ui/Btn";
import { Needs } from "@/components/ui/Needs";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { WaitlistForm } from "@/components/forms/WaitlistForm";
import { stylistClasses, faqs } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb, courseNodes } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Stylist Education & Consultation Classes in Richmond, VA",
  description:
    "Hands-on education for stylists from Iisha C. Silver: Mastering the Consultation, Color with Confidence one-on-one sessions, and the H.A.I.R. Method for stylists. Take-home material and product kit included.",
  alternates: { canonical: "/professional-education" },
};

export default function ProEdPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "Professional Education", path: "/professional-education" }]), ...courseNodes())} />
      <PageHero
        crumbs={[{ name: "Professional Education", href: "/professional-education" }]}
        eyebrow="Professional Education · For stylists"
        title={<>Turn your consultations <span className="italic-accent text-amethyst">into currency.</span></>}
        lede={<p>Education is the foundation for the stylist and the client. These comprehensive, hands-on classes come from years behind the chair, so you can grow your service menu, your retention, and your revenue.</p>}
        image={{ src: img("iisha-teaching") ?? img("classroom"), alt: "Stylists practicing sectioning on natural hair during a hands-on class", label: "Class in session", shape: "rect" }}
      >
        <Btn href="#waitlist">Join the class waitlist</Btn>
        <Btn href="#classes" variant="outline">See the classes</Btn>
      </PageHero>

      <section className="bg-paper py-24 sm:py-32" aria-labelledby="problem-title">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHead id="problem-title" eyebrow="The real problem" title={<>We struggle to give clients what they need <span className="italic-accent text-amethyst">because we&apos;re guessing.</span></>} lede="Guessing shows up as color corrections, clients who don't rebook, and a fear of selling that leaves money on the table. The fix starts before the cape goes on." />
          </div>
          <ul className="space-y-5 self-end lg:col-span-4 lg:col-start-9">
            {["The consultation is the most important, and most underrated, part of the visit", "Clients stay with stylists who educate them", "Wellness awareness sets you apart from every salon on the block"].map((t) => (
              <li key={t} className="flex items-start gap-3 border-t border-plum-800/10 pt-5 font-display text-[1.3rem] leading-snug text-plum-900" data-reveal>
                <Check className="mt-1.5 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" strokeWidth={2} />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="classes" className="scroll-mt-24 bg-plum-950 py-24 text-bone sm:py-32" aria-labelledby="classes-title">
        <div className="container-x">
          <SectionHead tone="dark" id="classes-title" eyebrow="Classes for stylists" title={<>Learn exactly what you need. <span className="italic-accent text-brass-soft">Cut the fluff.</span></>} />
          <div className="mt-16 grid gap-px overflow-hidden rounded-card border border-lilac/15 bg-lilac/15 lg:grid-cols-3">
            {stylistClasses.map((c, i) => (
              <article key={c.id} id={c.id} className="flex flex-col bg-plum-950 p-9 sm:p-10" data-reveal="fade">
                <span className="font-display text-[1.1rem] italic text-brass-soft">{["I", "II", "III"][i]}.</span>
                <h3 className="mt-3 font-display text-[2.2rem] leading-tight">{c.name}</h3>
                <p className="eyebrow mt-3 text-brass-soft">{c.format}</p>
                <p className="mt-5 flex-1 text-lilac">{c.blurb}</p>
                <ul className="mt-7 space-y-2.5 border-t border-lilac/15 pt-6">
                  {c.outcomes.map((o) => (
                    <li key={o} className="flex items-start gap-2.5 text-[0.95rem] text-lilac">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-brass-soft" aria-hidden="true" strokeWidth={2} />
                      {o}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[0.86rem] text-lilac">{c.status}</p>
                <p className="mt-3"><Needs tone="light">Confirm price + dates</Needs></p>
              </article>
            ))}
          </div>
          <p className="mt-8 flex items-center gap-3 text-lilac" data-reveal>
            <Package className="h-5 w-5 shrink-0 text-brass-soft" aria-hidden="true" strokeWidth={1.25} />
            Every class includes take-home material and a product kit so you can put your new skills to use right away.
          </p>
        </div>
      </section>

      <section className="bg-bone py-24 sm:py-32" aria-labelledby="proof2-title">
        <div className="container-x grid items-center gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <PhotoSlot src={img("iisha-portrait")} alt="Iisha C. Silver, educator, in her white coat" label="Iisha" shape="arch" ratio="aspect-[4/5]" position="55% 30%" parallax={6} />
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <span className="font-display text-7xl leading-none text-brass" aria-hidden="true">&ldquo;</span>
            <blockquote className="font-display text-[clamp(1.9rem,1.4rem+1.6vw,2.9rem)] italic leading-[1.15] text-plum-900" data-reveal>
              Daytime class done! What a surreal experience. Dropped some money-making gems on these students.
            </blockquote>
            <p className="eyebrow mt-6 text-amethyst" data-reveal>Iisha, after her &ldquo;consultations to currency&rdquo; workshop</p>
            <div className="mt-14 space-y-8">
              <SectionHead id="proof2-title" eyebrow="From graduates" title="What stylists say" />
              {[1, 2].map((n) => (
                <figure key={n} className="border-t border-plum-800/15 pt-6" data-reveal>
                  <blockquote className="font-display text-[1.3rem] italic text-plum-900/70">&ldquo;NEEDS REAL REVIEW — paste a verbatim testimonial from a class graduate.&rdquo;</blockquote>
                  <figcaption className="eyebrow mt-4 text-plum-700">Stylist name · Salon · City</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="waitlist" className="scroll-mt-24 bg-paper py-24 sm:py-32" aria-labelledby="wl-title">
        <div className="container-x grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead id="wl-title" eyebrow="Seats are limited" title={<>Be first when <span className="italic-accent text-amethyst">dates are announced.</span></>} lede="Class dates go to the waitlist before they're posted anywhere else. Small groups mean every stylist gets real attention." />
            <div className="mt-8 text-[0.98rem] text-plum-700" data-reveal>
              {faqs[2].items.slice(0, 1).map((f) => (
                <p key={f.q}><span className="text-plum-900">{f.q}</span> {f.a}</p>
              ))}
            </div>
          </div>
          <div className="rounded-card border border-plum-800/10 bg-bone p-7 sm:p-11 lg:col-span-7" data-reveal>
            <WaitlistForm />
          </div>
        </div>
      </section>

      <CTABand
        title={<>Want Iisha to train <span className="italic-accent text-brass-soft">your whole team?</span></>}
        body="In-salon workshops and beauty-school sessions on consultation, color, and wellness-first service."
        primary={{ label: "Request a team workshop", href: "/speaking#inquire" }}
        secondary={{ label: "Contact Iisha", href: "/contact" }}
        image="classroom"
      />
    </>
  );
}
