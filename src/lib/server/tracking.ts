/**
 * Small shop counters for the owner dashboard. Server-only.
 *   clicks/<YYYY-MM>   { amazon: 12, solex: 4, ... }   clicks to each affiliate storefront (via /go/<id>)
 *   orders/<orderId>   { status, notes, updatedAt }     Iisha's pickup status for a website order
 * Netlify Blobs in production; .data/ files locally (same pattern as store.ts).
 */
import { getStore } from "@netlify/blobs";
import { promises as fs } from "node:fs";
import path from "node:path";

const NAME = "shop";
type KV = { get<T>(k: string): Promise<T | null>; set(k: string, v: unknown): Promise<void> };

function kv(): KV {
  try {
    const s = getStore({ name: NAME, consistency: "strong" });
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
export const ORDER_STATUSES = ["New", "Ready for pickup", "Picked up"] as const;

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
