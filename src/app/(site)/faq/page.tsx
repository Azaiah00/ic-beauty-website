import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHead } from "@/components/sections/SectionHead";
import { FAQList } from "@/components/sections/FAQList";
import { CTABand } from "@/components/sections/CTABand";
import { Disclaimer } from "@/components/sections/Disclaimer";
import { faqs } from "@/lib/content";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb, faqNode, allFaqs } from "@/lib/schema";

export const metadata: Metadata = {
  title: "FAQ: Hair Loss Consultations, Pricing & Classes",
  description:
    "Answers about hair recovery pricing, the free discovery call, the full scalp consultation, results timelines, virtual visits, classes for stylists and parents, and booking Iisha to speak.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "FAQ", path: "/faq" }]), faqNode(allFaqs, "/faq"))} />
      <PageHero crumbs={[{ name: "FAQ", href: "/faq" }]} eyebrow="Frequently asked questions" title={<>Honest answers, <span className="italic-accent text-amethyst">no guessing.</span></>} />
      <section className="bg-bone py-20 sm:py-28">
        <div className="container-x space-y-20">
          {faqs.map((g) => (
            <div key={g.group} className="grid gap-10 lg:grid-cols-12">
              <div className="lg:col-span-4"><SectionHead eyebrow="Topic" title={g.group} /></div>
              <div className="lg:col-span-8"><FAQList items={g.items} /></div>
            </div>
          ))}
          <div className="mx-auto max-w-4xl"><Disclaimer /></div>
        </div>
      </section>
      <CTABand />
    </>
  );
}
