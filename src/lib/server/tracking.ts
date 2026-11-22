/**
 * Small shop counters for the owner dashboard. Server-only.
 *   clicks/<YYYY-MM>   { amazon: 12, solex: 4, ... }   clicks to each affiliate storefront (via /go/<id>)
 *   orders/<orderId>   { status, notes, updatedAt }     Iisha's pickup status for a website order
 *   recovery/<orderId> { status, notes, updatedAt }     Iisha's progress on a recovery-program enrollment
 * Netlify Blobs in production; .data/ files locally (same pattern as store.ts).
 */
import { blobStore } from "@/lib/server/blobs";
import { promises as fs } from "node:fs";
import path from "node:path";

const NAME = "shop";
type KV = { get<T>(k: string): Promise<T | null>; set(k: string, v: unknown): Promise<void> };

function kv(): KV {
  try {
    const s = blobStore(NAME);
    return {
      get: async <T,>(k: string) => ((await s.get(k, { type: "json" })) as T | null) ?? null,
      set: async (k, v) => {
        await s.setJSON(k, v);
      },
    };
  } catch {
    const root = path.join(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME ? "/tmp/icb-data" : path.join(process.cwd(), ".data"), NAME);
    const file = (k: string) => path.join(root, `${k.replace(/\//g, "__")}.json`);
    return {
      get: async <T,>(k: string) => {
        try {
          return JSON.parse(await fs.readFile(file(k), "utf8")) as T;
        } catch {
          return null;
        }
      },
      set: async (k, v) => {
        await fs.mkdir(root, { recursive: true });
        await fs.writeFile(file(k), JSON.stringify(v));
      },
    };
  }
}

const monthKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit" }).slice(0, 7);

export async function countClick(target: string) {
  try {
    const store = kv();
    const key = `clicks/${monthKey(new Date())}`;
    const cur = (await store.get<Record<string, number>>(key)) ?? {};
    cur[target] = (cur[target] ?? 0) + 1;
    await store.set(key, cur);
  } catch (e) {
    console.error("[shop] click count failed", e); // never block the redirect
  }
}

/** Clicks for this month and last month, per storefront id. */
export async function getClicks() {
  const store = kv();
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() - 1, 15);
  const [thisMonth, lastMonth] = await Promise.all([store.get<Record<string, number>>(`clicks/${monthKey(now)}`), store.get<Record<string, number>>(`clicks/${monthKey(last)}`)]);
  return { thisMonth: thisMonth ?? {}, lastMonth: lastMonth ?? {}, labels: { thisMonth: now.toLocaleDateString("en-US", { month: "long" }), lastMonth: last.toLocaleDateString("en-US", { month: "long" }) } };
}

export type OrderMark = { status: string; notes: string; updatedAt: string };
export const ORDER_STATUSES = ["New", "Ready for pickup", "Picked up", "Shipped"] as const;

export const getOrderMarks = async (ids: string[]) => {
  const store = kv();
  const marks = await Promise.all(ids.map((id) => store.get<OrderMark>(`orders/${id}`)));
  return new Map(ids.map((id, i) => [id, marks[i]]));
};

export async function setOrderMark(id: string, patch: Partial<OrderMark>) {
  const store = kv();
  const cur = (await store.get<OrderMark>(`orders/${id}`)) ?? { status: "New", notes: "", updatedAt: "" };
  await store.set(`orders/${id}`, { ...cur, ...patch, updatedAt: new Date().toISOString() });
}

/* recovery/<orderId>   { status, notes, updatedAt }   Iisha's progress on a recovery-program enrollment */
export const RECOVERY_STATUSES = ["New", "Care plan sent", "Roadmap Zoom done", "In program", "Completed", "Cancelled"] as const;

/** alertedAt: when Iisha's new-enrollment email went out. confirmedTo: where the client's confirmation went (if they asked for one). */
export type RecoveryMark = OrderMark & { alertedAt?: string; confirmedTo?: string; emailLog?: string };

export const getRecoveryMark = async (id: string) => kv().get<RecoveryMark>(`recovery/${id}`);

export const getRecoveryMarks = async (ids: string[]) => {
  const store = kv();
  const marks = await Promise.all(ids.map((id) => store.get<RecoveryMark>(`recovery/${id}`)));
  return new Map(ids.map((id, i) => [id, marks[i]]));
};

export async function setRecoveryMark(id: string, patch: Partial<RecoveryMark>) {
  const store = kv();
  const cur = (await store.get<RecoveryMark>(`recovery/${id}`)) ?? { status: "New", notes: "", updatedAt: "" };
  await store.set(`recovery/${id}`, { ...cur, ...patch, updatedAt: new Date().toISOString() });
}

/* gift/<key>  { total, email, qr, other, last }   downloads of a masterclass gift */
export type GiftCount = { total: number; email: number; qr: number; other: number; last: string };
export const getGiftCount = async (key: string) => (await kv().get<GiftCount>(`gift/${key}`)) ?? { total: 0, email: 0, qr: 0, other: 0, last: "" };
export async function countGift(key: string, src: string) {
  const c = await getGiftCount(key);
  const k: "email" | "qr" | "other" = src === "email" ? "email" : src === "qr" ? "qr" : "other";
  await kv().set(`gift/${key}`, { ...c, total: c.total + 1, [k]: c[k] + 1, last: new Date().toISOString() });
}
