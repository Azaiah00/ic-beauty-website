import type { Metadata } from "next";
import { Heart, KeyRound } from "lucide-react";
import { Board } from "@/components/community/leaderboards/Board";
import { PageHead, card } from "@/components/community/ui";
import { LEVEL_POINTS, LEVEL_UNLOCKS, POINTS, levelFor } from "@/lib/community/config";
import { isLive } from "@/lib/community/permissions";
import { getMembers, getSettings, leaderboard } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";

export const metadata: Metadata = { title: "Leaderboards" };
export const dynamic = "force-dynamic";

export default async function LeaderboardsPage() {
  const actor = await requireMember();
  const now = new Date();
  const [s, members, week, month, allTime] = await Promise.all([getSettings(), getMembers(), leaderboard(7, now), leaderboard(30, now), leaderboard(0, now)]);
  const regular = members.filter((m) => m.role === "member" && isLive(m));
  const myLevel = levelFor(actor.points).level;
  const dist = LEVEL_POINTS.map((pts, i) => {
    const n = regular.filter((m) => levelFor(m.points).level === i + 1).length;
    return { level: i + 1, pts, n, pct: regular.length ? Math.round((n / regular.length) * 100) : 0 };
  });
  const extras = [
    s.points.lesson && `+${POINTS.lesson} for every lesson you complete`,
    s.points.checkin && `+${POINTS.checkin} for your weekly check-in`,
    s.points.lab && `+${POINTS.lab} the first time you finish a Lab`,
  ].filter((x): x is string => !!x);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHead icon="leaderboards" eyebrow="Leaderboards" title="Who's showing up" lede="Points come from the community cheering you on. Every like you receive counts." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Board title="Last 7 days" sub="Points earned this week" rows={week} me={actor} windowed />
        <Board title="Last 30 days" sub="Points earned this month" rows={month} me={actor} windowed />
        <Board title="All time" sub="Total points" rows={allTime} me={actor} windowed={false} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className={`${card} p-5 sm:p-6`} aria-labelledby="levels-h">
          <h2 id="levels-h" className="font-display text-[1.6rem] text-plum-900">Levels</h2>
          <p className="text-[0.88rem] text-plum-700">Where the Circle is right now, and what each level opens.</p>
          <ol className="mt-4 space-y-3">
            {dist.map((d) => (
              <li key={d.level} className={`rounded-xl p-3 ${actor.role === "member" && d.level === myLevel ? "bg-lilac/40 ring-1 ring-amethyst" : "bg-mist/60"}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brass text-[0.9rem] font-semibold text-plum-950" aria-hidden="true">{d.level}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-plum-900">
                      <span className="sr-only">Level {d.level}: </span>
                      <span className="font-medium">{s.levelNames[d.level - 1]}</span>
                      {actor.role === "member" && d.level === myLevel && <span className="text-plum-700"> · you are here</span>}
                    </p>
                    <p className="text-[0.82rem] text-plum-700">{d.pts.toLocaleString("en-US")} points · {d.pct}% of members</p>
                  </div>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper" aria-hidden="true">
                  <div className="h-full rounded-full bg-amethyst" style={{ width: `${d.pct}%` }} />
                </div>
                {LEVEL_UNLOCKS[d.level] && (
                  <p className="mt-2 flex items-center gap-2 text-[0.86rem] text-plum-900">
                    <KeyRound className="h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" /> Unlocks: {LEVEL_UNLOCKS[d.level]}
                  </p>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section id="how" className={`${card} scroll-mt-36 self-start p-5 sm:p-6`} aria-labelledby="how-h">
          <h2 id="how-h" className="font-display text-[1.6rem] text-plum-900">How points work</h2>
          <p className="mt-3 flex items-start gap-3 text-plum-900">
            <Heart className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
            <span><strong>+{POINTS.like} point</strong> for every like you receive on a post or a comment. Share something real and the Circle lifts you up.</span>
          </p>
          {extras.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-9 text-plum-800">
              {extras.map((x) => <li key={x}>{x}</li>)}
            </ul>
          )}
          <p className="mt-4 text-[0.9rem] text-plum-700">Points add up to levels, and some levels open extras for free members. Liking your own posts doesn&apos;t count.</p>
          <p className="mt-2 text-[0.9rem] text-plum-700">Iisha, her admins and moderators don&apos;t appear on the leaderboards. This space is for you.</p>
        </section>
      </div>
    </div>
  );
}
