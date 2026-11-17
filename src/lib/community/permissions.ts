/**
 * THE ONE POLICY MODULE. Every page, API route and service call asks `can()` before it shows or changes
 * anything. Hiding a button is never the protection; this is.
 *
 * Pure functions, no storage, no cookies: the same code runs on the server, in tests and in the browser.
 */
import { GRACE_DAYS, LEVEL_NAMES, PLANS, levelFor, planRank } from "./config";
import type { Category, CommunityEvent, Course, Decision, Member, PlanKey } from "./types";

export type Actor = Member | null;

export type Action =
  | "about.view"
  | "feed.view"
  | "engage" // like, comment, vote in a poll
  | "post.create" // target: Category
  | "category.view" // target: Category
  | "own.edit" // target: { authorId }
  | "course.view" // target: Course
  | "course.buy" // target: Course
  | "lab.view" // target: { minPlan?, levelUnlock? }
  | "journey.view"
  | "event.join" // target: CommunityEvent
  | "message.team"
  | "message.member" // target: Member
  | "moderate" // pin, hide, delete any post; resolve reports
  | "members.approve"
  | "members.manage" // change plan, pause, restore, gift, remove
  | "team.manage" // make someone admin or moderator (owner only)
  | "settings.edit" // plans, prices, courses, events, settings
  | "demo.reset";

export type LabGate = { minPlan?: PlanKey; levelUnlock?: number; teamOnly?: boolean };

const LIVE = new Set(["active", "past_due", "canceled"]);

/** Has a working membership right now (not a guest, pending, paused or removed). */
export const isLive = (a: Actor): a is Member => !!a && LIVE.has(a.state);
/** Same check without type narrowing, for use right before a redirect. */
export const hasAccess = (m: Member) => LIVE.has(m.state);
export const isOwner = (a: Actor) => isLive(a) && a.role === "owner";
export const isAdmin = (a: Actor) => isLive(a) && (a.role === "owner" || a.role === "admin");
export const isStaff = (a: Actor) => isLive(a) && a.role !== "member";

/** The plan a member really has today, after trials, gifts, failed payments and cancellations. */
export function effectivePlan(m: Member, now = new Date()): PlanKey {
  if (m.role === "owner" || m.role === "admin") return "inner";
  let plan: PlanKey = m.plan;
  if (m.state === "past_due" && m.pastDueSince && +new Date(m.pastDueSince) + GRACE_DAYS * 864e5 < +now) plan = "free";
  if (m.state === "canceled" && m.periodEndsAt && +new Date(m.periodEndsAt) < +now) plan = "free";
  if (m.gift && +new Date(m.gift.until) > +now && planRank(m.gift.plan) > planRank(plan)) plan = m.gift.plan;
  return plan;
}

const has = (a: Member, min: PlanKey, now: Date) => planRank(effectivePlan(a, now)) >= planRank(min);

/** Which column of the permission matrix this person sits in. */
export function standing(a: Actor, now = new Date()) {
  if (!a || a.state === "removed") return "guest" as const;
  if (a.state === "pending") return "pending" as const;
  if (a.state === "paused") return "paused" as const;
  if (a.role !== "member") return a.role;
  return effectivePlan(a, now);
}

export function courseOpen(a: Actor, c: Course, now = new Date()): boolean {
  if (!isLive(a)) return false;
  if (isStaff(a)) return true;
  if (!c.published) return false;
  if (a.grantedCourses.includes(c.id)) return true;
  const plan = effectivePlan(a, now);
  const acc = c.access;
  switch (acc.kind) {
    case "open":
      return true;
    case "plan":
    case "drip":
      return acc.plans.includes(plan);
    case "level":
      return levelFor(a.points).level >= acc.level || !!acc.orPlans?.includes(plan);
    case "buy":
      return !!acc.includedIn?.includes(plan);
    case "private":
      return false;
  }
}

/** Which lesson numbers (1-based) of a drip course are open for this member today. */
export function dripUnlocked(a: Actor, c: Course, now = new Date()): number {
  if (c.access.kind !== "drip") return Infinity;
  if (!isLive(a)) return 0;
  if (isStaff(a) || a.grantedCourses.includes(c.id)) return Infinity;
  const start = +new Date(a.curriculumStart ?? a.joinedAt);
  return Math.max(1, Math.floor((+now - start) / (c.access.everyDays * 864e5)) + 1);
}

