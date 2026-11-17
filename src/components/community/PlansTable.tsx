/**
 * The plans comparison (Free / Circle / Inner Circle). Used on the About page, the Upgrade page and as the
 * live preview in the owner dashboard (Community → Plans & prices). Server-safe, no client JS.
 * Prices come from Settings; an empty price renders the <Needs> marker, never an invented number.
 */
import { Check } from "lucide-react";
import { PLAN_ORDER, priceNumber } from "@/lib/community/config";
import type { Billing, PlanKey, Settings } from "@/lib/community/types";
import { Icon3D, Price } from "./ui";

/** "2 months free" is only claimed when both prices are set and annual is about 10x monthly. */
export function annualSaving(monthly: string, annual: string): string | null {
  const m = priceNumber(monthly);
  const a = priceNumber(annual);
  if (m === null || a === null) return null;
  const ratio = a / m;
  return ratio >= 9.5 && ratio <= 10.5 ? "2 months free" : null;
}

export function PlansTable({ s, billing = "monthly", cta }: { s: Settings; billing?: Billing; cta?: (plan: PlanKey) => React.ReactNode }) {
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-3">
      {PLAN_ORDER.map((key) => {
        const p = s.plans[key];
        const featured = key === "circle";
        const saving = key !== "free" && billing === "annual" ? annualSaving(p.monthly, p.annual) : null;
        return (
          <li key={key} className={`flex flex-col rounded-card border p-6 ${featured ? "border-amethyst bg-paper shadow-[0_18px_40px_-28px_rgba(110,63,134,0.7)]" : "border-plum-800/10 bg-paper"}`}>
            <Icon3D name={key === "free" ? "seedling" : key === "circle" ? "circle" : "crown"} size={60} className="mb-3" />
            <p className="eyebrow text-amethyst">{key === "free" ? "Start here" : key === "circle" ? "Most members" : "Closest to Iisha"}</p>
            <h3 className="mt-2 font-display text-[1.7rem] leading-tight text-plum-900">{p.name}</h3>
            <p className="mt-1 text-[0.92rem] text-plum-700">{p.tagline}</p>
            <p className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-plum-900">
              {key === "free" ? (
                <span className="font-display text-[2rem] leading-none">Free</span>
              ) : (
                <>
                  <span className="font-display text-[2rem] leading-none">
                    <Price value={billing === "annual" ? p.annual : p.monthly} needs={`${p.name} ${billing} price`} />
                  </span>
                  <span className="text-[0.86rem] text-plum-700">{billing === "annual" ? "a year" : "a month"}</span>
                </>
              )}
            </p>
            <p className="mt-1 min-h-5 text-[0.82rem] text-plum-700">
              {saving ?? (key !== "free" && p.trialDays > 0 ? `${p.trialDays}-day free trial` : "")}
              {saving && p.trialDays > 0 ? ` · ${p.trialDays}-day free trial` : ""}
            </p>
            <ul className="mt-4 flex-1 space-y-2.5 text-[0.93rem] text-plum-900">
              {p.benefits.map((b) => (
                <li key={b} className="flex gap-2.5">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            {key === "inner" && p.seatCap ? <p className="mt-4 text-[0.82rem] text-plum-700">Limited to {p.seatCap} members so everyone gets real attention.</p> : null}
            {cta && <div className="mt-6">{cta(key)}</div>}
          </li>
        );
      })}
    </ul>
  );
}
