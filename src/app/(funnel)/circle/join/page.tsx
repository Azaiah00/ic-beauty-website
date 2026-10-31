import type { Metadata } from "next";
import Image from "next/image";
import { Check } from "lucide-react";
import { img } from "@/lib/images";
import { membership } from "@/lib/portal/data";
import { CircleJoinForm } from "@/components/funnel/CircleJoinForm";

export const metadata: Metadata = {
  title: `Join ${membership.name}`,
  description: `Start your ${membership.trialDays}-day free trial of ${membership.name}.`,
  alternates: { canonical: "/circle/join" },
  robots: { index: false, follow: false },
};

export default function JoinPage() {
  return (
    <section className="min-h-dvh bg-sand/60 pb-20 pt-24 sm:pt-28">
      <div className="container-x grid items-start gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6 lg:pt-6">
          <p className="eyebrow text-amethyst">{membership.trialDays}-day free trial</p>
          <h1 className="mt-5 text-[clamp(2.4rem,1.5rem+3.6vw,4.2rem)] leading-[1.04] text-plum-900">
            Join <span className="italic-accent text-amethyst">{membership.name}.</span>
          </h1>
          <p className="mt-5 max-w-lg text-lede text-plum-700">{membership.promise}</p>
          <ul className="mt-8 grid max-w-lg gap-3">
            {["Week 1 unlocks the moment you join", "A new lesson every Monday after that", "Track habits, check-ins and progress photos", "Cancel anytime during your trial and you pay nothing"].map((x) => (
              <li key={x} className="flex items-start gap-3 text-[1rem] text-plum-900"><Check className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />{x}</li>
            ))}
          </ul>
          <div className="mt-10 hidden max-w-md items-center gap-4 lg:flex">
            <span className="relative block h-16 w-16 overflow-hidden rounded-full ring-1 ring-brass/60 ring-offset-2 ring-offset-sand">
              {img("iisha-portrait") && <Image src={img("iisha-portrait")!} alt="" fill sizes="64px" className="object-cover" style={{ objectPosition: "72% 22%" }} />}
            </span>
            <p className="text-[0.95rem] italic text-plum-700">&ldquo;Healthy awareness is rare. Let&apos;s make it a habit, together.&rdquo; <span className="not-italic text-plum-900">— Iisha</span></p>
          </div>
        </div>
        <div className="lg:col-span-6">
          <div className="rounded-card bg-paper p-6 shadow-[0_40px_80px_-50px_rgba(36,19,42,0.55)] sm:p-9">
            <CircleJoinForm />
          </div>
        </div>
      </div>
    </section>
  );
}
