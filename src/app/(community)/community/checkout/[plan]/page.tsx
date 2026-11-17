import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, CreditCard, Info, Lock } from "lucide-react";
import { Price, btn, btnGhost, card } from "@/components/community/ui";
import { check, effectivePlan } from "@/lib/community/permissions";
import { fmtDate } from "@/lib/server/community/core";
import { getSettings } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Checkout (demo)" };
export const dynamic = "force-dynamic";

const STEPS: Record<string, { label: string; href: string }[]> = {
  circle: [
    { label: "Open Week 1 of the curriculum", href: "/community/classroom/circle-curriculum" },
    { label: "Set up My Journey and take your baseline", href: "/portal" },
    { label: "Ask your first question in Ask Iisha", href: "/community?compose=1&category=ask-iisha" },
  ],
  inner: [
    { label: "Say hello in the Inner Circle Lounge", href: "/community?category=inner-lounge" },
    { label: "Put the next coaching call on your calendar", href: "/community/calendar" },
    { label: "Message Iisha's team to book your 1:1 review", href: "/community/messages" },
  ],
};

/**
 * Demo checkout for a plan (/checkout/circle, /checkout/inner) or a one-time program (/checkout/program-<id>).
 * // TODO: Payments — Square Subscriptions for plans and a Square checkout link for programs.
 */
export default async function CheckoutPage({ params, searchParams }: { params: Promise<{ plan: string }>; searchParams: Promise<{ billing?: string; done?: string }> }) {
  const actor = await requireMember();
  const [{ plan: key }, sp, s] = await Promise.all([params, searchParams, getSettings()]);
  const billing = sp.billing === "annual" ? "annual" : "monthly";
  const now = new Date();

  // ── A one-time program
  if (key.startsWith("program-")) {
    const course = await db.course(key.slice(8));
    if (!course || course.access.kind !== "buy") notFound();
    if (check(actor, "course.view", course).ok) redirect(`/community/classroom/${course.id}`);
    const gate = check(actor, "course.buy", course);
    const memberPrice = effectivePlan(actor) === "inner" ? s.prices[`${course.access.priceKey}-member`] : "";
    const price = memberPrice || s.prices[course.access.priceKey];
    return (
      <Frame title={course.title} sub="One-time purchase. Yours to keep.">
        <dl className="space-y-2 text-plum-900">
          <Row k={course.title} v={<Price value={price} needs="Program price" />} />
          {memberPrice && <p className="text-[0.86rem] text-plum-700">{s.plans.inner.name} member pricing applied.</p>}
          <Row k="Total today" v={<Price value={price} needs="Program price" />} strong />
        </dl>
        <DemoCard />
        {gate.ok && price ? (
          <form method="post" action="/api/community/course.buy" className="mt-5">
            <input type="hidden" name="course" value={course.id} />
            <input type="hidden" name="back" value={`/community/checkout/${key}`} />
            <button className={`${btn} w-full !min-h-14`}>Complete purchase (demo)</button>
          </form>
        ) : (
          <p className="mt-5 rounded-xl bg-mist px-4 py-3 text-plum-900">{gate.ok ? "This program doesn't have a price yet, so it can't be bought. Iisha sets it in her dashboard." : gate.message}</p>
        )}
      </Frame>
    );
  }

  if (key !== "circle" && key !== "inner") notFound();
  const p = s.plans[key];

  // ── Celebration
  if (sp.done) {
    return (
      <div className={`${card} mx-auto max-w-xl p-7 text-center sm:p-10`}>
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-soft/60 text-plum-950"><CheckCircle2 className="h-7 w-7" aria-hidden="true" strokeWidth={1.5} /></span>
        <h1 className="mt-5 font-display text-[2.3rem] leading-tight text-plum-900">Welcome to {p.name}, {actor.name.split(" ")[0]}.</h1>
        <p className="mt-2 text-plum-700">
          {actor.trialEndsAt && +new Date(actor.trialEndsAt) > +now ? `Your free trial runs until ${fmtDate(actor.trialEndsAt, { month: "long", day: "numeric" })}. ` : ""}
          No card was charged. This is a demo.
        </p>
        <h2 className="mt-7 text-left font-display text-[1.4rem] text-plum-900">Your first 3 steps</h2>
        <ol className="mt-3 space-y-2 text-left">
          {STEPS[key].map((st, i) => (
            <li key={st.href}>
              <Link href={st.href} className="flex min-h-14 items-center gap-4 rounded-2xl border border-plum-800/15 bg-white px-4 text-plum-900 hover:border-amethyst">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-plum-900 text-[0.85rem] text-bone">{i + 1}</span>
                {st.label}
              </Link>
            </li>
          ))}
        </ol>
        <Link href="/community" className={`${btnGhost} mt-6`}>Back to the community</Link>
      </div>
    );
  }

  const current = effectivePlan(actor);
  const trial = key === "circle" && current === "free" ? p.trialDays : 0;
  const price = billing === "annual" ? p.annual : p.monthly;
  return (
    <Frame title={p.name} sub={p.tagline}>
      {actor.role !== "member" ? (
        <p className="rounded-xl bg-mist px-4 py-3 text-plum-900">Iisha&apos;s team already has full access, so there&apos;s nothing to check out. Use “Switch person” in the demo bar to try this as a member.</p>
      ) : current === key ? (
        <p className="rounded-xl bg-mist px-4 py-3 text-plum-900">You&apos;re already on {p.name}. <Link href="/community/settings#plan" className="text-amethyst underline underline-offset-2">Manage my plan</Link></p>
      ) : (
        <>
          <div className="mb-4 inline-flex rounded-pill border border-plum-800/15 bg-white p-1" role="group" aria-label="Billing">
            {(["monthly", "annual"] as const).map((b) => (
              <Link key={b} href={`/community/checkout/${key}?billing=${b}`} aria-current={billing === b ? "true" : undefined} className={`inline-flex min-h-11 items-center rounded-pill px-5 text-[0.9rem] capitalize ${billing === b ? "bg-plum-900 text-bone" : "text-plum-900 hover:bg-mist"}`}>{b}</Link>
            ))}
          </div>
          <dl className="space-y-2 text-plum-900">
            <Row k={`${p.name}, billed ${billing === "annual" ? "once a year" : "every month"}`} v={<Price value={price} needs={`${p.name} ${billing} price`} />} />
            {trial > 0 && <Row k={`${trial}-day free trial`} v="Included" />}
            <Row k="Total today" v={trial > 0 ? "$0" : <Price value={price} needs={`${p.name} ${billing} price`} />} strong />
          </dl>
          {trial > 0 && <p className="mt-2 text-[0.88rem] text-plum-700">Your trial ends on {fmtDate(new Date(+now + trial * 864e5).toISOString(), { month: "long", day: "numeric" })}. Cancel before then and you pay nothing.</p>}
          <DemoCard />
          <form method="post" action="/api/community/plan.checkout" className="mt-5">
            <input type="hidden" name="plan" value={key} />
            <input type="hidden" name="billing" value={billing} />
            <input type="hidden" name="back" value={`/community/checkout/${key}?billing=${billing}`} />
            <button className={`${btn} w-full !min-h-14`}>{trial > 0 ? `Start my ${trial}-day free trial (demo)` : `Join ${p.name} (demo)`}</button>
          </form>
        </>
      )}
    </Frame>
  );
}

