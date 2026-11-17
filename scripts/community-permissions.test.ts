/**
 * Permission tests for The H.A.I.R. Circle Community.
 *
 *   npx tsx scripts/community-permissions.test.ts                 (matrix only)
 *   npx tsx scripts/community-permissions.test.ts http://localhost:3002   (matrix + every API route as every persona;
 *                                                                          set ADMIN_PASSWORD to include the team personas)
 *
 * Part 1 checks can() for every row and column of the permission matrix (build prompt, section 3.5).
 * Part 2 signs in as each demo persona and calls every POST /api/community/<action> with `_dry: 1`
 *        (stops after the permission check, so no demo data changes). A refusal must be a 403 with a
 *        friendly sentence; an allowed call must not be refused.
 */
import { CATEGORIES } from "@/lib/community/config";
import { can, type Action } from "@/lib/community/permissions";
import { buildSeed } from "@/lib/community/seed";
import type { CommunityEvent, Course, Member, PlanKey, Role } from "@/lib/community/types";

let passed = 0;
const failures: string[] = [];
const expect = (label: string, got: unknown, want: unknown) => (got === want ? passed++ : failures.push(`${label}: expected ${want}, got ${got}`));

// ───────────────────────── Part 1: the matrix ─────────────────────────
const now = new Date();
const seed = buildSeed(now);
const mk = (plan: PlanKey, role: Role = "member", state: Member["state"] = "active", points = 0): Member => ({ id: `t-${role}-${plan}-${state}`, name: "Test Person", email: "t@example.com", role, plan, state, points, joinedAt: now.toISOString(), lastSeenAt: now.toISOString(), showPlan: true, badges: [], grantedCourses: [], planHistory: [], checklist: {} });

const COLS = {
  guest: null,
  pending: mk("free", "member", "pending"),
  free: mk("free"),
  circle: mk("circle"),
  inner: mk("inner"),
  paused: mk("circle", "member", "paused"),
  moderator: mk("free", "moderator"),
  admin: mk("inner", "admin"),
  owner: mk("inner", "owner"),
} as const;
type Col = keyof typeof COLS;
const ORDER: Col[] = ["guest", "pending", "free", "circle", "inner", "paused", "moderator", "admin", "owner"];

const cat = (id: string) => CATEGORIES.find((c) => c.id === id)!;
const course = (id: string) => seed.courses.find((c) => c.id === id) as Course;
const openEvent = seed.events.find((e) => e.id === "community-live") as CommunityEvent;
const innerEvent = seed.events.find((e) => e.id === "inner-coaching") as CommunityEvent;

// y = allowed, - = not allowed, in column order: guest pending free circle inner paused moderator admin owner
const MATRIX: [string, Action, unknown, string][] = [
  ["View About page", "about.view", undefined, "yyyyyyyyy"],
  ["View feed", "feed.view", undefined, "--yyy-yyy"],
  ["Post in General", "post.create", cat("general"), "--yyy-yyy"],
  ["Post in Wins & Progress", "post.create", cat("wins"), "--yyy-yyy"],
  ["Post in Wash Day & Routines", "post.create", cat("wash-day"), "--yyy-yyy"],
  ["Post in Scalp & Wellness", "post.create", cat("scalp-wellness"), "--yyy-yyy"],
  ["Read Ask Iisha", "category.view", cat("ask-iisha"), "--yyy-yyy"],
  ["Post in Ask Iisha", "post.create", cat("ask-iisha"), "---yy-yyy"],
  ["See Inner Circle Lounge", "category.view", cat("inner-lounge"), "----y-yyy"],
  ["Post in Inner Circle Lounge", "post.create", cat("inner-lounge"), "----y-yyy"],
  ["Post in Announcements", "post.create", cat("announcements"), "-------yy"],
  ["Like, comment, poll vote", "engage", undefined, "--yyy-yyy"],
  ["Free courses", "course.view", course("start-here"), "--yyy-yyy"],
  ["Level-unlock course (below Level 3)", "course.view", course("wash-day-blueprint"), "---yy-yyy"],
  ["Circle curriculum (drip)", "course.view", course("circle-curriculum"), "---yy-yyy"],
  ["Inner Circle vault", "course.view", course("inner-vault"), "----y-yyy"],
  ["Buy-now program: can buy", "course.buy", course("radiance-rewired"), "--yyy-yyy"],
  ["Buy-now program: included or team view", "course.view", course("radiance-rewired"), "----y-yyy"],
  ["Unpublished program (team only)", "course.view", course("next-program"), "------yyy"],
  ["My Journey (/portal)", "journey.view", undefined, "---yy--yy"],
  ["Event Zoom link (event for all plans)", "event.join", openEvent, "--yyy-yyy"],
  ["Event Zoom link (Inner Circle event)", "event.join", innerEvent, "----y-yyy"],
  ["Message Iisha / team", "message.team", undefined, "---yy-yyy"],
  ["Pin, hide or delete any post; resolve reports", "moderate", undefined, "------yyy"],
  ["Approve or decline join requests", "members.approve", undefined, "------yyy"],
  ["Change a member's plan, pause or restore, gift access", "members.manage", undefined, "-------yy"],
  ["Make someone admin or moderator", "team.manage", undefined, "--------y"],
  ["Edit plans, prices, courses, events, settings", "settings.edit", undefined, "-------yy"],
  ["Reset demo data", "demo.reset", undefined, "-------yy"],
];
for (const [label, action, target, row] of MATRIX) ORDER.forEach((col, i) => expect(`matrix · ${label} · ${col}`, can(COLS[col], action, target, now), row[i] === "y"));

