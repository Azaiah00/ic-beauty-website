/**
 * In-salon products, live from Iisha's Square item library (the same items her old Square Online
 * store sold): names, photos, prices and stock. "Buy" creates a Square checkout link for that one
 * item, so payment, receipts and inventory all stay in her Square account.
 *
 * Shown: regular (non-service) items at her location that aren't archived, aren't hidden from her
 * online store, and have a price. Stock is read from Square Inventory; tracked items at 0 show "Sold out".
 * Cached 15 minutes under the "square" tag (webhook + dashboard button refresh it).
 */
import { unstable_cache } from "next/cache";
import { base, VERSION, LOCATION, SQUARE_TAG, REVALIDATE, listCatalog, atLocation, usd, type CatalogObject, type Variation } from "./squareLive";

export type RetailVariation = { id: string; name: string; price: string; cents: number; soldOut: boolean };
export type RetailItem = { id: string; name: string; description: string; category: string; image: string | null; variations: RetailVariation[]; soldOut: boolean; price: string };

const HIDDEN = new Set(["HIDDEN", "UNAVAILABLE"]); // Square Online visibility values that mean "not for sale online"

/** Square reporting categories are lower-case in her account ("styling products"); show them in title case. */
const titleCase = (s: string) => s.replace(/\b([a-z])/g, (m) => m.toUpperCase()).replace(/\bW\/\b/gi, "w/").replace(/\b(And|Of|For)\b/g, (m) => m.toLowerCase());

