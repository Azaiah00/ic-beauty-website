/** Read-side helpers for community pages. Server-only. Pages read through here; changes go through actions.ts. */
import { cache } from "react";
import { can, effectivePlan, isLive, isStaff, type Actor } from "@/lib/community/permissions";
import type { Member, Message, Post } from "@/lib/community/types";
import { db } from "./store";

export const getSettings = cache(() => db.settings());
export const getMembers = cache(() => db.members());
export const memberMap = cache(async () => new Map((await getMembers()).map((m) => [m.id, m])));

/** Online = seen in the last 15 minutes. */
export const isOnline = (m: Member, now = new Date()) => +now - +new Date(m.lastSeenAt) < 15 * 60e3;

export type Thread = { id: string; title: string; other: Member | null; last: Message; unread: number; team: boolean };

/** Conversations this person can see: their own team thread and DMs; the team sees every team thread. */
export const threadsFor = cache(async (actorId: string): Promise<Thread[]> => {
  const [all, members] = await Promise.all([db.messages(), memberMap()]);
  const actor = members.get(actorId);
  if (!actor) return [];
  const staff = isStaff(actor);
  const by = new Map<string, Message[]>();
  for (const m of all) {
    const mine = m.threadId === `team:${actor.id}` || (m.threadId.startsWith("team:") && staff) || (m.threadId.startsWith("dm:") && m.threadId.split(":").includes(actor.id));
    if (mine) by.set(m.threadId, [...(by.get(m.threadId) ?? []), m]);
  }
  return [...by.entries()]
    .map(([id, msgs]) => {
      msgs.sort((a, b) => a.at.localeCompare(b.at));
      const team = id.startsWith("team:");
      const otherId = team ? id.slice(5) : id.split(":").slice(1).find((x) => x !== actor.id) ?? "";
      const other = members.get(otherId) ?? null;
      const title = team && otherId === actor.id ? "Iisha's team" : other?.name ?? "Member";
      return { id, title, other: team && otherId === actor.id ? null : other, last: msgs[msgs.length - 1], unread: msgs.filter((m) => m.fromId !== actor.id && !m.readBy.includes(actor.id)).length, team };
    })
    .sort((a, b) => b.last.at.localeCompare(a.last.at));
});

export const inboxCounts = cache(async (actorId: string) => {
  const [notifs, threads] = await Promise.all([db.notifications(actorId), threadsFor(actorId)]);
  return { notifications: notifs.filter((n) => !n.read).length, messages: threads.reduce((a, t) => a + t.unread, 0) };
});

/** Posts this person may see, with hidden ones kept for the team only. */
export async function visiblePosts(actor: Actor): Promise<Post[]> {
  const [posts, s] = await Promise.all([db.posts(), getSettings()]);
  const cats = new Map(s.categories.map((c) => [c.id, c]));
  return posts.filter((p) => {
    const cat = cats.get(p.categoryId);
    return cat && can(actor, "category.view", cat) && (!p.hidden || isStaff(actor));
  });
}

/** Leaderboard rows for a window in days (0 = all time). The owner, admins and moderators are left out. */
export async function leaderboard(windowDays: number, now = new Date()) {
  const [members, progress] = await Promise.all([getMembers(), db.allProgress()]);
  const since = windowDays ? +now - windowDays * 864e5 : 0;
  const log = new Map(progress.map((p) => [p.memberId, p.pointLog]));
  return members
    .filter((m) => m.role === "member" && isLive(m))
    .map((m) => ({ member: m, points: windowDays ? Math.max(0, (log.get(m.id) ?? []).filter((e) => +new Date(e.at) >= since).reduce((a, e) => a + e.n, 0)) : m.points }))
    .filter((r) => r.points > 0)
    .sort((a, b) => b.points - a.points || a.member.name.localeCompare(b.member.name));
}

export async function memberCounts(now = new Date()) {
  const members = (await getMembers()).filter((m) => isLive(m));
  return { total: members.length, online: members.filter((m) => isOnline(m, now)).length, byPlan: { free: members.filter((m) => m.role === "member" && effectivePlan(m, now) === "free").length, circle: members.filter((m) => m.role === "member" && effectivePlan(m, now) === "circle").length, inner: members.filter((m) => m.role === "member" && effectivePlan(m, now) === "inner").length } };
}