// The "at Level 3" cell, and a few rules the table states in words.
expect("matrix · Level-unlock course · free at Level 3", can(mk("free", "member", "active", 20), "course.view", course("wash-day-blueprint"), now), true);
expect("matrix · Level-unlock course · free at Level 2", can(mk("free", "member", "active", 19), "course.view", course("wash-day-blueprint"), now), false);
expect("rule · removed member is treated as a guest", can(mk("inner", "member", "removed"), "feed.view", undefined, now), false);
expect("rule · past due keeps access inside the 7-day grace", can({ ...mk("circle", "member", "past_due"), pastDueSince: new Date(+now - 2 * 864e5).toISOString() }, "journey.view", undefined, now), true);
expect("rule · past due loses paid access after the grace", can({ ...mk("circle", "member", "past_due"), pastDueSince: new Date(+now - 9 * 864e5).toISOString() }, "journey.view", undefined, now), false);
expect("rule · canceled keeps paid access until period end", can({ ...mk("circle", "member", "canceled"), periodEndsAt: new Date(+now + 5 * 864e5).toISOString() }, "journey.view", undefined, now), true);
expect("rule · canceled drops to Free after period end", can({ ...mk("circle", "member", "canceled"), periodEndsAt: new Date(+now - 864e5).toISOString() }, "journey.view", undefined, now), false);
expect("rule · canceled member is still in the community as Free", can({ ...mk("circle", "member", "canceled"), periodEndsAt: new Date(+now - 864e5).toISOString() }, "feed.view", undefined, now), true);
expect("rule · gifted Inner Circle opens the Lounge", can({ ...mk("free"), gift: { plan: "inner", until: new Date(+now + 864e5).toISOString() } }, "category.view", cat("inner-lounge"), now), true);
expect("rule · expired gift closes the Lounge", can({ ...mk("free"), gift: { plan: "inner", until: new Date(+now - 864e5).toISOString() } }, "category.view", cat("inner-lounge"), now), false);
expect("rule · a course given for free opens for a Free member", can({ ...mk("free"), grantedCourses: ["radiance-rewired"] }, "course.view", course("radiance-rewired"), now), true);
expect("rule · Free members can't start member DMs", can(mk("free"), "message.member", mk("circle"), now), false);
expect("rule · you can only edit your own post", can(mk("circle"), "own.edit", { authorId: "someone-else" }, now), false);

const matrixCells = passed + failures.length;

