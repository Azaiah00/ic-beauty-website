import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Lock, MapPin, MessageCircle, Pencil, Target } from "lucide-react";
import { MemberPills, joined } from "@/components/community/members/MemberCard";
import { MemberAvatar, MemberName, Pill, btn, btnGhost, card, timeAgo } from "@/components/community/ui";
import { BADGES, levelFor } from "@/lib/community/config";
import { can, isLive, isStaff, reason } from "@/lib/community/permissions";
import { getSettings, isOnline, visiblePosts } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Member profile" };
export const dynamic = "force-dynamic";

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireMember();
  const { id } = await params;
  const [m, s, posts] = await Promise.all([db.member(id), getSettings(), visiblePosts(actor)]);
  const staffView = isStaff(actor);
  if (!m || (!isLive(m) && !staffView)) notFound();
  const now = new Date();
  const own = m.id === actor.id;
  const lv = levelFor(m.points);
  const recent = posts.filter((p) => p.authorId === m.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const cats = new Map(s.categories.map((c) => [c.id, c.name]));

  // Message: the team inbox for team members, a direct message for members. Both sides' plans must allow it.
  const toTeam = m.role !== "member";
  const allowed = !own && (toTeam && !staffView ? can(actor, "message.team") : can(actor, "message.member", m));
  const thread = toTeam && !staffView ? `team:${actor.id}` : `dm:${[actor.id, m.id].sort().join(":")}`;
  const why = !own && !allowed ? (toTeam ? reason(actor, "message.team") : reason(actor, "message.member", m)) : "";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/community/members" className="inline-flex min-h-11 items-center gap-2 text-[0.9rem] text-plum-700 hover:text-plum-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All members
      </Link>

      <section className={`${card} mt-2 p-5 sm:p-8`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <MemberAvatar m={m} size={84} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[2.2rem] leading-tight text-plum-900"><MemberName m={m} /></h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.9rem] text-plum-700">
              <span>Joined {joined(m.joinedAt)}</span>
              {m.city && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {m.city}</span>}
            </p>
            <div className="mt-3"><MemberPills m={m} s={s} staffView={staffView} online={isOnline(m, now)} /></div>
            {m.bio && <p className="mt-4 text-plum-800">{m.bio}</p>}
            {m.hairGoal && (
              <p className="mt-3 flex items-start gap-2.5 rounded-xl bg-mist px-4 py-3 text-plum-900">
                <Target className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
                <span><span className="eyebrow block text-[0.62rem] text-plum-700">Hair goal</span>{m.hairGoal}</span>
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {own && <Link href="/community/settings" className={btnGhost}><Pencil className="h-4 w-4" aria-hidden="true" /> Edit profile</Link>}
              {allowed && <Link href={`/community/messages?thread=${encodeURIComponent(thread)}`} className={btn}><MessageCircle className="h-4 w-4" aria-hidden="true" /> Message</Link>}
              {staffView && <Link href={`/admin?view=community-members&q=${encodeURIComponent(m.name)}`} className="inline-flex min-h-11 items-center px-2 text-[0.86rem] text-amethyst underline underline-offset-2">Open in dashboard</Link>}
            </div>
            {why && (
              <p className="mt-4 flex items-start gap-2.5 text-[0.9rem] text-plum-700">
                <Lock className="mt-1 h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" />
                <span>{why} <Link href="/community/upgrade" className="text-amethyst underline underline-offset-2">See plans</Link></span>
              </p>
            )}
          </div>
        </div>
      </section>

      {m.role === "member" && (
        <section className={`${card} mt-4 p-5 sm:p-6`} aria-labelledby="level-h">
          <h2 id="level-h" className="font-display text-[1.4rem] text-plum-900">Level {lv.level} · {s.levelNames[lv.level - 1]}</h2>
          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-mist" role="img" aria-label={lv.next === null ? "Top level reached" : `${lv.toGo} points to Level ${lv.level + 1}`}>
            <div className="h-full rounded-full bg-amethyst" style={{ width: `${Math.round(lv.progress * 100)}%` }} />
          </div>
          <p className="mt-2 text-[0.88rem] text-plum-700">
            {m.points} points{lv.next !== null ? ` · ${lv.toGo} to go until Level ${lv.level + 1}, ${s.levelNames[lv.level]}` : " · the top level"}.{" "}
            <Link href="/community/leaderboards#how" className="text-amethyst underline underline-offset-2">How points work</Link>
          </p>
        </section>
      )}

      {m.badges.length > 0 && (
        <section className={`${card} mt-4 p-5 sm:p-6`} aria-labelledby="badges-h">
          <h2 id="badges-h" className="font-display text-[1.4rem] text-plum-900">Badges</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {m.badges.map((b) => (
              <li key={b}><Pill tone="brass"><Award className="h-3.5 w-3.5" aria-hidden="true" /> {BADGES[b] ?? b}</Pill></li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6" aria-labelledby="posts-h">
        <h2 id="posts-h" className="font-display text-[1.6rem] text-plum-900">Recent posts</h2>
        {recent.length === 0 ? (
          <p className={`${card} mt-3 p-5 text-plum-700`}>{own ? "You haven't posted yet. Share a win or ask a question in the feed." : "Nothing posted yet."}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {recent.map((p) => (
              <li key={p.id}>
                <Link href={`/community/post/${p.id}`} className={`${card} block min-h-11 p-4 transition hover:border-amethyst`}>
                  <span className="block font-medium text-plum-900">{p.title}</span>
                  <span className="block text-[0.84rem] text-plum-700">{cats.get(p.categoryId)} · {timeAgo(p.createdAt, now)} · {p.likes.length} {p.likes.length === 1 ? "like" : "likes"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
