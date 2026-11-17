/**
 * Community storage. Server-only. Same pattern as src/lib/server/store.ts:
 *   Production: Netlify Blobs, store "community".
 *   Local dev / anywhere without Blobs: JSON files under .data/community/.
 *
 * Keys: members/<id>, posts/<id>, comments/<postId>/<id>, progress/<memberId>, courses/<id>, events/<id>,
 *       settings, audit/<ts>, notifications/<memberId>/<id>, messages/<threadId>/<id>, purchases/<id>, media/<id>
 *
 * // TODO: Supabase — replace this file with tables (members, posts, comments, progress, courses, events,
 * // notifications, messages, purchases, audit) + row-level security. The service layer and every screen
 * // keep the same function signatures, so going live is a backend-only change.
 */
import { blobStore } from "../blobs";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { AuditEntry, Comment, CommunityEvent, Course, Member, Message, Notification, Post, Progress, Purchase, Settings } from "@/lib/community/types";
import { buildSeed } from "@/lib/community/seed";

const STORE = "community";

type KV = {
  get(key: string): Promise<unknown | null>;
  set(key: string, value: unknown): Promise<void>;
  del(key: string): Promise<void>;
  list(prefix: string): Promise<string[]>;
};

function blobsKV(): KV | null {
  try {
    const s = blobStore(STORE);
    return {
      get: async (k) => (await s.get(k, { type: "json" })) ?? null,
      set: async (k, v) => {
        await s.setJSON(k, v);
      },
      del: (k) => s.delete(k),
      list: async (prefix) => (await s.list({ prefix })).blobs.map((b) => b.key),
    };
  } catch {
    return null; // MissingBlobsEnvironmentError outside Netlify
  }
}

function fileKV(): KV {
  const base = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME ? "/tmp/icb-data" : path.join(process.cwd(), ".data");
  const root = path.join(base, STORE);
  // Keys contain "/" and ":" (thread ids), which aren't safe in file names on every system.
  const file = (k: string) => path.join(root, `${encodeURIComponent(k)}.json`);
  return {
    get: async (k) => {
      try {
        return JSON.parse(await fs.readFile(file(k), "utf8"));
      } catch {
        return null;
      }
    },
    set: async (k, v) => {
      await fs.mkdir(root, { recursive: true });
      await fs.writeFile(file(k), JSON.stringify(v));
    },
    del: async (k) => {
      await fs.rm(file(k), { force: true });
    },
    list: async (prefix) => {
      try {
        return (await fs.readdir(root))
          .filter((n) => n.endsWith(".json"))
          .map((n) => decodeURIComponent(n.slice(0, -5)))
          .filter((k) => k.startsWith(prefix));
      } catch {
        return [];
      }
    },
  };
}

let kvCached: { kv: KV; kind: "blobs" | "file" } | null = null;
function raw() {
  if (!kvCached) {
    const b = blobsKV();
    kvCached = b ? { kv: b, kind: "blobs" } : { kv: fileKV(), kind: "file" };
  }
  return kvCached;
}
export const communityBackend = () => raw().kind;

/** Writes the demo community the first time anything is read (or after a reset). */
let seeding: Promise<void> | null = null;
async function writeSeed() {
  const kv = raw().kv;
  const seed = buildSeed(new Date());
  const writes: [string, unknown][] = [
    ...seed.members.map((m) => [`members/${m.id}`, m] as [string, unknown]),
    ...seed.posts.map((p) => [`posts/${p.id}`, p] as [string, unknown]),
    ...seed.comments.map((c) => [`comments/${c.postId}/${c.id}`, c] as [string, unknown]),
    ...seed.progress.map((p) => [`progress/${p.memberId}`, p] as [string, unknown]),
    ...seed.courses.map((c) => [`courses/${c.id}`, c] as [string, unknown]),
    ...seed.events.map((e) => [`events/${e.id}`, e] as [string, unknown]),
    ...seed.notifications.map((n) => [`notifications/${n.memberId}/${n.id}`, n] as [string, unknown]),
    ...seed.messages.map((m) => [`messages/${m.threadId}/${m.id}`, m] as [string, unknown]),
    ...seed.purchases.map((p) => [`purchases/${p.id}`, p] as [string, unknown]),
    ...seed.audit.map((a) => [`audit/${a.id}`, a] as [string, unknown]),
  ];
  for (let i = 0; i < writes.length; i += 25) await Promise.all(writes.slice(i, i + 25).map(([k, v]) => kv.set(k, v)));
  await kv.set("settings", seed.settings); // last: its presence means "seeded"
}
async function kv(): Promise<KV> {
  const k = raw().kv;
  if (!seeding) {
    seeding = (async () => {
      if (!(await k.get("settings"))) await writeSeed();
    })().catch((e) => {
      seeding = null;
      throw e;
    });
  }
  await seeding;
  return k;
}

