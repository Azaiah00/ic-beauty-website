/**
 * THE COMMUNITY SERVICE LAYER. Every change anyone can make is one named action here.
 *
 * Each action has two parts:
 *   allow(): asks the policy module (src/lib/community/permissions.ts) whether this person may do it
 *   run():   does it, writes the activity log (with Undo where it can be reversed), and sends notifications
 *
 * POST /api/community/<action> is the only way in. Screens never touch storage directly.
 * // TODO: Supabase — only src/lib/server/community/store.ts changes. These signatures stay the same.
 * // TODO: Payments — Square Subscriptions: plans → Square subscription plans; a Square webhook calls the same
 * //       member plan/state changes that "plan.checkout", "plan.cancel" and "member.payment" make here.
 */
import { BROADCAST_HOURS, DEMO, PLAN_ORDER, POINTS, TZ, firstName, planRank } from "@/lib/community/config";
import { embedUrl, flatLessons, hydrate } from "@/lib/community/courses";
import { lab as findLab, labGate } from "@/lib/community/labs";
import { check, dripUnlocked, effectivePlan, isAdmin, isLive, isStaff, reason, type Action, type Actor } from "@/lib/community/permissions";
import type { Category, CommunityEvent, Course, CourseAccess, Decision, Lesson, Member, PlanKey, Post, Role, Undo } from "@/lib/community/types";
import { recordSubmission } from "@/lib/server/submit";
import { addPoints, audit, batchNames, bool, canUndo, fail, fmtDate, list, mentions, missing, notify, notifyTeam, ok, sendWelcome, shortName, str, type Args, type ServiceResult } from "./core";
import { db, newId, resetDemo } from "./store";
import { COMM_COOKIE, WHO_COOKIE, signMember } from "./token";

export type Ctx = { actor: Actor; args: Args; now: Date; /** Signed in to the owner dashboard with the password. */ authed: boolean };
type Def = { allow: (c: Ctx) => Promise<Decision> | Decision; run: (c: Ctx) => Promise<ServiceResult> };

const yes: Decision = { ok: true };
const no = (message: string): Decision => ({ ok: false, status: 403, message });
const need = (action: Action) => (c: Ctx) => check(c.actor, action, undefined, c.now);
const snap = <T>(x: T): T => structuredClone(x);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const days = (n: number, from: Date) => new Date(+from + n * 864e5).toISOString();
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "item";

const landing = (m: Member) => (m.state === "pending" ? "/community/pending" : m.state === "paused" ? "/community/paused" : m.state === "removed" ? "/community/login?removed=1" : "/community");
const sessionCookie = (id: string) => ({ name: COMM_COOKIE, ...signMember(id) });

/** Eastern date + time from a form → ISO. */
function zoned(date: string, time: string) {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = (time || "19:00").split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi || 0);
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric" }).formatToParts(new Date(guess));
  const g = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return new Date(guess - (Date.UTC(g("year"), g("month") - 1, g("day"), g("hour"), g("minute")) - guess)).toISOString();
}

async function postCtx(id: string) {
  const [post, s] = await Promise.all([db.post(id), db.settings()]);
  if (!post) return null;
  const cat = s.categories.find((c) => c.id === post.categoryId) ?? s.categories[0];
  return { post, cat, s };
}
/** Base permission first, then "can this person see the room this post is in". */
const postGate = (action: Action) => async (c: Ctx) => {
  const base = check(c.actor, action, undefined, c.now);
  if (!base.ok) return base;
  const x = await postCtx(str(c.args.id || c.args.post));
  return x ? check(c.actor, "category.view", x.cat, c.now) : yes;
};
const ownOrMod = async (c: Ctx, authorId: string | undefined) => {
  if (!authorId) return check(c.actor, "feed.view", undefined, c.now);
  const own = check(c.actor, "own.edit", { authorId }, c.now);
  return own.ok ? own : check(c.actor, "moderate", undefined, c.now).ok ? yes : own;
};

async function setPlan(actor: Member, m: Member, plan: PlanKey, now: Date, note: string) {
  m.plan = plan;
  m.state = "active";
  m.pastDueSince = undefined;
  if (plan === "free") {
    m.trialEndsAt = undefined;
    m.periodEndsAt = undefined;
    m.billing = undefined;
  } else {
    m.curriculumStart ??= now.toISOString();
    if (!m.periodEndsAt || +new Date(m.periodEndsAt) < +now) m.periodEndsAt = days(m.billing === "annual" ? 365 : 30, now);
  }
  m.planHistory.push({ at: now.toISOString(), plan, by: shortName(actor), note });
}

async function approve(actor: Member, m: Member) {
  const before = snap(m);
  m.state = "active";
  await db.saveMember(m);
  await sendWelcome(m, await db.settings());
  return audit(actor, `${shortName(actor)} approved ${m.name}`, m.id, [{ coll: "members", id: m.id, before }], "members.approve");
}

async function sendMessage(actor: Member, threadId: string, body: string, now: Date) {
  await db.saveMessage({ id: newId(now), threadId, fromId: actor.id, body, at: now.toISOString(), readBy: [actor.id] });
  const href = `/community/messages?thread=${encodeURIComponent(threadId)}`;
  if (threadId.startsWith("team:")) {
    const memberId = threadId.slice(5);
    if (actor.id === memberId) await notifyTeam(`${actor.name} sent a message to the team`, href, actor.id);
    else await notify(memberId, "message", `${shortName(actor)} from Iisha's team sent you a message`, href, { actor: actor.id });
  } else {
    const other = threadId.split(":").slice(1).find((x) => x !== actor.id);
    if (other) await notify(other, "message", `${firstName(actor.name)} sent you a message`, href, { actor: actor.id });
  }
}

