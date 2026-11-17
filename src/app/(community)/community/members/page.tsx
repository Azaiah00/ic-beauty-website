import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { MemberCard } from "@/components/community/members/MemberCard";
import { Empty, PageHead, btn, chip, chipOn, input, label } from "@/components/community/ui";
import { PLAN_ORDER, levelFor } from "@/lib/community/config";
import { effectivePlan, isLive, isStaff } from "@/lib/community/permissions";
import type { PlanKey } from "@/lib/community/types";
import { getMembers, getSettings, isOnline } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";

export const metadata: Metadata = { title: "Members" };
export const dynamic = "force-dynamic";

type Params = { q?: string; plan?: string; online?: string; new?: string; level?: string };

export default async function MembersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const actor = await requireMember();
  const sp = await searchParams;
  const [all, s] = await Promise.all([getMembers(), getSettings()]);
  const now = new Date();
  const staffView = isStaff(actor);
  const q = (sp.q ?? "").trim().toLowerCase();
  const plan = PLAN_ORDER.includes(sp.plan as PlanKey) ? (sp.plan as PlanKey) : "";
  const level = Number(sp.level) >= 1 && Number(sp.level) <= 9 ? Number(sp.level) : 0;

  const live = all.filter((m) => isLive(m));
  const rows = live
    .filter((m) => !q || [m.name, m.city, m.bio].filter(Boolean).join(" ").toLowerCase().includes(q))
    .filter((m) => !plan || (m.role === "member" && (m.showPlan || staffView) && effectivePlan(m, now) === plan))
    .filter((m) => sp.online !== "1" || isOnline(m, now))
    .filter((m) => sp.new !== "1" || +now - +new Date(m.joinedAt) < 7 * 864e5)
    .filter((m) => !level || (m.role === "member" && levelFor(m.points).level === level))
    .sort((a, b) => Number(b.role !== "member") - Number(a.role !== "member") || a.name.localeCompare(b.name));

  /** Link that keeps the other filters and flips one. */
  const href = (patch: Params) => {
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries({ q: sp.q, plan, online: sp.online, new: sp.new, level: level ? String(level) : "", ...patch })) if (v) next[k] = v;
    const qs = new URLSearchParams(next).toString();
    return `/community/members${qs ? `?${qs}` : ""}`;
  };
  const filtered = !!(q || plan || sp.online === "1" || sp.new === "1" || level);
  const levelsInUse = [...new Set(live.filter((m) => m.role === "member").map((m) => levelFor(m.points).level))].sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHead icon="members" eyebrow="Members" title="The Circle" lede={`${live.length} members learning together.`} />

      <form action="/community/members" role="search" className="flex flex-col gap-2 sm:flex-row sm:items-end">
        {plan && <input type="hidden" name="plan" value={plan} />}
        {sp.online === "1" && <input type="hidden" name="online" value="1" />}
        {sp.new === "1" && <input type="hidden" name="new" value="1" />}
        <label className="min-w-0 flex-1">
          <span className={label}>Find a member</span>
          <span className="relative mt-1.5 block">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-700" aria-hidden="true" />
            <input name="q" defaultValue={sp.q} placeholder="Name or city" className={`${input} pl-10`} />
          </span>
        </label>
        <label className="sm:w-52">
          <span className={label}>Level</span>
          <select name="level" defaultValue={level ? String(level) : ""} className={`${input} mt-1.5`}>
            <option value="">Any level</option>
            {levelsInUse.map((n) => <option key={n} value={n}>Level {n} · {s.levelNames[n - 1]}</option>)}
          </select>
        </label>
        <button className={btn}>Search</button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filters">
        <Link href="/community/members" aria-current={!filtered ? "true" : undefined} className={!filtered ? chipOn : chip}>Everyone</Link>
        {PLAN_ORDER.map((p) => (
          <Link key={p} href={href({ plan: plan === p ? "" : p })} aria-current={plan === p ? "true" : undefined} className={plan === p ? chipOn : chip}>{s.plans[p].name.replace(" Member", "")}</Link>
        ))}
        <Link href={href({ online: sp.online === "1" ? "" : "1" })} aria-current={sp.online === "1" ? "true" : undefined} className={sp.online === "1" ? chipOn : chip}>Online now</Link>
        <Link href={href({ new: sp.new === "1" ? "" : "1" })} aria-current={sp.new === "1" ? "true" : undefined} className={sp.new === "1" ? chipOn : chip}>New this week</Link>
      </div>
      {plan && !staffView && <p className="mt-2 text-[0.84rem] text-plum-700">Showing members who choose to show their plan.</p>}

      {rows.length === 0 ? (
        <div className="mt-6">
          <Empty title="No one matches that yet">Try a different name, or <Link href="/community/members" className="text-amethyst underline underline-offset-2">see everyone</Link>.</Empty>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
          {rows.map((m) => <MemberCard key={m.id} m={m} s={s} staffView={staffView} online={isOnline(m, now)} />)}
        </ul>
      )}
    </div>
  );
}
