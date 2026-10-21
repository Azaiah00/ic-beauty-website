import { Check } from "lucide-react";
import type { Pillar } from "@/lib/content";
import { PhotoSlot } from "@/components/ui/PhotoSlot";

/**
 * The four H.A.I.R. phases as an elegant editorial sequence:
 * a sticky arched image on the left, phases unfolding on the right.
 */
export function MethodSteps({ pillars, image, tone = "light" }: { pillars: Pillar[]; image?: { src?: string; alt: string; label: string }; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
      {image && (
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <PhotoSlot src={image.src} alt={image.alt} label={image.label} shape="arch" ratio="aspect-[4/5]" tone={tone} parallax={6} />
          </div>
        </div>
      )}
      <ol className={image ? "lg:col-span-7" : "lg:col-span-12"}>
        {pillars.map((p, i) => (
          <li key={p.letter} className={`grid grid-cols-[auto_1fr] gap-x-8 border-t py-10 first:border-t-0 first:pt-0 sm:gap-x-12 ${dark ? "border-lilac/15" : "border-plum-800/10"}`} data-reveal>
            <div className="flex flex-col items-center">
              <span className={`font-display text-[4.5rem] leading-[0.8] sm:text-[6rem] ${dark ? "text-brass-soft" : "text-amethyst"}`}>{p.letter}</span>
              <span className={`eyebrow mt-3 ${dark ? "text-lilac" : "text-plum-700"}`}>{p.word}</span>
            </div>
            <div>
              <p className={`eyebrow ${dark ? "text-brass-soft" : "text-brass-deep"}`}>Phase {i + 1} · {p.phase} · {p.promise}</p>
              <h3 className={`mt-3 font-display text-[2rem] leading-[1.1] sm:text-[2.4rem] ${dark ? "text-bone" : "text-plum-900"}`}>{p.summary}</h3>
              <p className={`mt-4 max-w-xl ${dark ? "text-lilac" : "text-plum-700"}`}>{p.detail}</p>
              <ul className="mt-5 flex flex-wrap gap-2">
                {p.includes.map((x) => (
                  <li key={x} className={`inline-flex items-center gap-2 rounded-pill border px-3.5 py-1.5 text-[0.85rem] ${dark ? "border-lilac/20 text-lilac" : "border-plum-800/15 text-plum-800"}`}>
                    <Check className={`h-3.5 w-3.5 ${dark ? "text-brass-soft" : "text-amethyst"}`} aria-hidden="true" strokeWidth={2} />
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