// ───────────────────────── Part 2: every API route as every persona ─────────────────────────
const P = { guest: "guest", aaliyah: "pending", kendra: "free", nia: "free", tasha: "circle", renee: "circle", brianna: "circle", simone: "circle", patrice: "paused", monique: "inner", "team-admin": "admin", azaiah: "admin", iisha: "owner" } as const;
type Persona = keyof typeof P;
const col = (p: Persona) => P[p];
const live = (p: Persona) => !["guest", "pending", "paused"].includes(col(p));
const staff = (p: Persona) => ["admin", "owner"].includes(col(p));
const circleUp = (p: Persona) => ["circle", "inner", "admin", "owner"].includes(col(p));
const innerUp = (p: Persona) => ["inner", "admin", "owner"].includes(col(p));
const nobody = () => false;
const everyone = () => true;

// [action, args, who should be allowed]
const API: [string, Record<string, unknown>, (p: Persona) => boolean][] = [
  ["login", { id: "guest" }, everyone],
  ["logout", {}, everyone],
  ["join", {}, everyone],
  ["view-as", { id: "tasha" }, nobody], // needs the owner-dashboard password, which no community persona has
  ["who", { id: "iisha" }, nobody],
  ["checklist", { key: "intro" }, live],
  ["profile.save", { bio: "x" }, live],
  ["post.create", { category: "general", title: "t" }, live],
  ["post.create", { category: "wins", title: "t" }, live],
  ["post.create", { category: "ask-iisha", title: "t" }, circleUp],
  ["post.create", { category: "inner-lounge", title: "t" }, innerUp],
  ["post.create", { category: "announcements", title: "t" }, staff],
  ["post.update", { id: "tasha-shedding-count", title: "t" }, (p) => p === "tasha"],
  ["post.delete", { id: "tasha-shedding-count" }, (p) => p === "tasha" || staff(p)],
  ["post.like", { id: "episode-1" }, live],
  ["post.like", { id: "lounge-coaching-notes" }, innerUp],
  ["post.vote", { id: "live-topic-poll", option: "a" }, live],
  ["post.report", { id: "episode-1" }, live],
  ["post.pin", { id: "episode-1" }, staff],
  ["post.hide", { id: "episode-1" }, staff],
  ["post.move", { id: "episode-1", category: "wins" }, staff],
  ["post.spotlight", { id: "episode-1" }, staff],
  ["post.broadcast", { id: "episode-1" }, staff],
  ["report.resolve", { id: "spam-crystal", outcome: "keep" }, staff],
  ["comment.create", { post: "episode-1", body: "x" }, live],
  ["comment.create", { post: "lounge-coaching-notes", body: "x" }, innerUp],
  ["comment.like", { post: "episode-1", id: "c04" }, live],
  ["comment.delete", { post: "ask-white-bulb", id: "c02" }, (p) => p === "tasha" || staff(p)],
  ["upload", {}, live],
  ["lesson.complete", { course: "start-here", lesson: "welcome" }, live],
  ["lesson.complete", { course: "wash-day-blueprint", lesson: "cleanse-first" }, (p) => p === "nia" || circleUp(p)],
  ["lesson.complete", { course: "circle-curriculum", lesson: "week-1" }, circleUp],
  ["lesson.complete", { course: "circle-curriculum", lesson: "week-12" }, staff], // not dripped to anyone yet
  ["lesson.complete", { course: "inner-vault", lesson: "replay-1" }, innerUp],
  ["course.buy", { course: "radiance-rewired" }, live],
  ["course.buy", { course: "next-program" }, staff], // unpublished
  ["lab.complete", { id: "growth-cycle", score: 100 }, live],
  ["lab.complete", { id: "build-your-wash-day", score: 100 }, circleUp],
  ["lab.complete", { id: "follicle-explorer", score: 100 }, staff], // coming soon, team only
  ["checkin", {}, circleUp],
  ["plan.checkout", { plan: "circle" }, live],
  ["plan.cancel", {}, live],
  ["plan.resume", {}, live],
  ["billing.switch", { billing: "annual" }, live],
  ["notif.read", {}, live],
  ["message.send", { body: "x" }, circleUp], // to Iisha's team
  ["message.send", { thread: "team:kendra", body: "x" }, staff], // someone else's conversation
  ["message.read", { thread: "team:none" }, live],
  ["member.approve", { id: "aaliyah" }, staff],
  ["member.decline", { id: "denise" }, staff],
  ["member.note", { id: "kendra", notes: "x" }, staff],
  ["member.plan", { id: "kendra", plan: "circle" }, staff],
  ["member.pause", { id: "kendra" }, staff],
  ["member.restore", { id: "patrice" }, staff],
  ["member.payment", { id: "brianna" }, staff],
  ["member.grant", { id: "nia", course: "radiance-rewired" }, staff],
  ["member.drip", { id: "tasha", week: 5 }, staff],
  ["member.client", { id: "kendra" }, staff],
  ["member.remove", { id: "kendra", confirm: "Kendra" }, staff],
  ["member.role", { id: "team-admin", role: "moderator" }, (p) => col(p) === "owner"],
  ["member.bulk", { ids: "aaliyah", op: "approve" }, staff],
  ["member.bulk", { ids: "kendra", op: "plan:circle" }, staff],
  ["category.save", { id: "general", name: "General" }, staff],
  ["course.save", { id: "start-here", title: "Start Here" }, staff],
  ["lesson.save", { course: "start-here", lesson: "welcome", title: "Welcome" }, staff],
  ["event.save", { id: "community-live", title: "Community Live" }, staff],
  ["event.delete", { id: "community-live" }, staff],
  ["event.email", { id: "community-live" }, staff],
  ["plans.save", {}, staff],
  ["settings.save", { section: "basics" }, staff],
  ["digest.send", {}, staff],
  ["audit.undo", { id: "none" }, staff],
  ["demo.reset", {}, staff],
];

