import type { Metadata } from "next";
import Link from "next/link";
import { PlansTable, annualSaving } from "@/components/community/PlansTable";
import { PageHead, btnBrass, btnGhost } from "@/components/community/ui";
import { COMMUNITY_FAQ } from "@/lib/community/faq";
import { effectivePlan } from "@/lib/community/permissions";
import { planRank } from "@/lib/community/config";
import { getSettings } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";

export const metadata: Metadata = { title: "Plans" };
export const dynamic = "force-dynamic";

export default async function UpgradePage({ searchParams }: { searchParams: Promise<{ billing?: string }> }) {
  const actor = await requireMember();
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const billing = sp.billing === "annual" ? "annual" : "monthly";
  const plan = effectivePlan(actor);
  const staff = actor.role !== "member";
  const saving = annualSaving(s.plans.circle.monthly, s.plans.circle.annual);
  const tab = (on: boolean) => `inline-flex min-h-11 items-center rounded-pill px-5 text-[0.9rem] ${on ? "bg-plum-900 text-bone" : "text-plum-900 hover:bg-mist"}`;
  return (
    <>
      <PageHead icon="crown" eyebrow="Plans" title="Go deeper when you're ready." lede="Each plan is a different kind of support. Upgrades start right away. If you switch to a smaller plan or cancel, you keep what you paid for until your period ends." />
      <div className="mb-6 inline-flex rounded-pill border border-plum-800/15 bg-white p-1" role="group" aria-label="Billing">
        <Link href="/community/upgrade" aria-current={billing === "monthly" ? "true" : undefined} className={tab(billing === "monthly")}>Monthly</Link>
        <Link href="/community/upgrade?billing=annual" aria-current={billing === "annual" ? "true" : undefined} className={tab(billing === "annual")}>
          Annual{saving ? ` · ${saving}` : ""}
        </Link>
      </div>
      <PlansTable
        s={s}
        billing={billing}
        cta={(key) =>
          staff ? (
            key === "inner" ? <span className="inline-flex min-h-11 w-full items-center justify-center rounded-pill bg-mist px-4 text-center text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900">The team has full access</span> : null
          ) : plan === key ? (
            <span className="inline-flex min-h-11 w-full items-center justify-center rounded-pill bg-mist text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900">Your plan</span>
          ) : key === "free" ? (
            <Link href="/community/settings#plan" className={`${btnGhost} w-full`}>Manage my plan</Link>
          ) : planRank(key) < planRank(plan) ? (
            <Link href="/community/settings#plan" className={`${btnGhost} w-full`}>Switch to {s.plans[key].name}</Link>
          ) : (
            <Link href={`/community/checkout/${key}?billing=${billing}`} className={`${key === "circle" ? btnBrass : btnGhost} w-full`}>
              {key === "circle" && plan === "free" && s.plans.circle.trialDays ? `Try ${s.plans.circle.trialDays} days free` : `Choose ${s.plans[key].name}`}
            </Link>
          )
        }
      />
      <section className="mt-12" aria-labelledby="faq-h">
        <h2 id="faq-h" className="font-display text-[1.9rem] text-plum-900">Questions, answered.</h2>
        <div className="mt-3 divide-y divide-plum-800/12 border-y border-plum-800/12">
          {COMMUNITY_FAQ.slice(2).map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-plum-900 [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-[1.3rem] leading-snug">{f.q}</h3>
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-plum-800/20 text-[1.2rem] text-amethyst transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-3xl pb-5 text-plum-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
