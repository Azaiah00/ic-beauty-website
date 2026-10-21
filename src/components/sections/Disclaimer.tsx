import { ShieldCheck } from "lucide-react";
import { DISCLAIMER } from "@/lib/site";

export function Disclaimer({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <aside className={`flex gap-4 border-l-2 py-1 pl-5 text-[0.88rem] leading-relaxed ${tone === "dark" ? "border-brass text-lilac" : "border-brass text-plum-700"}`}>
      <ShieldCheck className={`mt-0.5 h-5 w-5 shrink-0 ${tone === "dark" ? "text-brass-soft" : "text-amethyst"}`} aria-hidden="true" strokeWidth={1.5} />
      <p>{DISCLAIMER}</p>
    </aside>
  );
}
