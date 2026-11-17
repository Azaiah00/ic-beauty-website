/** Community home (6.1): what needs the team today, the health numbers, and quick actions. */
import Link from "next/link";
import { ArrowRight, CalendarPlus, Eye, Megaphone, UserPlus } from "lucide-react";
import { Icon3D, MemberAvatar } from "@/components/community/ui";
import { roleLabel } from "@/components/community/Shell";
import { TZ } from "@/lib/community/config";
import { PERSONAS } from "@/lib/community/seed";
import type { Member } from "@/lib/community/types";
import { SITE_URL } from "@/lib/site";
import { communityNeeds, isRegular, monthlyRevenue, planCounts, retention90 } from "@/lib/server/community/admin";
import { shortName } from "@/lib/server/community/core";
import { db } from "@/lib/server/community/store";
import { Ring } from "../ui";
import { Tip, btn, btnGhost, card, field, h2, lbl } from "./shared";

export async function CommunityHome({ actor }: { actor: Member }) {
  const now = new Date();
  const [members, s, purchases, needs] = await Promise.all([db.members(), db.settings(), db.purchases(), communityNeeds()]);
  const counts = planCounts(members, now);
  const regular = members.filter(isRegular);
  const newWeek = members.filter((m) => m.role === "member" && m.state !== "removed" && +now - +new Date(m.joinedAt) < 7 * 864e5).length;
  const activeWeek = regular.filter((m) => +now - +new Date(m.lastSeenAt) < 7 * 864e5).length;
  const retention = retention90(members, now);
  const revenue = monthlyRevenue(members, s, now);
  const month = now.toLocaleDateString("en-CA", { timeZone: TZ }).slice(0, 7);
  const upgrades = purchases.filter((p) => p.kind === "plan" && new Date(p.at).toLocaleDateString("en-CA", { timeZone: TZ }).slice(0, 7) === month).length;
  const hour = Number(now.toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false }));
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const personas = PERSONAS.map((id) => members.find((m) => m.id === id)).filter((m): m is Member => !!m);

  const todo = [
    { n: needs.pending, icon: "check" as const, title: "Approve new people", sub: "People who asked to join and are waiting on you.", none: "No one is waiting.", href: "/admin?view=community-members&filter=pending", go: "Review requests" },
    { n: needs.reported, icon: "megaphone" as const, title: "Reported posts", sub: "Members flagged these. Keep, hide or delete them.", none: "Nothing has been reported.", href: "/admin?view=community-posts#reported", go: "Look at reports" },
    { n: needs.waiting.length, icon: "question" as const, title: "Questions waiting in Ask Iisha", sub: "Asked more than a day ago, with no answer from Iisha yet.", none: "Every question has an answer.", href: "/admin?view=community-posts&cat=ask-iisha#all", go: "See the questions" },
    { n: needs.quiet, icon: "heart" as const, title: "Members who've gone quiet", sub: "No visit in 14 days or more. Quiet members cancel about 3 times as often, so a short hello helps.", none: "Everyone has visited lately.", href: "/admin?view=community-members&filter=quiet", go: "Say hello" },
    { n: needs.failed, icon: "key" as const, title: "Payments that failed", sub: "They keep access for 7 days while it gets fixed.", none: "Every payment went through.", href: "/admin?view=community-members&filter=pastdue", go: "See who" },
  ];

  const Stat = ({ title, value, sub }: { title: string; value: React.ReactNode; sub: React.ReactNode }) => (
    <div className={`${card} p-5`}>
      <p className="text-[0.78rem] font-medium text-plum-700">{title}</p>
      <p className="mt-1 text-[2.1rem] font-light leading-none tabular-nums text-plum-900">{value}</p>
      <p className="mt-2 text-[0.8rem] text-plum-700">{sub}</p>
    </div>
  );

  return (
    <>
      <Tip>Your community at a glance. Start with the cards under “What needs you today”. Everything else can wait.</Tip>

      <section className="mt-6" aria-labelledby="todo-h">
        <h2 id="todo-h" className={h2}>{greet}, {shortName(actor)}. What needs you today</h2>
        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2 xl:grid-cols-3">
          {todo.map(({ n, icon, title, sub, none, href, go }) => (
            <li key={title} className={`${card} flex flex-col p-5 ${n ? "ring-2 ring-amethyst/30" : ""}`}>
              <div className="flex items-start gap-3">
                <Icon3D name={icon} size={52} className={n ? "" : "opacity-60"} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-plum-900">{title}</h3>
                  <p className="mt-0.5 text-[0.86rem] text-plum-700">{n ? sub : none}</p>
                </div>
                <span className="text-[2rem] font-light leading-none tabular-nums text-plum-900" aria-label={`${n} waiting`}>{n}</span>
              </div>
              {n > 0 && (
                <Link href={href} className={`${btn} mt-4 w-full`}>
                  {go} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8" aria-labelledby="health-h">
        <h2 id="health-h" className={h2}>How the community is doing</h2>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className={`${card} flex items-center justify-between gap-4 p-5 sm:col-span-2 xl:col-span-1`}>
            <div className="min-w-0">
              <p className="text-[0.78rem] font-medium text-plum-700">Members by plan</p>
              <p className="mt-1 text-[2.1rem] font-light leading-none tabular-nums text-plum-900">{counts.total}</p>
              <ul className="mt-3 space-y-1 text-[0.86rem] text-plum-800">
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-plum-800/20" /> {s.plans.free.name}: {counts.free}</li>
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-orchid" /> {s.plans.circle.name}: {counts.circle}</li>
                <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-brass" /> {s.plans.inner.name}: {counts.inner}</li>
              </ul>
            </div>
            <div className="text-center">
              <Ring id="comm-paid" value={counts.total ? (counts.circle + counts.inner) / counts.total : 0} label={`${counts.total ? Math.round(((counts.circle + counts.inner) / counts.total) * 100) : 0}%`} size={92} stroke={10} track="rgba(110,63,134,0.12)" from="#9b72b0" to="#6E3F86" text="text-plum-900 text-[0.95rem]!" />
              <p className="mt-1 text-[0.72rem] text-plum-700">on a paid plan</p>
            </div>
          </div>
          <Stat title="New this week" value={newWeek} sub="People who joined in the last 7 days" />
          <Stat title="Active this week" value={activeWeek} sub={`of ${regular.length} members visited in the last 7 days`} />
          <Stat title="90-day retention" value={retention === null ? "–" : `${Math.round(retention * 100)}%`} sub={retention === null ? "Not enough history yet. This fills in once members have been here 90 days. 70%+ = healthy." : "Of members who joined 90+ days ago, how many are still here. 70%+ = healthy."} />
          <div className={`${card} p-5`}>
            <p className="text-[0.78rem] font-medium text-plum-700">Monthly revenue</p>
            {revenue === null ? (
              <>
                <p className="mt-2 text-[0.95rem] text-plum-900">Add your prices in Plans to see revenue.</p>
                <Link href="/admin?view=community-plans" className={`${btnGhost} mt-3`}>Open Plans &amp; prices</Link>
              </>
            ) : (
              <>
                <p className="mt-1 text-[2.1rem] font-light leading-none tabular-nums text-plum-900">${revenue.toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>
                <p className="mt-2 text-[0.8rem] text-plum-700">From active paid members, per month. Trials and gifts aren&apos;t counted. Demo: no card is charged yet.</p>
              </>
            )}
          </div>
          <Stat title="Upgrades this month" value={upgrades} sub="Members who started or changed a paid plan" />
        </div>
      </section>

      <section className="mt-8" aria-labelledby="quick-h">
        <h2 id="quick-h" className={h2}>Quick actions</h2>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-2">
          <div className={`${card} flex flex-col gap-3 p-5`}>
            <a href="/community?compose=1&category=announcements" target="_blank" rel="noopener" className={`${btn} w-full`}>
              <Megaphone className="h-4 w-4" aria-hidden="true" /> Post an announcement
            </a>
            <Link href="/admin?view=community-calendar#new" className={`${btnGhost} w-full`}>
              <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add an event
            </Link>
            <label className={`${lbl} mt-2`}>
              <span className="flex items-center gap-2"><UserPlus className="h-4 w-4 text-amethyst" aria-hidden="true" /> Invite someone: copy this link and send it</span>
              <input readOnly value={`${SITE_URL}/community/about`} className={field} aria-describedby="invite-help" />
            </label>
            <p id="invite-help" className="text-[0.82rem] text-plum-700">Tap the link, select it all and copy. Anyone who opens it can read about the community and join free.</p>
          </div>
          <div className={`${card} p-5`}>
            <h3 className="flex items-center gap-2 font-medium text-plum-900"><Eye className="h-4 w-4 text-amethyst" aria-hidden="true" /> Preview the community as…</h3>
            <p className="mt-1 text-[0.86rem] text-plum-700">Opens the community in a new tab, exactly as that person sees it. Great for practicing.</p>
            <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
              {personas.map((m) => (
                <li key={m.id}>
                  <form method="post" action="/api/community/view-as" target="_blank">
                    <input type="hidden" name="id" value={m.id} />
                    <button className="flex min-h-12 w-full items-center gap-3 rounded-xl border border-plum-800/15 bg-white px-3 text-left transition hover:border-amethyst">
                      <MemberAvatar m={m} size={32} level={false} />
                      <span className="min-w-0">
                        <span className="block truncate text-[0.9rem] text-plum-900">{m.name.split(" (")[0]}</span>
                        <span className="block truncate text-[0.74rem] text-plum-700">{roleLabel(m, s)}</span>
                      </span>
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
