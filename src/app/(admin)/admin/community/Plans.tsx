/** Plans & prices (6.6): names, prices, trial, benefits, seat cap and program prices, with a live preview. */
import { Needs } from "@/components/ui/Needs";
import { PlansTable } from "@/components/community/PlansTable";
import { PLAN_ORDER } from "@/lib/community/config";
import type { Member } from "@/lib/community/types";
import { db } from "@/lib/server/community/store";
import { Act, Tip, btn, card, field, h2, lbl } from "./shared";

const PRICE_LABELS: Record<string, string> = {
  "radiance-rewired": "Radiance Rewired",
  "next-program": "Your next program",
  "love-story-core": "30 Days to a New Love Story: Core",
  "love-story-vip": "30 Days to a New Love Story: VIP",
};
const priceLabel = (key: string) => (key.endsWith("-member") ? `${PRICE_LABELS[key.slice(0, -7)] ?? key.slice(0, -7)}: Inner Circle member price` : PRICE_LABELS[key] ?? key);

export async function CommunityPlans(_: { actor: Member }) {
  const s = await db.settings();
  return (
    <>
      <Tip>What each plan is called, what it costs and what it includes. A price you leave empty shows a small “needs confirmation” marker everywhere instead of a number, so nothing is ever guessed.</Tip>

      <Act action="plans.save" back="/admin?view=community-plans" className="mt-5 space-y-4">
        {PLAN_ORDER.map((key) => {
          const p = s.plans[key];
          return (
            <fieldset key={key} className={`${card} p-4 sm:p-5`}>
              <legend className="sr-only">{p.name}</legend>
              <h2 className={h2}>{p.name}</h2>
              <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
                <label className={lbl}>Plan name<input name={`${key}-name`} defaultValue={p.name} required className={field} /></label>
                <label className={lbl}>One-line description<input name={`${key}-tagline`} defaultValue={p.tagline} className={field} /></label>
                {key !== "free" && (
                  <>
                    <label className={lbl}>
                      <span className="flex flex-wrap items-center gap-2">Monthly price {!p.monthly && <Needs>Monthly price</Needs>}</span>
                      <input name={`${key}-monthly`} defaultValue={p.monthly} placeholder="$0.00" className={field} />
                    </label>
                    <label className={lbl}>
                      <span className="flex flex-wrap items-center gap-2">Annual price {!p.annual && <Needs>Annual price</Needs>}</span>
                      <input name={`${key}-annual`} defaultValue={p.annual} placeholder="$0.00" className={field} />
                    </label>
                    <label className={lbl}>Free trial days (0 = no trial)<input type="number" name={`${key}-trial`} min={0} max={90} defaultValue={p.trialDays} className={field} /></label>
                  </>
                )}
                {key === "inner" && <label className={lbl}>Seat cap (0 = no limit)<input type="number" name="inner-cap" min={0} defaultValue={p.seatCap ?? 0} className={field} /></label>}
                <label className={`${lbl} sm:col-span-2`}>What&apos;s included (one per line)<textarea name={`${key}-benefits`} defaultValue={p.benefits.join("\n")} rows={Math.max(4, p.benefits.length + 1)} className={field} /></label>
              </div>
              {key !== "free" && <p className="mt-2 text-[0.82rem] text-plum-700">Tip: an annual price of about 10 times the monthly price shows as “2 months free”.</p>}
            </fieldset>
          );
        })}

        <fieldset className={`${card} p-4 sm:p-5`}>
          <legend className="sr-only">Program prices</legend>
          <h2 className={h2}>Program prices</h2>
          <p className="text-[0.88rem] text-plum-700">One-time programs sold in the Classroom. Leave a price empty until Iisha confirms it.</p>
          <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
            {Object.keys(s.prices).map((key) => (
              <label key={key} className={lbl}>
                <span className="flex flex-wrap items-center gap-2">{priceLabel(key)} {!s.prices[key] && <Needs>Price</Needs>}</span>
                <input name={`price-${key}`} defaultValue={s.prices[key]} placeholder="$0.00" className={field} />
              </label>
            ))}
          </div>
        </fieldset>

        <div className={`${card} sticky bottom-3 z-10 flex flex-wrap items-center justify-between gap-3 p-4`}>
          <p className="text-[0.9rem] text-plum-700">Saving updates the About page, the Upgrade page and every price in the community right away.</p>
          <button className={btn}>Save plans &amp; prices</button>
        </div>
      </Act>

      <section className="mt-8" aria-labelledby="preview-h">
        <h2 id="preview-h" className={h2}>Live preview: how members see your plans</h2>
        <p className="text-[0.88rem] text-plum-700">This is the plans table from the community&apos;s About page, using what&apos;s saved right now.</p>
        <div className="mt-3 rounded-[1.4rem] bg-bone p-4"><PlansTable s={s} /></div>
      </section>
    </>
  );
}
