/** Server-side pieces shared by the Classroom pages: lock details, progress, the access chip. */
import { LEVEL_POINTS, levelFor } from "@/lib/community/config";
import { accessChip, flatLessons } from "@/lib/community/courses";
import { can, dripUnlocked, isStaff, reason } from "@/lib/community/permissions";
import type { Course, Member, Progress, Settings } from "@/lib/community/types";
import { Needs } from "@/components/ui/Needs";

/** Courses that touch scalp conditions carry the education-only note. */
export const EDUCATION_COURSES = new Set(["red-flags", "scalp-calm-kitchen", "radiance-rewired"]);

/** Who sees a course card at all: the team sees everything; members never see unpublished or hidden ones. */
export function listed(actor: Member, c: Course) {
  if (isStaff(actor)) return true;
  if (actor.grantedCourses.includes(c.id) && c.published) return true;
  return c.published && c.access.kind !== "private";
}

export function courseProgress(c: Course, p: Progress) {
  const all = flatLessons(c);
  const done = all.filter((l) => p.lessons[`${c.id}/${l.id}`]?.doneAt).length;
  return { total: all.length, done, percent: all.length ? Math.round((done / all.length) * 100) : 0 };
}

/** Why a course is locked for this member, and the ONE next step that opens it. */
export function lockInfo(actor: Member, c: Course, s: Settings, now = new Date()) {
  if (can(actor, "course.view", c, now)) return null;
  const a = c.access;
  if (a.kind === "level") {
    const lv = levelFor(actor.points).level;
    const toGo = Math.max(0, LEVEL_POINTS[a.level - 1] - actor.points);
    return {
      line: `Reach Level ${a.level} to unlock · you're Level ${lv} (${toGo} ${toGo === 1 ? "point" : "points"} to go)`,
      why: `Reach Level ${a.level} (${s.levelNames[a.level - 1]}) and this opens for free. You're Level ${lv}, with ${toGo} ${toGo === 1 ? "point" : "points"} to go. Every like on your posts and comments is a point. It's also included with ${s.plans.circle.name}.`,
      href: "/community/leaderboards#how",
      cta: "How points work",
    };
  }
  if (a.kind === "buy") {
    const price = s.prices[a.priceKey];
    const included = a.includedIn?.length ? ` It's also included in ${a.includedIn.map((p) => s.plans[p].name).join(" and ")}.` : "";
    return { line: "A one-time purchase", why: `This program is a one-time purchase.${included}`, href: `/community/checkout/program-${c.id}`, cta: price ? `Buy now · ${price}` : "See the program" };
  }
  return { line: reason(actor, "course.view", c, now), why: reason(actor, "course.view", c, now), href: "/community/upgrade", cta: "See plans" };
}

/** For drip courses: which lesson numbers are open, and when a locked one opens. */
export function dripInfo(actor: Member, c: Course, now = new Date()) {
  const open = dripUnlocked(actor, c, now);
  const every = c.access.kind === "drip" ? c.access.everyDays : 0;
  const start = +new Date(actor.curriculumStart ?? actor.joinedAt);
  return {
    open,
    opensOn: (n: number) => new Date(start + (n - 1) * every * 864e5).toLocaleDateString("en-US", { timeZone: actor.timeZone ?? "America/New_York", weekday: "long", month: "long", day: "numeric" }),
  };
}

export function Bar({ percent, label }: { percent: number; label: string }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-mist" role="img" aria-label={label}>
      <div className="h-full rounded-full bg-amethyst" style={{ width: `${percent}%` }} />
    </div>
  );
}

export function AccessChip({ c, s, locked }: { c: Course; s: Settings; locked?: boolean }) {
  const chip = accessChip(c, s);
  const quiet = !c.published || c.access.kind === "private";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[0.68rem] font-medium uppercase tracking-[0.1em] ${quiet ? "bg-plum-900 text-bone" : locked ? "bg-brass-soft/60 text-plum-950" : "bg-mist text-plum-800"}`}>
      {chip.text}
      {chip.needs && <Needs>{chip.needs}</Needs>}
    </span>
  );
}
