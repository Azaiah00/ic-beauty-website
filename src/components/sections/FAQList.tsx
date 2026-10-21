import { Plus } from "lucide-react";
import type { QA } from "@/lib/content";

/** Native <details> accordion — zero JS, fully crawlable, keyboard accessible. */
export function FAQList({ items, tone = "light" }: { items: QA[]; tone?: "light" | "dark" }) {
  return (
    <div className={`divide-y ${tone === "dark" ? "divide-lilac/15 border-y border-lilac/15" : "divide-plum-800/12 border-y border-plum-800/12"}`}>
      {items.map((f) => (
        <details key={f.q} className="group" data-reveal="fade">
          <summary className={`flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden ${tone === "dark" ? "text-bone" : "text-plum-900"}`}>
            <h3 className="font-display text-[1.45rem] leading-snug sm:text-[1.6rem]">{f.q}</h3>
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-transform duration-500 group-open:rotate-45 ${tone === "dark" ? "border-lilac/30 text-brass-soft" : "border-plum-800/20 text-amethyst"}`}>
              <Plus className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} />
            </span>
          </summary>
          <p className={`max-w-3xl pb-6 leading-relaxed ${tone === "dark" ? "text-lilac" : "text-plum-700"}`}>{f.a}</p>
        </details>
      ))}
    </div>
  );
}