export function can(a: Actor, action: Action, target?: unknown, now = new Date()): boolean {
  if (action === "about.view") return true;
  if (!isLive(a)) return false;
  switch (action) {
    case "feed.view":
    case "engage":
      return true;
    case "category.view": {
      const c = target as Category;
      return c.view === "everyone" || isStaff(a) || has(a, "inner", now);
    }
    case "post.create": {
      const c = target as Category;
      if (!can(a, "category.view", c, now)) return false;
      if (c.post === "everyone") return true;
      if (c.post === "team") return isAdmin(a);
      return isStaff(a) || has(a, c.post, now);
    }
    case "own.edit":
      return (target as { authorId: string }).authorId === a.id;
    case "course.view":
      return courseOpen(a, target as Course, now);
    case "course.buy": {
      const c = target as Course;
      return c.access.kind === "buy" && (c.published || isAdmin(a));
    }
    case "lab.view": {
      const g = target as LabGate;
      if (isStaff(a)) return true;
      if (g.teamOnly) return false;
      if (g.levelUnlock && levelFor(a.points).level >= g.levelUnlock) return true;
      if (g.minPlan) return has(a, g.minPlan, now);
      return !g.levelUnlock;
    }
    case "journey.view":
      return isAdmin(a) || (a.role === "member" && has(a, "circle", now)) || (a.role === "moderator" && planRank(a.plan) >= 1);
    case "event.join": {
      const e = target as CommunityEvent;
      return isStaff(a) || e.plans.includes(effectivePlan(a, now));
    }
    case "message.team":
      return isStaff(a) || has(a, "circle", now);
    case "message.member": {
      const t = target as Member;
      if (t.id === a.id || !isLive(t)) return false;
      if (isAdmin(a)) return true;
      return has(a, "circle", now) && (isStaff(t) || planRank(effectivePlan(t, now)) >= 1);
    }
    case "moderate":
    case "members.approve":
      return isStaff(a);
    case "members.manage":
    case "settings.edit":
    case "demo.reset":
      return isAdmin(a);
    case "team.manage":
      return isOwner(a);
  }
  return false;
}

/** A friendly sentence for a locked door. Never technical, never blaming. */
export function reason(a: Actor, action: Action, target?: unknown, now = new Date()): string {
  if (!a || a.state === "removed") return "Please sign in to the community first.";
  if (a.state === "pending") return "Your request to join is still being reviewed. Iisha's team will let you in soon.";
  if (a.state === "paused") return "Your access is paused right now. Message Iisha's team and they'll help you.";
  const circle = PLANS.circle.name;
  const inner = PLANS.inner.name;
  switch (action) {
    case "post.create": {
      const c = target as Category;
      if (c.post === "team") return "Only Iisha and her team can post here.";
      if (c.post === "inner" || c.view === "inner") return `This room is included in ${inner}.`;
      return `Posting in ${c.name} is included with ${circle}. You can still read every answer.`;
    }
    case "category.view":
      return `This room is included in ${inner}.`;
    case "own.edit":
      return "You can only change your own posts and comments.";
    case "course.view": {
      const c = target as Course;
      if (!c.published) return "This course isn't open yet.";
      const acc = c.access;
      if (acc.kind === "level") {
        const lv = levelFor(a.points);
        return `Reach Level ${acc.level} (${LEVEL_NAMES[acc.level - 1]}) to unlock this. You're Level ${lv.level}, ${Math.max(0, lv.toGo)} points to go.`;
      }
      if (acc.kind === "buy") return "This program is a one-time purchase.";
      if (acc.kind === "private") return "This is only for Iisha's team right now.";
      if (acc.kind === "plan" || acc.kind === "drip") return acc.plans.includes("circle") ? `This is included with ${circle}.` : `This is included in ${inner}.`;
      return "This course isn't open for you yet.";
    }
    case "course.buy":
      return "This program isn't for sale yet.";
    case "lab.view": {
      const g = target as LabGate;
      if (g.teamOnly) return "This Lab is coming soon.";
      return g.minPlan === "inner" ? `This Lab is included in ${inner}.` : `This Lab is included with ${circle}.`;
    }
    case "journey.view":
      return `My Journey is included with ${circle}.`;
    case "event.join": {
      const e = target as CommunityEvent;
      return e.plans.includes("circle") ? `Included in ${circle}. Upgrade to join.` : `Included in ${inner}. Upgrade to join.`;
    }
    case "message.team":
      return `Messaging Iisha's team is included with ${circle}.`;
    case "message.member":
      return `Member messages are included with ${circle}, for both people.`;
    case "team.manage":
      return "Only Iisha can do this.";
    case "moderate":
    case "members.approve":
    case "members.manage":
    case "settings.edit":
    case "demo.reset":
      return "Only Iisha's team can do this.";
    default:
      return "That isn't available on your plan yet.";
  }
}

/** can() + reason() in one step, shaped for API responses (403 with a friendly message). */
export function check(a: Actor, action: Action, target?: unknown, now = new Date()): Decision {
  if (can(a, action, target, now)) return { ok: true };
  return { ok: false, status: 403, message: reason(a, action, target, now) };
}