async function postCounts(ids: string[]): Promise<Map<string, number> | null> {
  if (!process.env.SQUARE_ACCESS_TOKEN || !ids.length) return new Map();
  const counts = new Map<string, number>();
  try {
    for (let i = 0; i < ids.length; i += 500) {
      let cursor: string | undefined;
      do {
        const res = await fetch(`${base()}/v2/inventory/counts/batch-retrieve`, {
          method: "POST",
          headers: { Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`, "Square-Version": VERSION, "Content-Type": "application/json" },
          body: JSON.stringify({ catalog_object_ids: ids.slice(i, i + 500), location_ids: [LOCATION], states: ["IN_STOCK"], cursor }),
          signal: AbortSignal.timeout(8000),
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { counts?: { catalog_object_id: string; quantity: string }[]; cursor?: string };
        for (const c of json.counts ?? []) counts.set(c.catalog_object_id, (counts.get(c.catalog_object_id) ?? 0) + Number(c.quantity));
        cursor = json.cursor;
      } while (cursor);
    }
    return counts;
  } catch (e) {
    console.error("[square] inventory counts failed", e);
    return null;
  }
}

const tracked = (v: Variation) => {
  const o = v.item_variation_data?.location_overrides?.find((x) => x.location_id === LOCATION);
  return o?.track_inventory ?? v.item_variation_data?.track_inventory ?? false;
};
const forcedSoldOut = (v: Variation) => !!v.item_variation_data?.location_overrides?.find((x) => x.location_id === LOCATION)?.sold_out;

async function load(): Promise<RetailItem[]> {
  const objects = await listCatalog();
  if (!objects) return [];
  const byId = new Map(objects.map((o) => [o.id, o]));
  const name = (id?: string) => (id ? (byId.get(id) as CatalogObject | undefined)?.category_data?.name : undefined);

  const items = objects.filter((o) => {
    const d = o.item_data;
    return o.type === "ITEM" && !o.is_deleted && d && (d.product_type ?? "REGULAR") === "REGULAR" && !d.is_archived && !HIDDEN.has(d.ecom_visibility ?? "") && atLocation(o);
  });

  const variations = items.flatMap((o) => (o.item_data!.variations ?? []).filter((v) => !v.is_deleted && v.item_variation_data?.sellable !== false && v.item_variation_data?.pricing_type !== "VARIABLE_PRICING" && (v.item_variation_data?.price_money?.amount ?? 0) > 0));
  const counts = await postCounts(variations.filter(tracked).map((v) => v.id));

  return items
    .map((o): RetailItem => {
      const d = o.item_data!;
      const vs = (d.variations ?? [])
        .filter((v) => variations.includes(v))
        .map((v) => {
          const cents = v.item_variation_data!.price_money!.amount!;
          const soldOut = forcedSoldOut(v) || (tracked(v) && counts !== null && (counts.get(v.id) ?? 0) <= 0);
          return { id: v.id, name: v.item_variation_data?.name ?? "", price: usd(cents), cents, soldOut };
        });
      const cat = name(d.reporting_category?.id) ?? name(d.categories?.[0]?.id) ?? name(d.category_id);
      const img = d.image_ids?.map((id) => byId.get(id)?.image_data?.url).find(Boolean) ?? null;
      const prices = vs.map((v) => v.cents);
      const lo = Math.min(...prices);
      const hi = Math.max(...prices);
      return {
        id: o.id,
        name: (d.name ?? "").trim(),
        description: (d.description_plaintext ?? d.description ?? "").trim(),
        category: cat ? titleCase(cat) : "From the studio",
        image: img,
        variations: vs,
        soldOut: vs.length > 0 && vs.every((v) => v.soldOut),
        price: lo === hi ? usd(lo) : `${usd(lo)} – ${usd(hi)}`,
      };
    })
    .filter((i) => i.name && i.variations.length)
    .sort((a, b) => Number(a.soldOut) - Number(b.soldOut) || a.name.localeCompare(b.name));
}

/** Live in-salon products. Empty array when Square isn't connected (the page then shows the saved list). */
export const getRetail = unstable_cache(load, ["square-retail-v1"], { revalidate: REVALIDATE, tags: [SQUARE_TAG] });

/** Products grouped by her Square category; categories with in-stock items first. */
export function groupRetail(list: RetailItem[]) {
  const groups = new Map<string, RetailItem[]>();
  for (const i of list) groups.set(i.category, [...(groups.get(i.category) ?? []), i]);
  return [...groups.entries()]
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => (a.category === "From the studio" ? 1 : b.category === "From the studio" ? -1 : a.category.localeCompare(b.category)));
}

/**
 * Square checkout link for one product. Only variations currently listed on the site can be bought,
 * so nobody can craft a link to a hidden or archived item.
 */
export async function createCheckout(variationId: string, quantity: number, redirectUrl: string, note: string) {
  const list = await load(); // fresh read: never sell from a stale "in stock"
  const item = list.find((i) => i.variations.some((v) => v.id === variationId));
  const v = item?.variations.find((x) => x.id === variationId);
  if (!item || !v) return { ok: false as const, reason: "missing" };
  if (v.soldOut) return { ok: false as const, reason: "soldout" };
  const res = await fetch(`${base()}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`, "Square-Version": VERSION, "Content-Type": "application/json" },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      description: `Website order: ${item.name}`,
      order: { location_id: LOCATION, reference_id: "website", metadata: { channel: "website" }, line_items: [{ catalog_object_id: variationId, quantity: String(quantity) }] },
      checkout_options: { redirect_url: redirectUrl, ask_for_shipping_address: false },
      payment_note: note,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const json = (await res.json().catch(() => ({}))) as { payment_link?: { url?: string }; errors?: { code: string; detail?: string }[] };
  if (!res.ok || !json.payment_link?.url) {
    console.error("[square] payment link failed", res.status, json.errors?.[0]);
    return { ok: false as const, reason: "error" };
  }
  return { ok: true as const, url: json.payment_link.url };
}


/* ------------------------------ Website orders ------------------------------ */

export type WebsiteOrder = {
  id: string;
  createdAt: string;
  total: string;
  items: { name: string; qty: string }[];
  customer: { name: string; email: string; phone: string };
  state: string;
};

type SqOrder = {
  id: string;
  created_at: string;
  state: string;
  reference_id?: string;
  metadata?: Record<string, string>;
  customer_id?: string;
  tenders?: { customer_id?: string }[];
  net_amount_due_money?: { amount?: number };
  total_money?: { amount?: number };
  line_items?: { name?: string; variation_name?: string; quantity?: string }[];
  fulfillments?: { pickup_details?: { recipient?: { display_name?: string; email_address?: string; phone_number?: string } }; shipment_details?: { recipient?: { display_name?: string; email_address?: string; phone_number?: string } } }[];
};

/** Paid orders placed through the website's Buy buttons, newest first (last 90 days). null = Square not connected. */
export async function getWebsiteOrders(): Promise<WebsiteOrder[] | null> {
  if (!process.env.SQUARE_ACCESS_TOKEN) return null;
  const headers = { Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`, "Square-Version": VERSION, "Content-Type": "application/json" };
  try {
    const res = await fetch(`${base()}/v2/orders/search`, {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        location_ids: [LOCATION],
        limit: 200,
        query: {
          filter: { date_time_filter: { created_at: { start_at: new Date(Date.now() - 90 * 864e5).toISOString() } }, state_filter: { states: ["OPEN", "COMPLETED"] } },
          sort: { sort_field: "CREATED_AT", sort_order: "DESC" },
        },
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const orders = (((await res.json()) as { orders?: SqOrder[] }).orders ?? []).filter(
      (o) => (o.reference_id === "website" || o.metadata?.channel === "website") && (o.tenders?.length ?? 0) > 0 && (o.net_amount_due_money?.amount ?? 0) === 0,
    );
    const ids = [...new Set(orders.map((o) => o.customer_id ?? o.tenders?.find((t) => t.customer_id)?.customer_id).filter(Boolean) as string[])];
    const customers = new Map<string, { name: string; email: string; phone: string }>();
    await Promise.all(
      ids.slice(0, 50).map(async (id) => {
        const r = await fetch(`${base()}/v2/customers/${id}`, { headers, cache: "no-store", signal: AbortSignal.timeout(8000) }).catch(() => null);
        const c = r && r.ok ? ((await r.json()) as { customer?: { given_name?: string; family_name?: string; email_address?: string; phone_number?: string } }).customer : undefined;
        if (c) customers.set(id, { name: [c.given_name, c.family_name].filter(Boolean).join(" "), email: c.email_address ?? "", phone: c.phone_number ?? "" });
      }),
    );
    return orders.map((o) => {
      const cid = o.customer_id ?? o.tenders?.find((t) => t.customer_id)?.customer_id;
      const r = o.fulfillments?.[0]?.pickup_details?.recipient ?? o.fulfillments?.[0]?.shipment_details?.recipient;
      return {
        id: o.id,
        createdAt: o.created_at,
        state: o.state,
        total: usd(o.total_money?.amount ?? 0),
        items: (o.line_items ?? []).map((l) => ({ name: [l.name, l.variation_name && l.variation_name !== "Regular" ? l.variation_name : ""].filter(Boolean).join(" · "), qty: l.quantity ?? "1" })),
        customer: (cid && customers.get(cid)) || { name: r?.display_name ?? "", email: r?.email_address ?? "", phone: r?.phone_number ?? "" },
      };
    });
  } catch (e) {
    console.error("[square] orders search failed", e);
    return null;
  }
}
