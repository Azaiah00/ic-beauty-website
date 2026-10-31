import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ScalpCheck } from "@/components/quiz/ScalpCheck";
import { Disclaimer } from "@/components/sections/Disclaimer";
import { JsonLd } from "@/components/JsonLd";
import { graph, breadcrumb } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Free 2-Minute Scalp Self-Check: Shedding or Tension?",
  description:
    "Answer 7 quick questions about shedding, styling, and scalp health to get your Awareness Profile and three next steps from Iisha C. Silver. Free and educational.",
  alternates: { canonical: "/scalp-check" },
};

export default function ScalpCheckPage() {
  return (
    <>
      <JsonLd data={graph(breadcrumb([{ name: "Scalp Self-Check", path: "/scalp-check" }]))} />
      <PageHero
        crumbs={[{ name: "Scalp Self-Check", href: "/scalp-check" }]}
        eyebrow="Free · 2 minutes · 7 questions"
        title={<>Let&apos;s uncover what your scalp is <span className="italic-accent text-amethyst">trying to tell you.</span></>}
        lede={<p>Answer honestly. You&apos;ll get your Awareness Profile and three simple next steps right away.</p>}
      />
      <section className="bg-bone pb-24 sm:pb-32">
        <div className="container-x -mt-10 sm:-mt-14">
          <ScalpCheck />
          <div className="mx-auto mt-10 max-w-4xl"><Disclaimer /></div>
        </div>
      </section>
    </>
  );
}
