/** Iisha's affiliate storefronts as photo tiles (shop page, Hub, homepage). Server component. */
import Image from "next/image";
import { ArrowUpRight, Info } from "lucide-react";
import { storefronts } from "@/lib/content";
import { AFFILIATE_NOTE } from "@/lib/site";
import { img } from "@/lib/images";

export function Storefronts({ tone = "light", note = true }: { tone?: "light" | "dark"; note?: boolean }) {
  const dark = tone === "dark";
  return (
    <>
      <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-4">
        {storefronts.map((s) => (
          <li key={s.id} data-reveal="fade">
            <a href={`/go/${s.id}`} target="_blank" rel="noopener sponsored" className="group flex h-full flex-col">
              <span className="relative block aspect-[4/5] overflow-hidden rounded-card bg-mist">
                {img(s.image) && (
                  <Image src={img(s.image)!} alt={s.alt} fill sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw" className="object-cover transition duration-700 ease-[var(--ease-lens)] group-hover:scale-[1.03]" />
                )}
                <span className={`absolute left-4 top-4 rounded-pill px-3 py-1.5 font-sans text-[0.66rem] font-medium uppercase tracking-[0.16em] backdrop-blur-md ${dark ? "bg-plum-950/70 text-brass-soft" : "bg-bone/85 text-plum-900"}`}>{s.eyebrow}</span>
              </span>
              <span className={`mt-5 font-display text-[1.75rem] leading-tight ${dark ? "text-bone group-hover:text-brass-soft" : "text-plum-900 group-hover:text-amethyst"}`}>{s.title}</span>
              <span className={`mt-2 flex-1 text-[0.95rem] ${dark ? "text-lilac" : "text-plum-700"}`}>{s.blurb}</span>
              <span className={`mt-5 inline-flex items-center gap-2 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] ${dark ? "text-bone" : "text-plum-900"}`}>
                <span className="link-underline">{s.cta}</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" strokeWidth={1.5} />
                <span className="sr-only">(opens in a new tab)</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {note && (
        <p className={`mt-10 flex max-w-4xl items-start gap-2 text-[0.82rem] ${dark ? "text-lilac/80" : "text-plum-700"}`}>
          <Info className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? "text-brass-soft" : "text-amethyst"}`} aria-hidden="true" />
          {AFFILIATE_NOTE}
        </p>
      )}
    </>
  );
}
