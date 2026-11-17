/**
 * Shared building blocks for the community service layer: the activity log (with Undo), notifications,
 * points and levels, the welcome message, weekly rituals, and read helpers used by pages.
 */
import { LEVEL_UNLOCKS, TZ, UNDO_HOURS, firstName, levelFor } from "@/lib/community/config";
import { effectivePlan, isLive, type Actor } from "@/lib/community/permissions";
import type { AuditEntry, Member, Notification, Post, Result, Settings, Undo } from "@/lib/community/types";
import { db, newId } from "./store";

export type Args = Record<string, unknown>;
export type ServiceResult = Result & { cookies?: { name: string; value: string; maxAge: number }[] };

export const str = (v: unknown, max = 4000) => (typeof v === "string" ? v : v == null ? "" : String(v)).trim().slice(0, max);
export const bool = (v: unknown) => v === true || v === 1 || v === "true" || v === "on" || v === "1" || v === "yes";
export const list = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => str(x)) : str(v, 20000).split(/[\n,]/).map((x) => x.trim())).filter(Boolean);

export const ok = (message?: string, extra: Partial<ServiceResult> = {}): ServiceResult => ({ status: 200, message, ...extra, ok: true });
export const fail = (status: number, message: string): ServiceResult => ({ ok: false, status, message });
export const missing = (what = "That") => fail(404, `${what} couldn't be found. It may have been removed.`);

/** "Iisha", "Team Admin", "Azaiah": how a team member is named in the activity log. */
export const shortName = (m: Member) => (m.role === "member" ? firstName(m.name) : m.name.includes("(") ? m.name.split("(")[0].trim() : firstName(m.name));

export const fmtDate = (iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) => new Date(iso).toLocaleDateString("en-US", { timeZone: TZ, ...opts });

/** Writes one line to the activity log. `undo` holds the copies needed to put things back. */
export async function audit(actor: Member, text: string, targetId?: string, undo?: Undo[], needs?: string): Promise<string> {
  const now = new Date();
  const entry: AuditEntry & { needs?: string } = { id: newId(now), at: now.toISOString(), actorId: actor.id, actorName: shortName(actor), text, targetId, undo, needs };
  await db.saveAudit(entry);
  return entry.id;
}
export const canUndo = (e: AuditEntry, now = new Date()) => !!e.undo?.length && !e.undoneAt && +now - +new Date(e.at) < UNDO_HOURS * 36e5;

export async function notify(memberId: string, kind: Notification["kind"], text: string, href: string, opts: { actor?: string; group?: string; groupText?: (names: string[]) => string } = {}) {
  if (opts.actor === memberId) return;
  const now = new Date();
  if (opts.group) {
    const existing = (await db.notifications(memberId)).find((n) => n.group === opts.group && !n.read);
    if (existing) {
      const actors = [...new Set([...(existing.actors ?? []), ...(opts.actor ? [opts.actor] : [])])];
      const names = await Promise.all(actors.map(async (id) => firstName((await db.member(id))?.name ?? "Someone")));
      await db.saveNotification({ ...existing, actors, at: now.toISOString(), text: opts.groupText ? opts.groupText(names) : text });
      return;
    }
  }
  await db.saveNotification({ id: newId(now), memberId, kind, text, href, at: now.toISOString(), read: false, actors: opts.actor ? [opts.actor] : undefined, group: opts.group });
}

export const batchNames = (names: string[]) => (names.length <= 2 ? names.join(" and ") : `${names[0]} and ${names.length - 1} others`);

export async function team() {
  return (await db.members()).filter((m) => (m.role === "owner" || m.role === "admin") && isLive(m));
}
export async function notifyTeam(text: string, href: string, actor?: string) {
  await Promise.all((await team()).map((t) => notify(t.id, "team", text, href, { actor })));
}

