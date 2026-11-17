/** Read helpers for the owner dashboard's Community section. Server-only. Changes still go through actions.ts. */
import { cache } from "react";
import { priceNumber } from "@/lib/community/config";
import { effectivePlan, isLive } from "@/lib/community/permissions";
import type { Member, PlanKey, Settings } from "@/lib/community/types";
import { db } from "./store";

export const QUIET_DAYS = 14;

/** A regular member (not the team) with a working membership. */
export const isRegular = (m: Member) => m.role === "member" && isLive(m);
export const isQuiet = (m: Member, now = new Date()) => isRegular(m) && +now - +new Date(m.lastSeenAt) > QUIET_DAYS * 864e5;

/** Small numbers for the sidebar badges and the "What needs you today" cards. */
export const communityNeeds = cache(async () => {
  const now = new Date();
  const [members, posts, comments] = await Promise.all([db.members(), db.posts(), db.comments()]);
  const ownerIds = new Set(members.filter((m) => m.role === "owner").map((m) => m.id));
  const answered = new Set(comments.filter((c) => ownerIds.has(c.authorId)).map((c) => c.postId));
  const waiting = posts.filter((p) => p.categoryId === "ask-iisha" && !p.hidden && +now - +new Date(p.createdAt) > 24 * 36e5 && !answered.has(p.id));
  return {
    pending: members.filter((m) => m.state === "pending").length,
    reported: posts.filter((p) => p.reports.length > 0).length,
    waiting,
    quiet: members.filter((m) => isQuiet(m, now)).length,
    failed: members.filter((m) => m.state === "past_due").length,
  };
});

export function planCounts(members: Member[], now = new Date()) {
  const regular = members.filter(isRegular);
  const by = (p: PlanKey) => regular.filter((m) => effectivePlan(m, now) === p).length;
  return { total: regular.length, free: by("free"), circle: by("circle"), inner: by("inner") };
}

/**
 * Monthly revenue, only when Iisha's prices are set (never guessed). Annual members count as price / 12.
 * Trials, gifts, canceled and past-due members are left out.
 */
export function monthlyRevenue(members: Member[], s: Settings, now = new Date()): number | null {
  if (priceNumber(s.plans.circle.monthly) === null || priceNumber(s.plans.inner.monthly) === null) return null;
  let sum = 0;
  for (const m of members) {
    if (m.role !== "member" || m.state !== "active" || m.plan === "free") continue;
    if (m.trialEndsAt && +new Date(m.trialEndsAt) > +now) continue;
    const p = s.plans[m.plan];
    const annual = priceNumber(p.annual);
    sum += m.billing === "annual" && annual !== null ? annual / 12 : priceNumber(p.monthly) ?? 0;
  }
  return sum;
}

/** Of members who joined 90+ days ago, the share who still have a working membership. null = not enough history. */
export function retention90(members: Member[], now = new Date()): number | null {
  const old = members.filter((m) => m.role === "member" && m.state !== "pending" && +now - +new Date(m.joinedAt) >= 90 * 864e5);
  if (!old.length) return null;
  return old.filter((m) => isLive(m)).length / old.length;
}
