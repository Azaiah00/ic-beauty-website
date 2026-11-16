import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle2, Video } from "lucide-react";
import { img } from "@/lib/images";
import { links } from "@/lib/site";
import { JotformEmbed } from "@/components/forms/JotformEmbed";

/**
 * /masterclass: on-brand home for the H.A.I.R. Shift Masterclass registration (Nov 2026).
 * Every QR / video / social link for the class points HERE, never straight at Jotform, so the
 * form can change without reprinting or re-rendering anything. Copy is Iisha's own (Nov 14 email).
 * No date or time on the page at Iisha's request (Nov 15): the Jotform carries the details.
 */
export const metadata: Metadata = {
  title: "The H.A.I.R. Shift Masterclass: free live class with Iisha",
  description: "Think Differently. Care Differently. Join Iisha C. Silver for a free live Zoom class on what healthy hair really requires, beyond products and styling.",
  alternates: { canonical: "/masterclass" },
  robots: { index: false, follow: true },
};

const POINTS = [
  "The connection between your hair, your habits and your overall wellness",
  "What healthy hair really requires, beyond products and styling",
  "Live on Zoom with Iisha, free to attend",
];

export default function MasterclassPage() {
  const portrait = img("iisha-portrait");
  return (
    <section className="min-h-dvh bg-bone pb-16 pt-24 text-plum-900 sm:pt-28">
      <div className="mx-auto w-full max-w-2xl px-4">
        <div className="flex flex-col items-center text-center">
          {portrait && (
            <span className="rise relative block h-24 w-24 overflow-hidden rounded-full ring-1 ring-brass/70 ring-offset-4 ring-offset-bone" style={{ ["--d" as string]: 0 }}>
              <Image src={portrait} alt="Iisha C. Silver" fill sizes="96px" priority className="origin-[70%_25%] scale-[1.6] object-cover" style={{ objectPosition: "72% 22%" }} />
            </span>
          )}
          <p className="eyebrow rise mt-6 inline-flex items-center gap-2 text-amethyst" style={{ ["--d" as string]: 1 }}>
            <Video className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} /> Free live Zoom class &middot; with Iisha
          </p>
          <h1 className="rise mt-3 font-display text-[clamp(2.3rem,1.6rem+3.4vw,3.4rem)] leading-[1.04]" style={{ ["--d" as string]: 2 }}>
            The H.A.I.R. Shift <span className="italic-accent text-amethyst">Masterclass</span>
          </h1>
          <p className="rise mt-3 font-display text-[1.35rem] italic text-brass-deep" style={{ ["--d" as string]: 3 }}>Think Differently. Care Differently.</p>
          <p className="rise mt-5 max-w-lg text-plum-700" style={{ ["--d" as string]: 4 }}>
            Join me for a free live class where we&rsquo;ll talk about what healthy hair really requires&mdash;beyond products and styling.
          </p>
        </div>

        <ul className="rise mx-auto mt-8 max-w-lg space-y-3" style={{ ["--d" as string]: 5 }}>
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[0.98rem] text-plum-800">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" strokeWidth={1.6} />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div id="register" className="rise mt-10 scroll-mt-24 rounded-card border border-plum-800/10 bg-paper p-3 sm:p-6" style={{ ["--d" as string]: 6 }}>
          <p className="eyebrow mb-1 px-2 pt-2 text-amethyst sm:px-0 sm:pt-0">Reserve your free seat</p>
          <p className="mb-4 px-2 text-[0.92rem] text-plum-700 sm:px-0">Fill in the short form below and you&rsquo;re in.</p>
          <JotformEmbed formId={links.masterclassFormId} title="H.A.I.R. Shift Masterclass registration form" />
        </div>
      </div>
    </section>
  );
}
