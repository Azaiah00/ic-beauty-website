/** Server pieces of the community shell: the demo bar, the right rail, and the feed-width page frame. */
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Circle, Info } from "lucide-react";
import { CHECKLIST, TZ, levelFor } from "@/lib/community/config";
import { occurrences } from "@/lib/community/calendar";
import { effectivePlan, isAdmin, type Actor } from "@/lib/community/permissions";
import type { Member, Settings } from "@/lib/community/types";
import { img } from "@/lib/images";
import { SITE_URL } from "@/lib/site";
import { db } from "@/lib/server/community/store";
import { getSettings, leaderboard, memberCounts } from "@/lib/server/community/queries";
import { CopyLink } from "./nav";
import { Icon3D, MemberAvatar, PlanPill, btnBrass, card } from "./ui";

export function roleLabel(m: Member, s: Settings) {
  if (m.state === "pending") return "Waiting for approval";
  if (m.state === "paused") return "Access paused";
  if (m.state === "removed") return "Removed";
  if (m.role === "owner") return "Owner";
  if (m.role === "admin") return "Admin";
  if (m.role === "moderator") return "Moderator";
  const plan = s.plans[effectivePlan(m)].name;
  return m.state === "past_due" ? `${plan}, payment past due` : m.state === "canceled" ? `${plan}, canceled` : m.trialEndsAt && +new Date(m.trialEndsAt) > Date.now() ? `${plan}, free trial` : plan;
}

/** "Demo preview · You're viewing as Tasha (Circle Member) · Switch person · Reset demo" */
export function DemoBar({ actor, s }: { actor: Actor; s: Settings }) {
  return (
    <div className="bg-plum-900 text-lilac">
      <div className="mx-auto flex w-full max-w-[76rem] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5 text-[0.8rem] sm:px-6">
        <p className="flex min-w-0 flex-1 items-center gap-2">
          <Info className="h-3.5 w-3.5 shrink-0 text-brass-soft" aria-hidden="true" />
          <span className="truncate">
            Demo preview · {actor ? <>You&apos;re viewing as <strong className="text-bone">{actor.name.split(" (")[0]}</strong> ({roleLabel(actor, s)})</> : "You're viewing as a guest"}
          </span>
        </p>
        <Link href="/community/login" className="inline-flex min-h-9 items-center rounded-pill border border-lilac/40 px-3 text-bone hover:bg-plum-800">
          Switch person
        </Link>
        {isAdmin(actor) && (
          <details className="relative">
            <summary className="inline-flex min-h-9 cursor-pointer list-none items-center rounded-pill border border-lilac/40 px-3 text-bone hover:bg-plum-800 [&::-webkit-details-marker]:hidden">Reset demo</summary>
            <form method="post" action="/api/community/demo.reset" className="absolute right-0 top-full z-50 mt-2 w-72 rounded-card bg-paper p-4 text-plum-900 shadow-2xl">
              <input type="hidden" name="back" value="/community" />
              <p className="text-[0.92rem]">This puts every member, post and setting back to the sample starting point. Anything you practiced will be cleared.</p>
              <button className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-pill bg-plum-900 px-5 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst">Yes, reset the demo</button>
            </form>
          </details>
        )}
      </div>
    </div>
  );
}

const fmtWhen = (d: Date, tz: string) => d.toLocaleString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