function Frame({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl">
      <p className="flex items-center gap-2 rounded-xl bg-plum-900 px-4 py-3 text-[0.92rem] text-bone"><Info className="h-4 w-4 shrink-0 text-brass-soft" aria-hidden="true" /> Demo checkout. No card is charged.</p>
      <div className={`${card} mt-4 p-5 sm:p-8`}>
        <p className="eyebrow text-amethyst">Order summary</p>
        <h1 className="mt-1 font-display text-[2.1rem] leading-tight text-plum-900">{title}</h1>
        <p className="mb-5 text-plum-700">{sub}</p>
        {children}
      </div>
      <Link href="/community/upgrade" className="mt-4 inline-flex min-h-11 items-center text-[0.9rem] text-plum-700 hover:text-plum-900">Back to plans</Link>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 ${strong ? "border-t border-plum-800/15 pt-3 text-[1.1rem] font-medium" : ""}`}>
      <dt>{k}</dt>
      <dd className="shrink-0 text-right">{v}</dd>
    </div>
  );
}

function DemoCard() {
  return (
    <div className="mt-6" aria-label="Payment (demo)">
      <p className="text-[0.74rem] font-medium uppercase tracking-[0.14em] text-plum-800">Card</p>
      <div aria-disabled="true" className="mt-1.5 flex min-h-12 items-center gap-3 rounded-xl border border-dashed border-plum-800/25 bg-bone px-4 text-plum-700">
        <CreditCard className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="flex-1 tracking-[0.2em]">•••• •••• •••• ••••</span>
        <Lock className="h-4 w-4 shrink-0" aria-hidden="true" />
      </div>
      <p className="mt-2 text-[0.88rem] text-plum-700">Demo: no card is charged. Square checkout connects at launch.</p>
    </div>
  );
}
