import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { CancelFlow, PhotoButton } from "@/components/community/settings";
import { roleLabel } from "@/components/community/Shell";
import { MemberAvatar, PageHead, PlanPill, Price, btn, btnBrass, btnGhost, card, input, label } from "@/components/community/ui";
import { GRACE_DAYS, TZ } from "@/lib/community/config";
import { effectivePlan } from "@/lib/community/permissions";
import { fmtDate } from "@/lib/server/community/core";
import { getSettings } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Settings & plan" };
export const dynamic = "force-dynamic";

const ZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Phoenix", "America/Los_Angeles", "America/Anchorage", "Pacific/Honolulu", "Europe/London"];
const day = { month: "long", day: "numeric", year: "numeric" } as const;

export default async function SettingsPage() {
  const actor = await requireMember();
  const [s, purchases] = await Promise.all([getSettings(), db.purchases()]);
  const now = new Date();
  const plan = effectivePlan(actor, now);
  const mine = purchases.filter((p) => p.memberId === actor.id).sort((a, b) => b.at.localeCompare(a.at));
  const zones = [...new Set([actor.timeZone ?? TZ, ...ZONES])];
  const prefs = actor.emailPrefs ?? { replies: true, lessons: true, events: true, digest: true };
  const member = actor.role === "member";
  const trial = actor.trialEndsAt && +new Date(actor.trialEndsAt) > +now;
  const giftOn = actor.gift && +new Date(actor.gift.until) > +now;
  const back = (hash: string) => <input type="hidden" name="back" value={`/community/settings${hash}`} />;
  const h2 = "font-display text-[1.6rem] text-plum-900";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHead icon="key" title="Settings & plan" lede="Your profile, your time zone, and your membership." />

      <section className={`${card} p-5 sm:p-7`} aria-labelledby="profile-h">
        <h2 id="profile-h" className={h2}>My profile</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <MemberAvatar m={actor} size={72} />
          <PhotoButton hasPhoto={!!actor.photo} />
        </div>
        <form method="post" action="/api/community/profile.save" className="mt-5 space-y-4">
          {back("")}
          <input type="hidden" name="_plan" value="1" />
          <label className={label}>Name<input name="name" defaultValue={actor.name} required maxLength={80} className={`${input} mt-1.5 normal-case tracking-normal`} /></label>
          <label className={label}>City or region (optional)<input name="city" defaultValue={actor.city} maxLength={80} className={`${input} mt-1.5 normal-case tracking-normal`} /></label>
          <label className={label}>Short bio (optional)<textarea name="bio" defaultValue={actor.bio} rows={2} maxLength={400} className={`${input} mt-1.5 normal-case tracking-normal`} /></label>
          <label id="goal" className={`${label} scroll-mt-40`}>My hair goal<input name="hairGoal" defaultValue={actor.hairGoal} maxLength={200} placeholder="One sentence is perfect" className={`${input} mt-1.5 normal-case tracking-normal`} /></label>
          <label className={label}>Time zone (for the calendar)
            <select name="timeZone" defaultValue={actor.timeZone ?? TZ} className={`${input} mt-1.5 normal-case tracking-normal`}>{zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}</select>
          </label>
          {member && (
            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-plum-900">
              <input type="checkbox" name="showPlan" defaultChecked={actor.showPlan} className="h-5 w-5 accent-amethyst" /> Show my plan next to my name
            </label>
          )}
          <button className={btn}>Save profile</button>
        </form>
      </section>

      <section id="plan" className={`${card} scroll-mt-40 p-5 sm:p-7`} aria-labelledby="plan-h">
        <h2 id="plan-h" className={h2}>Plan &amp; billing</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <PlanPill plan={plan} name={s.plans[plan].name} />
          <span className="text-plum-700">{roleLabel(actor, s)}</span>
        </div>
        {!member ? (
          <p className="mt-3 text-plum-700">Iisha&apos;s team has full access to everything. There&apos;s no plan to manage.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-1.5 text-plum-900">
              {plan !== "free" && <li>Price: <Price value={s.plans[plan][actor.billing ?? "monthly"]} needs={`${s.plans[plan].name} price`} suffix={actor.billing === "annual" ? " a year" : " a month"} /> · billed {actor.billing === "annual" ? "once a year" : "monthly"}</li>}
              {trial && <li>Your free trial ends on <strong>{fmtDate(actor.trialEndsAt!, day)}</strong>.</li>}
              {actor.state === "active" && plan !== "free" && !trial && actor.periodEndsAt && <li>Next renewal: <strong>{fmtDate(actor.periodEndsAt, day)}</strong></li>}
              {actor.state === "canceled" && actor.periodEndsAt && <li>Your membership is canceled. You have access until <strong>{fmtDate(actor.periodEndsAt, day)}</strong>.</li>}
              {actor.state === "past_due" && actor.pastDueSince && <li>Your last payment didn&apos;t go through. Your access stays on until <strong>{fmtDate(new Date(+new Date(actor.pastDueSince) + GRACE_DAYS * 864e5).toISOString(), day)}</strong>.</li>}
              {giftOn && <li>A gift from Iisha: {s.plans[actor.gift!.plan].name} until <strong>{fmtDate(actor.gift!.until, day)}</strong>.</li>}
            </ul>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {plan !== "inner" && actor.state !== "past_due" && <Link href="/community/upgrade" className={btnBrass}>{plan === "free" ? "See plans" : `Upgrade to ${s.plans.inner.name}`}</Link>}
              {(actor.state === "canceled" || actor.state === "past_due") && (
                <form method="post" action="/api/community/plan.resume">
                  {back("#plan")}
                  <button className={btn}>{actor.state === "past_due" ? "Update payment (demo)" : "Keep my membership"}</button>
                </form>
              )}
              {actor.state === "active" && actor.plan !== "free" && (
                <form method="post" action="/api/community/billing.switch">
                  {back("#plan")}
                  <input type="hidden" name="billing" value={actor.billing === "annual" ? "monthly" : "annual"} />
                  <button className={btnGhost}>Switch to {actor.billing === "annual" ? "monthly" : "annual"} billing</button>
                </form>
              )}
            </div>
            {actor.state === "active" && (actor.plan === "circle" || actor.plan === "inner") && (
              <div className="mt-4">
                <CancelFlow plan={actor.plan} planName={s.plans[actor.plan].name} circleName={s.plans.circle.name} until={fmtDate(actor.periodEndsAt && +new Date(actor.periodEndsAt) > +now ? actor.periodEndsAt : now.toISOString(), { month: "long", day: "numeric" })} />
              </div>
            )}
            <p className="mt-4 text-[0.86rem] text-plum-700">Demo: no card is charged. Square checkout connects at launch.</p>
          </>
        )}

        <h3 className="mt-7 font-display text-[1.25rem] text-plum-900">Purchase history</h3>
        {mine.length === 0 ? (
          <p className="mt-1 text-plum-700">Nothing yet. Plans and programs you buy show up here.</p>
        ) : (
          <ul className="mt-2 divide-y divide-plum-800/10">
            {mine.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="min-w-0 text-plum-900">{p.label}<span className="block text-[0.82rem] text-plum-700">{fmtDate(p.at)}{p.billing ? ` · ${p.billing}` : ""}{p.demo ? " · Demo" : ""}</span></span>
                <span className="shrink-0"><Price value={p.amount} /></span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={`${card} p-5 sm:p-7`} aria-labelledby="email-h">
        <h2 id="email-h" className={h2}>Email me about</h2>
        <p className="text-[0.9rem] text-plum-700">Demo: your choices are saved, and emails begin at launch.</p>
        <form method="post" action="/api/community/profile.save" className="mt-3">
          {back("")}
          <input type="hidden" name="_prefs" value="1" />
          {([["prefReplies", "replies", "Replies and mentions"], ["prefLessons", "lessons", "New lessons"], ["prefEvents", "events", "Events starting soon"], ["prefDigest", "digest", "A weekly summary"]] as const).map(([name, key, text]) => (
            <label key={name} className="flex min-h-11 cursor-pointer items-center gap-3 text-plum-900"><input type="checkbox" name={name} defaultChecked={prefs[key] !== false} className="h-5 w-5 accent-amethyst" /> {text}</label>
          ))}
          <button className={`${btnGhost} mt-3`}>Save email choices</button>
        </form>
      </section>

      <section className={`${card} p-5 sm:p-7`} aria-labelledby="data-h">
        <h2 id="data-h" className={h2}>My data</h2>
        <p className="text-plum-700">A copy of your profile, progress, posts, comments and purchases.</p>
        <a href="/api/community/my-data" className={`${btnGhost} mt-3`}><Download className="h-4 w-4" aria-hidden="true" /> Download my data</a>
        <form method="post" action="/api/community/logout" className="mt-6 border-t border-plum-800/10 pt-4">
          <button className="min-h-11 text-plum-700 underline underline-offset-4 hover:text-plum-900">Sign out</button>
        </form>
      </section>
    </div>
  );
}