async function api(base: string) {
  const { ACTION_NAMES } = await import("@/lib/server/community/actions").catch(() => ({ ACTION_NAMES: [] as string[] }));
  const covered = new Set(API.map((a) => a[0]));
  for (const name of ACTION_NAMES) expect(`api · every action is covered · ${name}`, covered.has(name), true);

  // Team personas can only be previewed by someone signed in to the owner dashboard.
  let dash = "";
  if (process.env.ADMIN_PASSWORD) {
    const r = await fetch(`${base}/api/admin/login`, { method: "POST", redirect: "manual", body: new URLSearchParams({ password: process.env.ADMIN_PASSWORD }) });
    dash = (r.headers.get("set-cookie") ?? "").split(";")[0];
  }
  for (const persona of Object.keys(P) as Persona[]) {
    let cookie = "";
    if (persona !== "guest") {
      const team = ["admin", "owner"].includes(col(persona));
      if (team && !dash) {
        console.log(`  (skipped ${persona}: team personas need the dashboard password. Set ADMIN_PASSWORD to include them.)`);
        continue;
      }
      const res = await fetch(`${base}/api/community/login`, { method: "POST", headers: { "Content-Type": "application/json", ...(team ? { Cookie: dash } : {}) }, body: JSON.stringify({ id: persona }) });
      cookie = (res.headers.get("set-cookie") ?? "").split(";")[0];
      expect(`api · sign in as ${persona}`, res.status === 200 && cookie.startsWith("icb_comm="), true);
    }
    for (const [action, args, allowed] of API) {
      const res = await fetch(`${base}/api/community/${action}`, { method: "POST", headers: { "Content-Type": "application/json", ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify({ ...args, _dry: 1 }) });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      const label = `api · ${action} ${JSON.stringify(args)} · ${persona} (${col(persona)})`;
      if (allowed(persona)) expect(`${label} · allowed`, res.status, 200);
      else {
        expect(`${label} · refused with 403`, res.status, 403);
        const friendly = typeof body.message === "string" && body.message.length > 12 && !/error|exception|undefined|null|stack|permission denied|forbidden/i.test(body.message);
        expect(`${label} · friendly message ("${body.message ?? ""}")`, friendly, true);
      }
    }
  }
}

(async () => {
  const base = process.argv[2]?.replace(/\/$/, "");
  if (base) await api(base);
  console.log(`Permission matrix: ${MATRIX.length} rows x ${ORDER.length} columns + extra rules = ${matrixCells} checks`);
  if (base) console.log(`API routes: ${API.length} calls x ${Object.keys(P).length} personas against ${base}`);
  else console.log("API routes: skipped (pass the site address to include them, e.g. http://localhost:3002)");
  console.log(`${passed} passed, ${failures.length} failed`);
  for (const f of failures) console.log(`  FAIL  ${f}`);
  process.exit(failures.length ? 1 : 0);
})();