export async function resetDemo() {
  const k = raw().kv;
  const keys = await k.list("");
  for (let i = 0; i < keys.length; i += 25) await Promise.all(keys.slice(i, i + 25).map((x) => k.del(x)));
  seeding = writeSeed();
  await seeding;
}

export function newId(now = new Date()) {
  const ts = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 17);
  return `${ts}-${crypto.randomBytes(3).toString("hex")}`;
}

async function all<T>(prefix: string): Promise<T[]> {
  const k = await kv();
  const keys = (await k.list(prefix)).sort();
  const rows = await Promise.all(keys.map((x) => k.get(x)));
  return rows.filter((r) => r !== null) as T[];
}
const one = async <T>(key: string) => ((await (await kv()).get(key)) as T | null) ?? null;
const put = async (key: string, v: unknown) => (await kv()).set(key, v);
const drop = async (key: string) => (await kv()).del(key);

export const db = {
  settings: async () => {
    let s = await one<Settings>("settings");
    if (!s) {
      // The data was cleared underneath a running server (or another instance is mid-reset): seed again.
      seeding = null;
      s = await one<Settings>("settings");
    }
    return s!;
  },
  saveSettings: (s: Settings) => put("settings", s),

  members: () => all<Member>("members/"),
  member: (id: string) => one<Member>(`members/${id}`),
  saveMember: (m: Member) => put(`members/${m.id}`, m),

  posts: () => all<Post>("posts/"),
  post: (id: string) => one<Post>(`posts/${id}`),
  savePost: (p: Post) => put(`posts/${p.id}`, p),
  deletePost: (id: string) => drop(`posts/${id}`),

  comments: (postId?: string) => all<Comment>(postId ? `comments/${postId}/` : "comments/"),
  comment: (postId: string, id: string) => one<Comment>(`comments/${postId}/${id}`),
  saveComment: (c: Comment) => put(`comments/${c.postId}/${c.id}`, c),
  deleteComment: (postId: string, id: string) => drop(`comments/${postId}/${id}`),

  progress: async (memberId: string): Promise<Progress> => (await one<Progress>(`progress/${memberId}`)) ?? { memberId, lessons: {}, labs: {}, checkins: [], pointLog: [] },
  allProgress: () => all<Progress>("progress/"),
  saveProgress: (p: Progress) => put(`progress/${p.memberId}`, p),

  courses: async () => (await all<Course>("courses/")).sort((a, b) => a.order - b.order),
  course: (id: string) => one<Course>(`courses/${id}`),
  saveCourse: (c: Course) => put(`courses/${c.id}`, c),

  events: () => all<CommunityEvent>("events/"),
  event: (id: string) => one<CommunityEvent>(`events/${id}`),
  saveEvent: (e: CommunityEvent) => put(`events/${e.id}`, e),
  deleteEvent: (id: string) => drop(`events/${id}`),

  notifications: async (memberId: string) => (await all<Notification>(`notifications/${memberId}/`)).reverse(),
  saveNotification: (n: Notification) => put(`notifications/${n.memberId}/${n.id}`, n),

  messages: (threadId?: string) => all<Message>(threadId ? `messages/${threadId}/` : "messages/"),
  saveMessage: (m: Message) => put(`messages/${m.threadId}/${m.id}`, m),

  purchases: () => all<Purchase>("purchases/"),
  savePurchase: (p: Purchase) => put(`purchases/${p.id}`, p),

  audit: async () => (await all<AuditEntry>("audit/")).reverse(),
  auditEntry: (id: string) => one<AuditEntry>(`audit/${id}`),
  saveAudit: (a: AuditEntry) => put(`audit/${a.id}`, a),

  media: (id: string) => one<{ type: string; b64: string; by: string }>(`media/${id}`),
  saveMedia: (id: string, m: { type: string; b64: string; by: string }) => put(`media/${id}`, m),

  /** Used by Undo: put a saved copy back, or remove what was created. */
  restore: async (coll: string, id: string, before: unknown | null) => {
    const key = coll === "settings" ? "settings" : `${coll}/${id}`;
    if (before === null) await drop(key);
    else await put(key, before);
  },
};