/** Right rail on desktop: the community card, your plan, your first steps, what's next, who's leading. */
export async function Rail({ actor }: { actor: Member }) {
  const now = new Date();
  const [s, counts, events, leaders] = await Promise.all([getSettings(), memberCounts(now), db.events(), leaderboard(30, now)]);
  const plan = effectivePlan(actor, now);
  const lv = levelFor(actor.points);
  const cover = img(s.cover) ?? img("funnel-community");
  const left = CHECKLIST.filter((c) => !actor.checklist[c.key]);
  const upcoming = events
    .flatMap((e) => occurrences(e, now, 1).map((d) => ({ e, d })))
    .sort((a, b) => +a.d - +b.d)
    .slice(0, 3);
  return (
    <aside aria-label="Community overview" className="hidden space-y-4 lg:block">
      <section className={`${card} overflow-hidden`}>
        <div className="relative h-24 bg-plum-800">{cover && <Image src={cover} alt="" fill sizes="304px" className="object-cover" />}</div>
        <div className="p-5">
          <h2 className="font-display text-[1.35rem] leading-tight text-plum-900">{s.name}</h2>
          <p className="mt-1 text-[0.88rem] text-plum-700">{s.promise}</p>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="rounded-xl bg-mist py-2">
              <dd className="text-[1.3rem] leading-none text-plum-900">{counts.total}</dd>
              <dt className="mt-1 text-[0.7rem] uppercase tracking-[0.1em] text-plum-700">Members</dt>
            </div>
            <div className="rounded-xl bg-mist py-2">
              <dd className="text-[1.3rem] leading-none text-plum-900">{counts.online}</dd>
              <dt className="mt-1 text-[0.7rem] uppercase tracking-[0.1em] text-plum-700">Online now</dt>
            </div>
          </dl>
          <CopyLink url={`${SITE_URL}/community/about`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-pill border border-plum-900/25 px-5 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-plum-900 hover:border-plum-900" />
        </div>
      </section>

      <section className={`${card} p-5`}>
        <div className="flex items-center gap-3">
          <MemberAvatar m={actor} />
          <div className="min-w-0">
            <p className="truncate font-medium text-plum-900">{actor.name.split(" (")[0]}</p>
            <PlanPill plan={plan} name={s.plans[plan].name} />
          </div>
        </div>
        {actor.role === "member" && (
          <>
            <p className="mt-4 text-[0.86rem] text-plum-700">
              Level {lv.level} · {s.levelNames[lv.level - 1]} · {actor.points} points
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist" role="img" aria-label={lv.next === null ? "Top level reached" : `${lv.toGo} points to Level ${lv.level + 1}`}>
              <div className="h-full rounded-full bg-amethyst" style={{ width: `${Math.round(lv.progress * 100)}%` }} />
            </div>
            {lv.next !== null && <p className="mt-1.5 text-[0.8rem] text-plum-700">{lv.toGo} points to Level {lv.level + 1}</p>}
          </>
        )}
        {actor.role === "member" && plan !== "inner" && (
          <Link href="/community/upgrade" className={`${btnBrass} mt-4 w-full`}>
            {plan === "free" ? `Try ${s.plans.circle.name.replace(" Member", "")} free` : `See ${s.plans.inner.name}`}
          </Link>
        )}
      </section>

      {left.length > 0 && actor.role === "member" && (
        <section className={`${card} p-5`}>
          <h2 className="flex items-center gap-2 font-display text-[1.25rem] text-plum-900"><Icon3D name="check" size={30} /> Start Here</h2>
          <p className="text-[0.84rem] text-plum-700">{CHECKLIST.length - left.length} of {CHECKLIST.length} done</p>
          <ul className="mt-3 space-y-1">
            {CHECKLIST.map((c) => (
              <li key={c.key}>
                <Link href={c.href} className="flex min-h-10 items-center gap-2.5 rounded-lg text-[0.9rem] text-plum-900 hover:text-amethyst">
                  {actor.checklist[c.key] ? <CheckCircle2 className="h-4 w-4 shrink-0 text-sage" aria-hidden="true" /> : <Circle className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />}
                  <span className={actor.checklist[c.key] ? "text-plum-700 line-through" : ""}>{c.label}</span>
                  {actor.checklist[c.key] && <span className="sr-only">(done)</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className={`${card} p-5`}>
        <h2 className="flex items-center gap-2 font-display text-[1.25rem] text-plum-900">
          <Icon3D name="calendar" size={30} /> Coming up
        </h2>
        <ul className="mt-3 space-y-3">
          {upcoming.map(({ e, d }) => (
            <li key={e.id}>
              <Link href="/community/calendar" className="block hover:text-amethyst">
                <span className="block text-[0.92rem] text-plum-900">{e.title}</span>
                <span className="block text-[0.8rem] text-plum-700">{fmtWhen(d, actor.timeZone ?? TZ)}{e.sample ? " · Sample" : ""}</span>
              </Link>
            </li>
          ))}
          {upcoming.length === 0 && <li className="text-[0.88rem] text-plum-700">Nothing on the calendar yet.</li>}
        </ul>
      </section>

      <section className={`${card} p-5`}>
        <h2 className="flex items-center gap-2 font-display text-[1.25rem] text-plum-900">
          <Icon3D name="leaderboards" size={30} /> Leaderboard, 30 days
        </h2>
        <ol className="mt-3 space-y-2.5">
          {leaders.slice(0, 5).map((r, i) => (
            <li key={r.member.id} className="flex items-center gap-2.5 text-[0.9rem]">
              <span className="w-4 text-right tabular-nums text-plum-700">{i + 1}</span>
              <MemberAvatar m={r.member} size={30} level={false} />
              <Link href={`/community/members/${r.member.id}`} className="min-w-0 flex-1 truncate text-plum-900 hover:text-amethyst">{r.member.name}</Link>
              <span className="tabular-nums text-plum-700">+{r.points}</span>
            </li>
          ))}
        </ol>
        <Link href="/community/leaderboards" className="mt-3 inline-flex min-h-10 items-center text-[0.8rem] font-medium uppercase tracking-[0.12em] text-amethyst hover:text-plum-900">See all</Link>
      </section>
    </aside>
  );
}

/** Feed-width content with the right rail beside it on desktop. */
export function WithRail({ actor, children }: { actor: Member; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-full max-w-[46rem] grid-cols-[minmax(0,1fr)] gap-8 lg:max-w-none lg:grid-cols-[minmax(0,46rem)_19rem] lg:justify-center">
      <div className="min-w-0">{children}</div>
      <Rail actor={actor} />
    </div>
  );
}