export const ACTIONS: Record<string, Def> = {
  // ─────────────────────────── Sign-in (demo) ───────────────────────────
  login: {
    allow: () => (DEMO ? yes : no("Sign-in opens when the community launches.")),
    run: async ({ args }) => {
      const id = str(args.id);
      if (id === "guest") return ok(undefined, { goto: "/community/about", cookies: [{ name: COMM_COOKIE, value: "", maxAge: 0 }] });
      const m = await db.member(id);
      if (!m) return missing("That person");
      return ok(undefined, { goto: str(args.next).startsWith("/community") && isLive(m) ? str(args.next) : landing(m), cookies: [sessionCookie(m.id)] });
    },
  },
  logout: {
    allow: () => yes,
    run: async () => ok("You're signed out.", { goto: "/community/about", cookies: [{ name: COMM_COOKIE, value: "", maxAge: 0 }] }),
  },
  "view-as": {
    allow: (c) => (c.authed ? yes : no("Please sign in to the owner dashboard first.")),
    run: async ({ args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      return ok(undefined, { goto: landing(m), cookies: [sessionCookie(m.id)] });
    },
  },
  who: {
    allow: (c) => (c.authed ? yes : no("Please sign in to the owner dashboard first.")),
    run: async ({ args }) => {
      const m = await db.member(str(args.id));
      if (!m || !isAdmin(m)) return fail(422, "Please choose a team member.");
      return ok(`You're using the dashboard as ${shortName(m)}.`, { goto: str(args.back).startsWith("/admin") ? str(args.back) : "/admin?view=community", cookies: [{ name: WHO_COOKIE, value: m.id, maxAge: 30 * 86400 }] });
    },
  },

  // ─────────────────────────── Joining ───────────────────────────
  join: {
    allow: () => yes,
    run: async ({ actor: who, args, now }) => {
      const s = await db.settings();
      const actor = who as Member | null;
      if (actor && ["active", "past_due", "canceled"].includes(actor.state)) return ok(undefined, { goto: "/community" });
      if (!bool(args.agree)) return fail(422, "Please agree to the community guidelines to continue.");
      const answers = Object.fromEntries(s.questions.map((q) => [q.id, str(args[`q-${q.id}`], 600)]));
      if (actor?.state === "pending") {
        await db.saveMember({ ...actor, answers, hairGoal: answers.goal || actor.hairGoal });
        return ok("Thank you. Your answers are in.", { goto: "/community/pending" });
      }
      if (actor) return fail(403, reason(actor, "feed.view"));
      // TODO: Auth — name and email come from the Google account once real sign-in is connected.
      const name = str(args.name, 80);
      const email = str(args.email, 160).toLowerCase();
      if (!name || !EMAIL_RE.test(email)) return fail(422, "Please add your name and a valid email.");
      const existing = (await db.members()).find((x) => x.email.toLowerCase() === email);
      if (existing?.state === "removed") return fail(403, "This email can't join right now. Please message Iisha's team.");
      if (existing) return fail(409, "That email already has a membership. Please sign in instead.");
      const iso = now.toISOString();
      const m: Member = { id: `m-${newId(now)}`, name, email, role: "member", plan: "free", state: s.autoApprove.free ? "active" : "pending", points: 0, joinedAt: iso, lastSeenAt: iso, showPlan: true, badges: [], grantedCourses: [], planHistory: [{ at: iso, plan: "free", by: "Joined" }], checklist: {}, answers, hairGoal: answers.goal || undefined, timeZone: str(args.timeZone, 60) || undefined };
      await db.saveMember(m);
      // Lands in the owner dashboard and in Square (group "Website: H.A.I.R. Circle Community").
      await recordSubmission("community-join", { name, email, ...answers }).catch(() => null);
      if (m.state === "active") await sendWelcome(m, s);
      else await notifyTeam(`${m.name} asked to join the community`, "/admin?view=community-members&filter=pending");
      return ok(undefined, { goto: m.state === "active" ? "/community/welcome" : "/community/pending", cookies: [sessionCookie(m.id)] });
    },
  },
  checklist: {
    allow: need("feed.view"),
    run: async ({ actor, args }) => {
      const key = str(args.key) as keyof Member["checklist"];
      if (!["intro", "watch", "goal", "download"].includes(key)) return fail(422, "That step isn't on the list.");
      await db.saveMember({ ...actor!, checklist: { ...actor!.checklist, [key]: true } });
      return ok();
    },
  },
  "profile.save": {
    allow: need("feed.view"),
    run: async ({ actor, args }) => {
      const m = { ...actor! };
      if ("name" in args && str(args.name)) m.name = str(args.name, 80);
      if ("bio" in args) m.bio = str(args.bio, 400);
      if ("city" in args) m.city = str(args.city, 80);
      if ("hairGoal" in args) m.hairGoal = str(args.hairGoal, 200);
      if ("timeZone" in args && str(args.timeZone)) m.timeZone = str(args.timeZone, 60);
      if ("photo" in args) m.photo = /^\/(api\/community\/media|images)\//.test(str(args.photo)) ? str(args.photo) : undefined;
      if ("_plan" in args) m.showPlan = bool(args.showPlan);
      if ("_prefs" in args) m.emailPrefs = { replies: bool(args.prefReplies), lessons: bool(args.prefLessons), events: bool(args.prefEvents), digest: bool(args.prefDigest) };
      if (m.hairGoal) m.checklist = { ...m.checklist, goal: true };
      await db.saveMember(m);
      return ok("Saved.");
    },
  },

  // ─────────────────────────── Feed ───────────────────────────
  "post.create": {
    allow: async (c) => {
      const base = check(c.actor, "feed.view", undefined, c.now);
      if (!base.ok) return base;
      const cat = (await db.settings()).categories.find((x) => x.id === str(c.args.category));
      return cat ? check(c.actor, "post.create", cat, c.now) : yes;
    },
    run: async ({ actor, args, now }) => {
      const s = await db.settings();
      const cat = s.categories.find((x) => x.id === str(args.category));
      if (!cat) return fail(422, "Please choose where to post this.");
      const title = str(args.title, 140);
      const body = str(args.body, 8000);
      if (!title) return fail(422, "Please add a title so people know what your post is about.");
      const images = list(args.images).filter((u) => /^\/(api\/community\/media|images)\//.test(u)).slice(0, 4);
      const options = list(args.poll).slice(0, 6);
      if (options.length === 1) return fail(422, "A poll needs at least two choices.");
      const video = str(args.video, 300);
      if (video && !embedUrl(video)) return fail(422, "Please paste a YouTube or Vimeo link.");
      const iso = now.toISOString();
      const post: Post = { id: newId(now), authorId: actor!.id, categoryId: cat.id, title, body, images, video: video || undefined, poll: options.length ? { options: options.map((text, i) => ({ id: String.fromCharCode(97 + i), text: text.slice(0, 120), votes: [] })) } : undefined, likes: [], reports: [], createdAt: iso, updatedAt: iso, lastActivityAt: iso };
      await db.savePost(post);
      if (cat.id === "start-here" && !actor!.checklist.intro) await db.saveMember({ ...actor!, checklist: { ...actor!.checklist, intro: true } });
      for (const m of mentions(`${title} ${body}`, await db.members())) await notify(m.id, "mention", `${firstName(actor!.name)} mentioned you in “${title}”`, `/community/post/${post.id}`, { actor: actor!.id });
      return ok("Your post is up.", { data: { id: post.id }, goto: `/community/post/${post.id}` });
    },
  },
  "post.update": {
    allow: async (c) => check(c.actor, "feed.view", undefined, c.now).ok ? ((await db.post(str(c.args.id))) ? check(c.actor, "own.edit", await db.post(str(c.args.id)), c.now) : yes) : check(c.actor, "feed.view", undefined, c.now),
    run: async ({ args, now }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      const title = str(args.title, 140);
      if (!title) return fail(422, "Please add a title.");
      await db.savePost({ ...post, title, body: str(args.body, 8000), updatedAt: now.toISOString() });
      return ok("Your post is updated.");
    },
  },
  "post.delete": {
    allow: async (c) => ownOrMod(c, (await db.post(str(c.args.id)))?.authorId),
    run: async ({ actor, args }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      await db.deletePost(post.id);
      if (post.authorId === actor!.id) return ok("Your post is deleted.", { goto: "/community" });
      const author = await db.member(post.authorId);
      const auditId = await audit(actor!, `${shortName(actor!)} deleted ${author?.name ?? "a member"}'s post “${post.title}”`, post.id, [{ coll: "posts", id: post.id, before: post }], "moderate");
      return ok("The post is deleted.", { auditId, goto: "/community" });
    },
  },
  "post.like": {
    allow: postGate("engage"),
    run: async ({ actor, args }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      if (post.authorId === actor!.id) return fail(422, "That's your own post. Likes come from other members.");
      const liked = post.likes.includes(actor!.id);
      post.likes = liked ? post.likes.filter((x) => x !== actor!.id) : [...post.likes, actor!.id];
      await db.savePost(post);
      await addPoints(post.authorId, liked ? -POINTS.like : POINTS.like, `Like on “${post.title}”`);
      if (!liked) await notify(post.authorId, "like", `${firstName(actor!.name)} liked “${post.title}”`, `/community/post/${post.id}`, { actor: actor!.id, group: `like:${post.id}`, groupText: (n) => `${batchNames(n)} liked “${post.title}”` });
      return ok(undefined, { data: { liked: !liked, count: post.likes.length } });
    },
  },
  "post.vote": {
    allow: postGate("engage"),
    run: async ({ actor, args }) => {
      const post = await db.post(str(args.id));
      if (!post?.poll) return missing("That poll");
      const option = str(args.option);
      if (!post.poll.options.some((o) => o.id === option)) return fail(422, "Please pick one of the choices.");
      for (const o of post.poll.options) o.votes = o.id === option ? [...new Set([...o.votes, actor!.id])] : o.votes.filter((v) => v !== actor!.id);
      await db.savePost(post);
      return ok("Your vote is in.");
    },
  },
  "post.report": {
    allow: postGate("engage"),
    run: async ({ actor, args, now }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      if (!post.reports.some((r) => r.by === actor!.id)) {
        post.reports.push({ by: actor!.id, reason: str(args.reason, 300) || "Not right for the community", at: now.toISOString() });
        await db.savePost(post);
        await notifyTeam(`${actor!.name} reported “${post.title}”`, "/admin?view=community-posts", actor!.id);
      }
      return ok("Thank you. Iisha's team will take a look.");
    },
  },
  "post.pin": {
    allow: need("moderate"),
    run: async ({ actor, args }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      const before = snap(post);
      post.pinned = !post.pinned;
      await db.savePost(post);
      const auditId = await audit(actor!, `${shortName(actor!)} ${post.pinned ? "pinned" : "unpinned"} “${post.title}”`, post.id, [{ coll: "posts", id: post.id, before }], "moderate");
      return ok(post.pinned ? "Pinned to the top of the feed." : "Unpinned.", { auditId });
    },
  },
  "post.hide": {
    allow: need("moderate"),
    run: async ({ actor, args }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      const before = snap(post);
      post.hidden = !post.hidden;
      await db.savePost(post);
      const auditId = await audit(actor!, `${shortName(actor!)} ${post.hidden ? "hid" : "un-hid"} “${post.title}”`, post.id, [{ coll: "posts", id: post.id, before }], "moderate");
      return ok(post.hidden ? "Hidden. Only the team can see it now." : "Showing again.", { auditId });
    },
  },
  "post.move": {
    allow: need("moderate"),
    run: async ({ actor, args }) => {
      const x = await postCtx(str(args.id));
      if (!x) return missing("That post");
      const to = x.s.categories.find((c) => c.id === str(args.category));
      if (!to) return fail(422, "Please choose a category.");
      const before = snap(x.post);
      await db.savePost({ ...x.post, categoryId: to.id });
      const auditId = await audit(actor!, `${shortName(actor!)} moved “${x.post.title}” to ${to.name}`, x.post.id, [{ coll: "posts", id: x.post.id, before }], "moderate");
      return ok(`Moved to ${to.name}.`, { auditId });
    },
  },
  "post.spotlight": {
    allow: need("moderate"),
    run: async ({ actor, args, now }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      const on = !(post.spotlightUntil && +new Date(post.spotlightUntil) > +now);
      const undo: Undo[] = [{ coll: "posts", id: post.id, before: snap(post) }];
      if (on) {
        for (const other of (await db.posts()).filter((p) => p.id !== post.id && p.spotlightUntil)) {
          undo.push({ coll: "posts", id: other.id, before: snap(other) });
          await db.savePost({ ...other, spotlightUntil: undefined });
        }
        const author = await db.member(post.authorId);
        if (author && !author.badges.includes("spotlight")) {
          undo.push({ coll: "members", id: author.id, before: snap(author) });
          await db.saveMember({ ...author, badges: [...author.badges, "spotlight"] });
        }
        await notify(post.authorId, "team", `${shortName(actor!)} featured your post as this week's Spotlight`, `/community/post/${post.id}`, { actor: actor!.id });
      }
      await db.savePost({ ...post, spotlightUntil: on ? days(7, now) : undefined });
      const auditId = await audit(actor!, `${shortName(actor!)} ${on ? "featured" : "stopped featuring"} “${post.title}” as Spotlight`, post.id, undo, "moderate");
      return ok(on ? "Featured as Spotlight for 7 days." : "Spotlight removed.", { auditId });
    },
  },
  "post.broadcast": {
    allow: need("settings.edit"),
    run: async ({ actor, args, now }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      const s = await db.settings();
      const wait = s.lastBroadcastAt ? BROADCAST_HOURS * 36e5 - (+now - +new Date(s.lastBroadcastAt)) : 0;
      if (wait > 0) return fail(429, `You can email all members once every ${BROADCAST_HOURS} hours. Try again in about ${Math.ceil(wait / 36e5)} hours.`);
      await db.saveSettings({ ...s, lastBroadcastAt: now.toISOString() });
      // Demo: nothing is emailed. // TODO: Email — send through Iisha's Gmail / Square Marketing at launch.
      await audit(actor!, `${shortName(actor!)} emailed “${post.title}” to all members (demo, nothing was sent)`, post.id);
      return ok("Done. In the demo this is only written to the activity log, no email is sent.");
    },
  },
  "report.resolve": {
    allow: need("moderate"),
    run: async ({ actor, args, now }) => {
      const post = await db.post(str(args.id));
      if (!post) return missing("That post");
      const outcome = str(args.outcome);
      const before = snap(post);
      const author = await db.member(post.authorId);
      const undo: Undo[] = [{ coll: "posts", id: post.id, before }];
      let text = "";
      if (outcome === "delete") {
        await db.deletePost(post.id);
        text = `deleted the reported post “${post.title}”`;
      } else {
        await db.savePost({ ...post, reports: [], hidden: outcome === "hide" ? true : post.hidden });
        text = outcome === "hide" ? `hid the reported post “${post.title}”` : outcome === "warn" ? `warned ${author?.name ?? "the member"} about “${post.title}”` : `kept the reported post “${post.title}”`;
        if (outcome === "warn" && author) await sendMessage(actor!, `team:${author.id}`, `A quick, kind reminder about our community guidelines after your post “${post.title}”. Please keep posts about your own experience, with no selling. Thank you for being here.`, now);
      }
      const auditId = await audit(actor!, `${shortName(actor!)} ${text}`, post.id, undo, "moderate");
      return ok("Done. The report is cleared.", { auditId });
    },
  },
  "comment.create": {
    allow: postGate("engage"),
    run: async ({ actor, args, now }) => {
      const x = await postCtx(str(args.post));
      if (!x) return missing("That post");
      const body = str(args.body, 3000);
      if (!body) return fail(422, "Please write something first.");
      const parent = str(args.parent) ? await db.comment(x.post.id, str(args.parent)) : null;
      const c = { id: newId(now), postId: x.post.id, authorId: actor!.id, parentId: parent ? parent.parentId ?? parent.id : undefined, body, likes: [], createdAt: now.toISOString() };
      await db.saveComment(c);
      await db.savePost({ ...x.post, lastActivityAt: c.createdAt });
      const href = `/community/post/${x.post.id}#c-${c.id}`;
      const who = actor!.role === "owner" ? "Iisha" : firstName(actor!.name);
      const told = new Set<string>([actor!.id]);
      if (parent && !told.has(parent.authorId)) {
        told.add(parent.authorId);
        await notify(parent.authorId, "reply", `${who} replied to your comment on “${x.post.title}”`, href, { actor: actor!.id });
      }
      if (!told.has(x.post.authorId)) {
        told.add(x.post.authorId);
        await notify(x.post.authorId, "reply", actor!.role === "owner" && x.cat.id === "ask-iisha" ? `Iisha answered your question: “${x.post.title}”` : `${who} replied to “${x.post.title}”`, href, { actor: actor!.id });
      }
      for (const m of mentions(body, await db.members())) if (!told.has(m.id)) await notify(m.id, "mention", `${who} mentioned you in a comment`, href, { actor: actor!.id });
      return ok(undefined, { data: { id: c.id } });
    },
  },
  "comment.like": {
    allow: postGate("engage"),
    run: async ({ actor, args }) => {
      const c = await db.comment(str(args.post), str(args.id));
      if (!c) return missing("That comment");
      if (c.authorId === actor!.id) return fail(422, "That's your own comment. Likes come from other members.");
      const liked = c.likes.includes(actor!.id);
      c.likes = liked ? c.likes.filter((x) => x !== actor!.id) : [...c.likes, actor!.id];
      await db.saveComment(c);
      await addPoints(c.authorId, liked ? -POINTS.like : POINTS.like, "Like on a comment");
      if (!liked) await notify(c.authorId, "like", `${firstName(actor!.name)} liked your comment`, `/community/post/${c.postId}#c-${c.id}`, { actor: actor!.id, group: `like:${c.id}`, groupText: (n) => `${batchNames(n)} liked your comment` });
      return ok(undefined, { data: { liked: !liked, count: c.likes.length } });
    },
  },
  "comment.delete": {
    allow: async (c) => ownOrMod(c, (await db.comment(str(c.args.post), str(c.args.id)))?.authorId),
    run: async ({ actor, args }) => {
      const c = await db.comment(str(args.post), str(args.id));
      if (!c) return missing("That comment");
      await db.deleteComment(c.postId, c.id);
      for (const child of (await db.comments(c.postId)).filter((x) => x.parentId === c.id)) await db.deleteComment(c.postId, child.id);
      if (c.authorId !== actor!.id) await audit(actor!, `${shortName(actor!)} deleted a comment`, c.postId);
      return ok("The comment is deleted.");
    },
  },
  upload: {
    allow: need("engage"),
    run: async ({ actor, args, now }) => {
      const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(str(args.dataUrl, 8_000_000));
      if (!m) return fail(422, "Please choose a photo (JPG, PNG or WebP).");
      if (m[2].length * 0.75 > 5 * 1024 * 1024) return fail(413, "That photo is too large. Please choose one under 5 MB.");
      const id = newId(now);
      await db.saveMedia(id, { type: m[1], b64: m[2], by: actor!.id });
      return ok(undefined, { data: { url: `/api/community/media/${id}` } });
    },
  },

  // ─────────────────────────── Classroom + Labs ───────────────────────────
  "lesson.complete": {
    allow: async (c) => {
      const base = check(c.actor, "feed.view", undefined, c.now);
      if (!base.ok) return base;
      const course = await db.course(str(c.args.course));
      if (!course) return yes;
      const open = check(c.actor, "course.view", course, c.now);
      if (!open.ok) return open;
      const n = flatLessons(hydrate(course)).findIndex((l) => l.id === str(c.args.lesson)) + 1;
      return n > dripUnlocked(c.actor, course, c.now) ? no("This lesson opens on a Monday soon. One week at a time.") : yes;
    },
    run: async ({ actor, args, now }) => {
      const course = await db.course(str(args.course));
      const lesson = course && flatLessons(hydrate(course)).find((l) => l.id === str(args.lesson));
      if (!course || !lesson) return missing("That lesson");
      const key = `${course.id}/${lesson.id}`;
      const p = await db.progress(actor!.id);
      const was = !!p.lessons[key]?.doneAt;
      const done = "done" in args ? bool(args.done) : !was;
      if ("note" in args) p.lessons[key] = { ...p.lessons[key], note: str(args.note, 4000) };
      if (done !== was) p.lessons[key] = { ...p.lessons[key], doneAt: done ? now.toISOString() : undefined };
      await db.saveProgress(p);
      const s = await db.settings();
      if (done !== was && s.points.lesson) await addPoints(actor!.id, done ? POINTS.lesson : -POINTS.lesson, `Lesson: ${lesson.title}`);
      const tick: Partial<Member["checklist"]> = key === "start-here/welcome" ? { watch: true } : key === "red-flags/self-check" ? { download: true } : {};
      if (done && Object.keys(tick).length) {
        const fresh = await db.member(actor!.id);
        if (fresh) await db.saveMember({ ...fresh, checklist: { ...fresh.checklist, ...tick } });
      }
      return ok(done !== was ? (done ? `Lesson complete.${s.points.lesson && actor!.role === "member" ? ` +${POINTS.lesson} points.` : ""}` : "Marked as not done yet.") : "Your note is saved.", { data: { done } });
    },
  },
  "course.buy": {
    allow: async (c) => {
      const base = check(c.actor, "feed.view", undefined, c.now);
      if (!base.ok) return base;
      const course = await db.course(str(c.args.course));
      return course ? check(c.actor, "course.buy", course, c.now) : yes;
    },
    run: async ({ actor, args, now }) => {
      const course = await db.course(str(args.course));
      if (!course || course.access.kind !== "buy") return missing("That program");
      if (check(actor, "course.view", course, now).ok) return ok("You already have this.", { goto: `/community/classroom/${course.id}` });
      const s = await db.settings();
      const memberPrice = effectivePlan(actor!, now) === "inner" ? s.prices[`${course.access.priceKey}-member`] : "";
      const amount = memberPrice || s.prices[course.access.priceKey] || "";
      if (!amount) return fail(422, "This program doesn't have a price yet.");
      // TODO: Payments — Square checkout link for one-time programs. Demo: no card is charged.
      await db.savePurchase({ id: newId(now), memberId: actor!.id, kind: "course", ref: course.id, label: course.title, amount, at: now.toISOString(), demo: true });
      await db.saveMember({ ...actor!, grantedCourses: [...new Set([...actor!.grantedCourses, course.id])] });
      await notifyTeam(`${actor!.name} bought ${course.title} (${amount}, demo)`, "/admin?view=community-members", actor!.id);
      await notify(actor!.id, "plan", `${course.title} is yours. Open it in the Classroom.`, `/community/classroom/${course.id}`);
      return ok(`${course.title} is unlocked.`, { goto: `/community/classroom/${course.id}?bought=1` });
    },
  },
  "lab.complete": {
    allow: (c) => {
      const base = check(c.actor, "feed.view", undefined, c.now);
      if (!base.ok) return base;
      const l = findLab(str(c.args.id));
      return l ? check(c.actor, "lab.view", labGate(l), c.now) : yes;
    },
    run: async ({ actor, args, now }) => {
      const l = findLab(str(args.id));
      if (!l) return missing("That Lab");
      const p = await db.progress(actor!.id);
      const first = !p.labs[l.id];
      p.labs[l.id] = { doneAt: now.toISOString(), score: Math.max(0, Math.min(100, Number(args.score) || 0)) };
      await db.saveProgress(p);
      const s = await db.settings();
      if (first && s.points.lab) await addPoints(actor!.id, POINTS.lab, `Lab: ${l.title}`);
      return ok(first && s.points.lab && actor!.role === "member" ? `Lab complete. +${POINTS.lab} points.` : "Lab complete.");
    },
  },
  checkin: {
    allow: need("journey.view"),
    run: async ({ actor, now }) => {
      const p = await db.progress(actor!.id);
      const week = new Date(+now - ((now.getUTCDay() + 6) % 7) * 864e5).toISOString().slice(0, 10);
      if (p.checkins.includes(week)) return ok("This week's check-in is already saved.");
      p.checkins.push(week);
      await db.saveProgress(p);
      const s = await db.settings();
      if (s.points.checkin) await addPoints(actor!.id, POINTS.checkin, "Weekly check-in");
      return ok(`Check-in saved.${s.points.checkin && actor!.role === "member" ? ` +${POINTS.checkin} point.` : ""}`);
    },
  },

  // ─────────────────────────── Plans (demo payments) ───────────────────────────
  "plan.checkout": {
    allow: need("feed.view"),
    run: async ({ actor, args, now }) => {
      const plan = str(args.plan) as PlanKey;
      if (plan !== "circle" && plan !== "inner") return fail(422, "Please choose a plan.");
      if (actor!.role !== "member") return fail(422, "Iisha's team already has full access, so there is no plan to check out.");
      const s = await db.settings();
      const billing = str(args.billing) === "annual" ? "annual" : "monthly";
      if (plan === "inner" && s.plans.inner.seatCap) {
        const taken = (await db.members()).filter((x) => x.role === "member" && isLive(x) && effectivePlan(x, now) === "inner").length;
        if (taken >= s.plans.inner.seatCap && effectivePlan(actor!, now) !== "inner") return fail(409, `${s.plans.inner.name} is full right now. Message Iisha's team to join the waitlist.`);
      }
      const m = { ...actor! };
      const wasFree = effectivePlan(m, now) === "free";
      m.billing = billing;
      m.gift = undefined;
      m.periodEndsAt = undefined;
      await setPlan(m, m, plan, now, "Checkout (demo)");
      const trial = plan === "circle" && wasFree ? s.plans.circle.trialDays : 0;
      m.trialEndsAt = trial ? days(trial, now) : undefined;
      m.periodEndsAt = days(trial || (billing === "annual" ? 365 : 30), now);
      await db.saveMember(m);
      // TODO: Payments — Square Subscriptions. Demo: no card is charged.
      await db.savePurchase({ id: newId(now), memberId: m.id, kind: "plan", ref: plan, label: s.plans[plan].name, amount: s.plans[plan][billing], billing, at: now.toISOString(), demo: true });
      await notifyTeam(`${m.name} ${wasFree ? "upgraded to" : "switched to"} ${s.plans[plan].name}${trial ? ` (${trial}-day free trial)` : ""}`, `/admin?view=community-members&q=${encodeURIComponent(m.name)}`, m.id);
      await notify(m.id, "plan", `Welcome to ${s.plans[plan].name}. Here are your first 3 steps.`, `/community/checkout/${plan}?done=1`);
      return ok(`You're in ${s.plans[plan].name}.`, { goto: `/community/checkout/${plan}?done=1` });
    },
  },
  "plan.cancel": {
    allow: need("feed.view"),
    run: async ({ actor, args, now }) => {
      const m = { ...actor! };
      const s = await db.settings();
      const current = effectivePlan(m, now);
      if (m.role !== "member" || current === "free") return fail(422, "You're on the free plan, so there's nothing to cancel.");
      const until = m.periodEndsAt && +new Date(m.periodEndsAt) > +now ? m.periodEndsAt : now.toISOString();
      m.exitSurvey = { at: now.toISOString(), joined: str(args.joined, 600), leaving: str(args.leaving, 600), kept: str(args.kept, 600) };
      const smaller = str(args.to) === "circle" && current === "inner";
      if (smaller) {
        // Downgrades take effect at renewal: Inner Circle stays on until the period ends, then Circle continues.
        m.plan = "circle";
        m.gift = { plan: "inner", until };
        m.planHistory.push({ at: now.toISOString(), plan: "circle", by: firstName(m.name), note: "Switched from Inner Circle" });
      } else {
        m.state = "canceled";
        m.periodEndsAt = until;
        m.trialEndsAt = undefined;
      }
      await db.saveMember(m);
      const date = fmtDate(until, { month: "long", day: "numeric" });
      await notifyTeam(smaller ? `${m.name} switched from ${s.plans.inner.name} to ${s.plans.circle.name}` : `${m.name} canceled ${s.plans[current].name}. Reason: ${m.exitSurvey.leaving || "not given"}`, `/admin?view=community-members&q=${encodeURIComponent(m.name)}`, m.id);
      await notify(m.id, "plan", smaller ? `You're switching to ${s.plans.circle.name}. ${s.plans.inner.name} stays on until ${date}.` : `Your membership is canceled. You keep ${s.plans[current].name} access until ${date}.`, "/community/settings#plan");
      return ok(smaller ? `Done. ${s.plans.inner.name} stays on until ${date}, then you continue as a ${s.plans.circle.name}.` : `Your membership is canceled. Your access stays on until ${date}.`, { goto: "/community/settings?canceled=1#plan" });
    },
  },
  "plan.resume": {
    allow: need("feed.view"),
    run: async ({ actor, now }) => {
      const m = { ...actor! };
      if (m.state !== "canceled" && m.state !== "past_due") return ok("Your membership is already active.");
      m.state = "active";
      m.pastDueSince = undefined;
      if (!m.periodEndsAt || +new Date(m.periodEndsAt) < +now) m.periodEndsAt = days(m.billing === "annual" ? 365 : 30, now);
      await db.saveMember(m);
      await notifyTeam(`${m.name} is back on ${(await db.settings()).plans[m.plan].name}`, `/admin?view=community-members&q=${encodeURIComponent(m.name)}`, m.id);
      return ok("Welcome back. Your membership is active again.");
    },
  },
  "billing.switch": {
    allow: need("feed.view"),
    run: async ({ actor, args }) => {
      const billing = str(args.billing) === "annual" ? "annual" : "monthly";
      await db.saveMember({ ...actor!, billing });
      return ok(`Switched to ${billing} billing. It starts at your next renewal.`);
    },
  },

  // ─────────────────────────── Notifications + messages ───────────────────────────
  "notif.read": {
    allow: need("feed.view"),
    run: async ({ actor }) => {
      const mine = await db.notifications(actor!.id);
      await Promise.all(mine.filter((n) => !n.read).map((n) => db.saveNotification({ ...n, read: true })));
      return ok("All caught up.");
    },
  },
  "message.send": {
    allow: async (c) => {
      const base = check(c.actor, "feed.view", undefined, c.now);
      if (!base.ok) return base;
      const thread = str(c.args.thread);
      if (thread.startsWith("team:")) return thread.slice(5) === c.actor!.id ? check(c.actor, "message.team", undefined, c.now) : isStaff(c.actor) ? yes : no("That conversation isn't yours.");
      if (thread.startsWith("dm:")) {
        const ids = thread.split(":").slice(1);
        if (!ids.includes(c.actor!.id)) return no("That conversation isn't yours.");
        const other = await db.member(ids.find((x) => x !== c.actor!.id) ?? "");
        return other ? check(c.actor, "message.member", other, c.now) : yes;
      }
      return check(c.actor, "message.team", undefined, c.now);
    },
    run: async ({ actor, args, now }) => {
      const body = str(args.body, 3000);
      if (!body) return fail(422, "Please write a message first.");
      let thread = str(args.thread) || `team:${actor!.id}`;
      if (thread.startsWith("dm:")) thread = `dm:${thread.split(":").slice(1).sort().join(":")}`;
      const otherId = thread.startsWith("team:") ? thread.slice(5) : thread.split(":").slice(1).find((x) => x !== actor!.id);
      if (!otherId || !(await db.member(otherId))) return missing("That person");
      await sendMessage(actor!, thread, body, now);
      if (isStaff(actor) && thread.startsWith("team:") && thread.slice(5) !== actor!.id && bool(args._log)) await audit(actor!, `${shortName(actor!)} messaged ${(await db.member(otherId))!.name}`, otherId);
      return ok("Sent.", { data: { thread } });
    },
  },
  "message.read": {
    allow: need("feed.view"),
    run: async ({ actor, args }) => {
      const thread = str(args.thread);
      const mine = thread === `team:${actor!.id}` || (thread.startsWith("team:") && isStaff(actor)) || (thread.startsWith("dm:") && thread.split(":").includes(actor!.id));
      if (!mine) return fail(403, "That conversation isn't yours.");
      const unread = (await db.messages(thread)).filter((m) => !m.readBy.includes(actor!.id));
      await Promise.all(unread.map((m) => db.saveMessage({ ...m, readBy: [...m.readBy, actor!.id] })));
      return ok();
    },
  },

  // ─────────────────────────── Team: members ───────────────────────────
  "member.approve": {
    allow: need("members.approve"),
    run: async ({ actor, args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      if (m.state !== "pending") return ok(`${m.name} is already in.`);
      const auditId = await approve(actor!, m);
      return ok(`${m.name} is approved and got Iisha's welcome message.`, { auditId });
    },
  },
  "member.decline": {
    allow: need("members.approve"),
    run: async ({ actor, args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      if (m.state !== "pending") return fail(422, `${m.name} is already a member. Use “Remove from community” instead.`);
      const before = snap(m);
      await db.saveMember({ ...m, state: "removed", teamNotes: [m.teamNotes, "Join request declined."].filter(Boolean).join("\n") });
      const auditId = await audit(actor!, `${shortName(actor!)} declined ${m.name}'s request to join`, m.id, [{ coll: "members", id: m.id, before }], "members.approve");
      return ok(`${m.name}'s request is declined.`, { auditId });
    },
  },
  "member.plan": {
    allow: need("members.manage"),
    run: async ({ actor, args, now }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      const plan = str(args.plan) as PlanKey;
      if (!PLAN_ORDER.includes(plan)) return fail(422, "Please choose a plan.");
      if (m.role === "owner" || m.role === "admin") return fail(422, "Iisha's team always has full access, so there's no plan to change.");
      const s = await db.settings();
      const before = snap(m);
      const until = str(args.giftUntil);
      let text: string;
      if (until) {
        const end = new Date(`${until}T23:59:59`);
        if (Number.isNaN(+end) || +end < +now) return fail(422, "Please choose a gift end date in the future.");
        m.gift = { plan, until: end.toISOString() };
        if (m.state === "canceled" || m.state === "past_due") m.state = "active";
        m.curriculumStart ??= now.toISOString();
        m.planHistory.push({ at: now.toISOString(), plan, by: shortName(actor!), note: `Gift until ${fmtDate(end.toISOString())}` });
        text = `${shortName(actor!)} gifted ${s.plans[plan].name} to ${m.name} until ${fmtDate(end.toISOString())}`;
        await notify(m.id, "plan", `A gift from Iisha: ${s.plans[plan].name} is yours until ${fmtDate(end.toISOString())}.`, "/community/settings#plan");
      } else {
        m.gift = undefined;
        await setPlan(actor!, m, plan, now, "Changed by the team");
        text = `${shortName(actor!)} moved ${m.name} to ${s.plans[plan].name}`;
        await notify(m.id, "plan", `Your plan is now ${s.plans[plan].name}.`, "/community/settings#plan");
      }
      await db.saveMember(m);
      const auditId = await audit(actor!, text, m.id, [{ coll: "members", id: m.id, before }], "members.manage");
      return ok(`${text.replace(`${shortName(actor!)} `, "Done: ")}.`, { auditId });
    },
  },
  "member.pause": {
    allow: need("members.manage"),
    run: async ({ actor, args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      if (m.role !== "member" && actor!.role !== "owner") return fail(403, reason(actor, "team.manage"));
      if (m.role === "owner") return fail(422, "The owner's access can't be turned off.");
      const before = snap(m);
      await db.saveMember({ ...m, state: "paused" });
      const auditId = await audit(actor!, `${shortName(actor!)} turned access off for ${m.name}`, m.id, [{ coll: "members", id: m.id, before }], "members.manage");
      return ok(`${m.name}'s access is off. They'll see a friendly “paused” page.`, { auditId });
    },
  },
  "member.restore": {
    allow: need("members.manage"),
    run: async ({ actor, args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      const before = snap(m);
      await db.saveMember({ ...m, state: "active", pastDueSince: undefined });
      await notify(m.id, "approval", "Your access is back on. Welcome back to the Circle.", "/community");
      const auditId = await audit(actor!, `${shortName(actor!)} turned access back on for ${m.name}`, m.id, [{ coll: "members", id: m.id, before }], "members.manage");
      return ok(`${m.name}'s access is back on.`, { auditId });
    },
  },
  "member.payment": {
    allow: need("members.manage"),
    run: async ({ actor, args, now }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      const before = snap(m);
      await db.saveMember({ ...m, state: "active", pastDueSince: undefined, periodEndsAt: days(m.billing === "annual" ? 365 : 30, now) });
      const auditId = await audit(actor!, `${shortName(actor!)} marked ${m.name}'s payment as fixed`, m.id, [{ coll: "members", id: m.id, before }], "members.manage");
      return ok(`${m.name} is marked as paid.`, { auditId });
    },
  },
  "member.grant": {
    allow: need("members.manage"),
    run: async ({ actor, args }) => {
      const [m, course] = await Promise.all([db.member(str(args.id)), db.course(str(args.course))]);
      if (!m) return missing("That member");
      if (!course) return fail(422, "Please choose a course.");
      const before = snap(m);
      await db.saveMember({ ...m, grantedCourses: [...new Set([...m.grantedCourses, course.id])] });
      await notify(m.id, "plan", `A gift from Iisha: ${course.title} is open for you.`, `/community/classroom/${course.id}`);
      const auditId = await audit(actor!, `${shortName(actor!)} gave ${m.name} ${course.title} for free`, m.id, [{ coll: "members", id: m.id, before }], "members.manage");
      return ok(`${m.name} now has ${course.title}.`, { auditId });
    },
  },
  "member.drip": {
    allow: need("members.manage"),
    run: async ({ actor, args, now }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      const week = Math.max(1, Math.min(12, Number(args.week) || 1));
      const before = snap(m);
      await db.saveMember({ ...m, curriculumStart: days(-(week - 1) * 7, now) });
      const auditId = await audit(actor!, `${shortName(actor!)} opened the curriculum through week ${week} for ${m.name}`, m.id, [{ coll: "members", id: m.id, before }], "members.manage");
      return ok(`${m.name} can now open weeks 1 to ${week}.`, { auditId });
    },
  },
  "member.client": {
    allow: need("members.manage"),
    run: async ({ actor, args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      const before = snap(m);
      await db.saveMember({ ...m, isClient: !m.isClient });
      const auditId = await audit(actor!, `${shortName(actor!)} ${m.isClient ? "removed" : "added"} the “Client of Iisha” badge for ${m.name}`, m.id, [{ coll: "members", id: m.id, before }], "members.manage");
      return ok(m.isClient ? "Badge removed." : `${m.name} now shows the “Client of Iisha” badge.`, { auditId });
    },
  },
  "member.role": {
    allow: need("team.manage"),
    run: async ({ actor, args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      const role = str(args.role) as Role;
      if (!["admin", "moderator", "member"].includes(role)) return fail(422, "Please choose a role.");
      if (m.role === "owner" || m.id === actor!.id) return fail(422, "The owner's role can't be changed.");
      const before = snap(m);
      await db.saveMember({ ...m, role });
      await notify(m.id, "team", role === "member" ? "You're no longer on the community team." : `Iisha made you ${role === "admin" ? "an admin" : "a moderator"} of the community.`, "/community");
      const auditId = await audit(actor!, role === "member" ? `${shortName(actor!)} removed ${m.name} from the team` : `${shortName(actor!)} made ${m.name} ${role === "admin" ? "an admin" : "a moderator"}`, m.id, [{ coll: "members", id: m.id, before }], "team.manage");
      return ok(role === "member" ? `${m.name} is no longer on the team.` : `${m.name} is now ${role === "admin" ? "an admin" : "a moderator"}.`, { auditId });
    },
  },
  "member.remove": {
    allow: need("members.manage"),
    run: async ({ actor, args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      if (m.role === "owner") return fail(422, "The owner can't be removed.");
      if (m.role !== "member" && actor!.role !== "owner") return fail(403, reason(actor, "team.manage"));
      if (str(args.confirm).toLowerCase() !== firstName(m.name).toLowerCase()) return fail(422, `To confirm, please type their first name: ${firstName(m.name)}.`);
      const before = snap(m);
      await db.saveMember({ ...m, state: "removed", role: "member" });
      const auditId = await audit(actor!, `${shortName(actor!)} removed ${m.name} from the community`, m.id, [{ coll: "members", id: m.id, before }], m.role === "member" ? "members.manage" : "team.manage");
      return ok(`${m.name} is removed and can't rejoin with the same email unless you restore them.`, { auditId });
    },
  },
  "member.note": {
    allow: need("members.approve"),
    run: async ({ args }) => {
      const m = await db.member(str(args.id));
      if (!m) return missing("That member");
      await db.saveMember({ ...m, teamNotes: str(args.notes, 4000) });
      return ok("Note saved.");
    },
  },
  "member.bulk": {
    allow: (c) => check(c.actor, str(c.args.op) === "approve" ? "members.approve" : "members.manage", undefined, c.now),
    run: async (c) => {
      const ids = list(c.args.ids).slice(0, 100);
      const op = str(c.args.op);
      if (!ids.length) return fail(422, "Please tick at least one person first.");
      let done = 0;
      for (const id of ids) {
        const r = op === "approve" ? await ACTIONS["member.approve"].run({ ...c, args: { id } }) : op === "message" ? await ACTIONS["message.send"].run({ ...c, args: { thread: `team:${id}`, body: c.args.body } }) : op.startsWith("plan:") ? await ACTIONS["member.plan"].run({ ...c, args: { id, plan: op.slice(5) } }) : fail(422, "Please choose what to do.");
        if (r.ok) done++;
        else if (r.status === 422 && done === 0 && ids.length === 1) return r;
      }
      return ok(`Done for ${done} ${done === 1 ? "person" : "people"}.`);
    },
  },

  // ─────────────────────────── Team: content + settings ───────────────────────────
  "category.save": {
    allow: need("settings.edit"),
    run: async ({ actor, args }) => {
      const s = await db.settings();
      const before = snap(s);
      const cats = [...s.categories].sort((a, b) => a.order - b.order);
      let cat = cats.find((c) => c.id === str(args.id));
      if (!cat) {
        const name = str(args.name, 40);
        if (!name) return fail(422, "Please name the category.");
        cat = { id: `${slug(name)}-${newId().slice(-4)}`, name, description: "", post: "everyone", view: "everyone", order: cats.length + 1 };
        cats.push(cat);
      }
      if (str(args.name)) cat.name = str(args.name, 40);
      if ("description" in args) cat.description = str(args.description, 160);
      if (["everyone", "circle", "inner", "team"].includes(str(args.post))) cat.post = str(args.post) as Category["post"];
      if (["everyone", "inner"].includes(str(args.view))) cat.view = str(args.view) as Category["view"];
      const i = cats.indexOf(cat);
      const j = str(args.move) === "up" ? i - 1 : str(args.move) === "down" ? i + 1 : i;
      if (j !== i && cats[j]) [cats[i], cats[j]] = [cats[j], cats[i]];
      cats.forEach((c, n) => (c.order = n + 1));
      await db.saveSettings({ ...s, categories: cats });
      const auditId = await audit(actor!, `${shortName(actor!)} updated the “${cat.name}” category`, cat.id, [{ coll: "settings", id: "settings", before }], "settings.edit");
      return ok("Category saved.", { auditId });
    },
  },
  "course.save": {
    allow: need("settings.edit"),
    run: async ({ actor, args }) => {
      const s = await db.settings();
      const all = await db.courses();
      let course = all.find((c) => c.id === str(args.id));
      const undo: Undo[] = [];
      if (!course) {
        const title = str(args.title, 100);
        if (!title) return fail(422, "Please name the course.");
        course = { id: `${slug(title)}-${newId().slice(-4)}`, title, promise: "", cover: "classroom", access: { kind: "private" }, published: false, order: all.length + 1, modules: [{ id: "module-1", title: "Lessons", lessons: [] }] };
        undo.push({ coll: "courses", id: course.id, before: null });
      } else undo.push({ coll: "courses", id: course.id, before: snap(course) });
      if (str(args.title)) {
        course.title = str(args.title, 100);
        course.titleNeeds = undefined;
      }
      if ("promise" in args) course.promise = str(args.promise, 200);
      if ("_publish" in args) course.published = bool(args.published);
      const choice = str(args.access);
      if (choice) {
        const priceKey = course.access.kind === "buy" ? course.access.priceKey : course.id;
        const access: Record<string, CourseAccess> = {
          open: { kind: "open" },
          level: { kind: "level", level: Math.max(2, Math.min(9, Number(args.level) || 3)), orPlans: ["circle", "inner"] },
          circle: { kind: "plan", plans: ["circle", "inner"] },
          inner: { kind: "plan", plans: ["inner"] },
          buy: { kind: "buy", priceKey, includedIn: list(args.includedIn).filter((p): p is PlanKey => PLAN_ORDER.includes(p as PlanKey)) },
          drip: { kind: "drip", plans: ["circle", "inner"], everyDays: Math.max(1, Math.min(60, Number(args.everyDays) || 7)) },
          private: { kind: "private" },
        };
        if (!access[choice]) return fail(422, "Please choose who can see this course.");
        course.access = access[choice];
        if (choice === "buy" && ("price" in args || "memberPrice" in args)) {
          undo.push({ coll: "settings", id: "settings", before: snap(s) });
          await db.saveSettings({ ...s, prices: { ...s.prices, [priceKey]: str(args.price, 20), [`${priceKey}-member`]: str(args.memberPrice, 20) } });
        }
      }
      if (str(args.move)) {
        const i = all.findIndex((c) => c.id === course!.id);
        const other = all[str(args.move) === "up" ? i - 1 : i + 1];
        if (other) {
          undo.push({ coll: "courses", id: other.id, before: snap(other) });
          [course.order, other.order] = [other.order, course.order];
          await db.saveCourse(other);
        }
      }
      await db.saveCourse(course);
      const auditId = await audit(actor!, `${shortName(actor!)} updated the course “${course.title}”`, course.id, undo, "settings.edit");
      return ok("Course saved.", { auditId });
    },
  },
  "lesson.save": {
    allow: need("settings.edit"),
    run: async ({ actor, args }) => {
      const course = await db.course(str(args.course));
      if (!course) return missing("That course");
      if (course.source === "pilot-weeks") return fail(422, "This wording is Iisha's and is kept exactly as she wrote it. Changes go through her.");
      const before = snap(course);
      const downloads = list(str(args.downloads, 2000).split("\n")).map((line) => { const [title, file] = line.split("|").map((x) => x.trim()); return { title, file: file?.startsWith("/") || /^https:\/\//.test(file ?? "") ? file : undefined }; });
      const video = str(args.video, 300);
      if (video && !embedUrl(video)) return fail(422, "Please paste a YouTube or Vimeo link for the video.");
      const patch: Partial<Lesson> = { title: str(args.title, 140), video: video || undefined, summary: str(args.summary, 2000), takeaways: list(str(args.takeaways, 2000).split("\n")).slice(0, 6), action: str(args.action, 400), reflection: str(args.reflection, 400), downloads };
      if (!patch.title) return fail(422, "Please add a lesson title.");
      const id = str(args.lesson);
      if (bool(args.remove)) {
        if (course.source) return fail(422, "These weekly lessons can be edited, but not removed.");
        course.modules = course.modules.map((m) => ({ ...m, lessons: m.lessons.filter((l) => l.id !== id) }));
      } else if (course.source || flatLessons(course).some((l) => l.id === id)) {
        if (course.source) course.overrides = { ...course.overrides, [id]: patch };
        else course.modules = course.modules.map((m) => ({ ...m, lessons: m.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
      } else {
        if (!course.modules.length) course.modules = [{ id: "module-1", title: "Lessons", lessons: [] }];
        course.modules[course.modules.length - 1].lessons.push({ id: `${slug(patch.title)}-${newId().slice(-4)}`, title: patch.title, summary: patch.summary ?? "", takeaways: patch.takeaways ?? [], action: patch.action ?? "", reflection: patch.reflection ?? "", video: patch.video, downloads });
      }
      await db.saveCourse(course);
      const auditId = await audit(actor!, `${shortName(actor!)} ${bool(args.remove) ? "removed" : "saved"} the lesson “${patch.title}” in ${course.title}`, course.id, [{ coll: "courses", id: course.id, before }], "settings.edit");
      return ok(bool(args.remove) ? "Lesson removed." : "Lesson saved.", { auditId });
    },
  },
  "event.save": {
    allow: need("settings.edit"),
    run: async ({ actor, args }) => {
      const existing = await db.event(str(args.id));
      const title = str(args.title, 120);
      if (!title) return fail(422, "Please name the event.");
      const date = str(args.date);
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) return fail(422, "Please pick a date.");
      const plans = list(args.plans).filter((p): p is PlanKey => PLAN_ORDER.includes(p as PlanKey));
      const repeat = str(args.repeat);
      const e: CommunityEvent = {
        ...(existing ?? { id: `${slug(title)}-${newId().slice(-4)}`, sample: false }),
        title, host: str(args.host, 80) || "Iisha C. Silver", start: date ? zoned(date, str(args.time)) : "", minutes: Math.max(0, Math.min(600, Number(args.minutes) || 0)),
        repeat: repeat === "weekly" || repeat === "monthly" ? repeat : undefined, plans: plans.length ? plans : ["free", "circle", "inner"], description: str(args.description, 1000),
        zoom: /^https:\/\//.test(str(args.zoom)) ? str(args.zoom, 300) : undefined, replay: str(args.replay, 300) || undefined,
      };
      await db.saveEvent(e);
      const auditId = await audit(actor!, `${shortName(actor!)} ${existing ? "updated" : "added"} the event “${e.title}”`, e.id, [{ coll: "events", id: e.id, before: existing ? snap(existing) : null }], "settings.edit");
      return ok(existing ? "Event saved." : "Event added to the calendar.", { auditId });
    },
  },
  "event.delete": {
    allow: need("settings.edit"),
    run: async ({ actor, args }) => {
      const e = await db.event(str(args.id));
      if (!e) return missing("That event");
      await db.deleteEvent(e.id);
      const auditId = await audit(actor!, `${shortName(actor!)} removed the event “${e.title}”`, e.id, [{ coll: "events", id: e.id, before: e }], "settings.edit");
      return ok("Event removed.", { auditId });
    },
  },
  "event.email": {
    allow: need("settings.edit"),
    run: async ({ actor, args }) => {
      const e = await db.event(str(args.id));
      if (!e) return missing("That event");
      // Demo: nothing is emailed. // TODO: Email — send through Iisha's Gmail / Square Marketing at launch.
      await audit(actor!, `${shortName(actor!)} emailed members about “${e.title}” (demo, nothing was sent)`, e.id);
      return ok("Done. In the demo this is only written to the activity log, no email is sent.");
    },
  },
  "plans.save": {
    allow: need("settings.edit"),
    run: async ({ actor, args }) => {
      const s = await db.settings();
      const before = snap(s);
      for (const key of PLAN_ORDER) {
        const p = s.plans[key];
        if (str(args[`${key}-name`])) p.name = str(args[`${key}-name`], 40);
        if (`${key}-tagline` in args) p.tagline = str(args[`${key}-tagline`], 160);
        if (key !== "free") {
          if (`${key}-monthly` in args) p.monthly = str(args[`${key}-monthly`], 20);
          if (`${key}-annual` in args) p.annual = str(args[`${key}-annual`], 20);
        }
        if (`${key}-trial` in args) p.trialDays = Math.max(0, Math.min(90, Number(args[`${key}-trial`]) || 0));
        if (`${key}-benefits` in args) p.benefits = list(str(args[`${key}-benefits`], 3000).split("\n")).slice(0, 12);
        if (`${key}-cap` in args) p.seatCap = Math.max(0, Number(args[`${key}-cap`]) || 0);
      }
      for (const key of Object.keys(s.prices)) if (`price-${key}` in args) s.prices[key] = str(args[`price-${key}`], 20);
      await db.saveSettings(s);
      const auditId = await audit(actor!, `${shortName(actor!)} updated plans and prices`, "settings", [{ coll: "settings", id: "settings", before }], "settings.edit");
      return ok("Plans and prices saved. They're live across the community now.", { auditId });
    },
  },
  "settings.save": {
    allow: need("settings.edit"),
    run: async ({ actor, args }) => {
      const s = await db.settings();
      const before = snap(s);
      const section = str(args.section);
      if (section === "basics") {
        if (str(args.name)) s.name = str(args.name, 80);
        s.promise = str(args.promise, 160) || s.promise;
        s.guidelines = str(args.guidelines, 3000) || s.guidelines;
        s.welcomeMessage = str(args.welcomeMessage, 1500) || s.welcomeMessage;
        if (str(args.cover)) s.cover = str(args.cover, 60);
        s.questions = s.questions.map((q) => ({ ...q, label: str(args[`q-${q.id}`], 200) || q.label }));
      } else if (section === "rules") {
        s.autoApprove = { free: bool(args.autoFree), paid: bool(args.autoPaid) };
        s.points = { lesson: bool(args.pointsLesson), checkin: bool(args.pointsCheckin), lab: bool(args.pointsLab) };
        s.digest = bool(args.digest);
      } else if (section === "levels") {
        s.levelNames = s.levelNames.map((n, i) => str(args[`level-${i + 1}`], 30) || n);
      } else if (section === "rituals") {
        s.rituals = s.rituals.map((r) => ({ ...r, enabled: bool(args[`${r.id}-on`]), title: str(args[`${r.id}-title`], 140) || r.title, body: str(args[`${r.id}-body`], 2000) || r.body }));
      } else return fail(422, "Nothing to save.");
      await db.saveSettings(s);
      const auditId = await audit(actor!, `${shortName(actor!)} updated the community settings`, "settings", [{ coll: "settings", id: "settings", before }], "settings.edit");
      return ok("Settings saved.", { auditId });
    },
  },
  "digest.send": {
    allow: need("settings.edit"),
    run: async ({ actor, now }) => {
      const quiet = (await db.members()).filter((m) => m.role === "member" && isLive(m) && +now - +new Date(m.lastSeenAt) > 14 * 864e5);
      // Demo: nothing is emailed. // TODO: Email digest — weekly summary to quiet members at launch.
      await audit(actor!, `${shortName(actor!)} sent the “we miss you” digest to ${quiet.length} quiet ${quiet.length === 1 ? "member" : "members"} (demo, nothing was sent)`);
      return ok(`Done for ${quiet.length} quiet ${quiet.length === 1 ? "member" : "members"}. In the demo this is only written to the activity log.`);
    },
  },
  "audit.undo": {
    allow: need("moderate"),
    run: async ({ actor, args, now }) => {
      const e = await db.auditEntry(str(args.id));
      if (!e) return missing("That change");
      if (!canUndo(e, now)) return fail(422, e.undoneAt ? "That change was already undone." : "That change can't be undone any more. Undo is available for 24 hours.");
      const gate = check(actor, (e.needs as Action) ?? "members.manage", undefined, now);
      if (!gate.ok) return gate;
      for (const u of [...e.undo!].reverse()) await db.restore(u.coll, u.id, u.before);
      await db.saveAudit({ ...e, undoneAt: now.toISOString() });
      await audit(actor!, `${shortName(actor!)} undid: ${e.text}`, e.targetId);
      return ok("Undone. Everything is back the way it was.");
    },
  },
  "demo.reset": {
    allow: need("demo.reset"),
    run: async () => {
      if (!DEMO) return fail(403, "The community is live, so the demo data can't be reset.");
      await resetDemo();
      return ok("The demo is back to its starting point.");
    },
  },
};

export const ACTION_NAMES = Object.keys(ACTIONS);
export type { Course };