/** Adds (or removes) points and tells the member when they reach a new level. */
export async function addPoints(memberId: string, n: number, why: string) {
  const m = await db.member(memberId);
  if (!m || m.role !== "member") return; // the team doesn't collect points or appear on leaderboards
  const before = levelFor(m.points).level;
  m.points = Math.max(0, m.points + n);
  await db.saveMember(m);
  const p = await db.progress(memberId);
  p.pointLog.push({ at: new Date().toISOString(), n, why });
  await db.saveProgress(p);
  const after = levelFor(m.points).level;
  if (after > before) {
    const s = await db.settings();
    const unlock = LEVEL_UNLOCKS[after];
    await notify(memberId, "level", `You reached Level ${after}, ${s.levelNames[after - 1]}.${unlock ? ` ${unlock.replace(/^The /, "The ")} is unlocked!` : ""}`, unlock ? "/community/classroom/wash-day-blueprint" : "/community/leaderboards");
  }
}

/** The automatic hello from Iisha when someone is let in. */
export async function sendWelcome(m: Member, s: Settings) {
  const owner = (await db.members()).find((x) => x.role === "owner");
  if (!owner) return;
  const now = new Date();
  await db.saveMessage({ id: newId(now), threadId: `team:${m.id}`, fromId: owner.id, body: s.welcomeMessage.replace("{first}", firstName(m.name)), at: now.toISOString(), readBy: [owner.id] });
  await notify(m.id, "approval", "You're in. Welcome to the Circle! Start with your first four steps.", "/community/welcome");
}

/**
 * Weekly rituals (Monday Lesson Drop, Wash Day Wednesday, Friday Wins, the monthly theme) are data in
 * Settings. When the feed is opened, any ritual that is due and hasn't been posted yet is posted as Iisha.
 * // TODO: move to a scheduled function at launch so posts appear even when nobody opens the feed.
 */
export async function ensureRituals(now = new Date()) {
  const s = await db.settings();
  const due: { key: string; r: Settings["rituals"][number] }[] = [];
  for (const r of s.rituals) {
    if (!r.enabled) continue;
    let key: string;
    if (r.monthlyDay) {
      if (now.getUTCDate() < r.monthlyDay) continue;
      key = `${r.id}:${now.toISOString().slice(0, 7)}-${String(r.monthlyDay).padStart(2, "0")}`;
    } else {
      const back = (now.getUTCDay() - (r.weekday ?? 1) + 7) % 7;
      key = `${r.id}:${new Date(+now - back * 864e5).toISOString().slice(0, 10)}`;
    }
    if (!s.ritualLog.includes(key)) due.push({ key, r });
  }
  if (!due.length) return;
  const owner = (await db.members()).find((x) => x.role === "owner");
  if (!owner) return;
  s.ritualLog = [...s.ritualLog, ...due.map((d) => d.key)].slice(-60);
  await db.saveSettings(s); // first, so two visitors at once don't both post it
  for (const { r } of due) {
    const at = now.toISOString();
    const post: Post = { id: newId(now), authorId: owner.id, categoryId: r.categoryId, title: r.title, body: r.body, images: [], likes: [], reports: [], ritual: r.id, createdAt: at, updatedAt: at, lastActivityAt: at };
    await db.savePost(post);
  }
}

/** Day-5 check-in from Iisha: "How's your first week going?" */
export async function ensureNudge(m: Member, now = new Date()) {
  const days = (+now - +new Date(m.joinedAt)) / 864e5;
  if (m.role !== "member" || days < 5 || days > 9) return;
  const mine = await db.notifications(m.id);
  if (mine.some((n) => n.kind === "nudge")) return;
  await notify(m.id, "nudge", "How's your first week going? Reply to Iisha.", "/community/messages");
}

/** Everyone whose name is written after an @ in the text. */
export function mentions(body: string, members: Member[]) {
  return members.filter((m) => isLive(m) && body.toLowerCase().includes(`@${m.name.toLowerCase()}`));
}

export const planLabel = (m: Member, s: Settings, now = new Date()) => s.plans[effectivePlan(m, now)].name;

export function describe(a: Actor) {
  return a ? `${a.name} (${a.role === "member" ? a.plan : a.role}, ${a.state})` : "Guest";
}
