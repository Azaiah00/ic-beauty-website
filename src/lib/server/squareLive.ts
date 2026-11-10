/**
 * Live hours and service menu from Iisha's Square account, so changes she makes in Square show on
 * the website without a code change (like her old Square Online site did).
 *
 * - Reads only (GET). Cached for 15 minutes under the "square" cache tag.
 * - Instant refresh: Square webhook → /api/square/webhook, or the "Refresh from Square" button in /admin.
 * - No token, or Square unreachable → falls back to the hours in src/lib/site.ts and hides the live menu.
 *
 * Env: SQUARE_ACCESS_TOKEN (same token as the customer sync), optional SQUARE_LOCATION_ID.
 */
import { business } from "@/lib/site";

export const SQUARE_TAG = "square";
export const REVALIDATE = 900;
export const VERSION = "2025-01-23";
export const LOCATION = process.env.SQUARE_LOCATION_ID || "EVVWFXT0K865D"; // from her Square booking link
export const base = () => process.env.SQUARE_API_BASE || (process.env.SQUARE_ENV === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com"); // SQUARE_API_BASE: local testing only

export type DayHours = { day: string; short: string; open: string | null; close: string | null };
export type LiveService = { id: string; name: string; description: string; category: string; price: string; duration: string };

export async function get<T>(path: string): Promise<T | null> {
  if (!process.env.SQUARE_ACCESS_TOKEN) return null;
  try {
    const res = await fetch(`${base()}${path}`, {
      headers: { Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`, "Square-Version": VERSION },
      next: { revalidate: REVALIDATE, tags: [SQUARE_TAG] },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error(`[square] GET ${path} ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (e) {
    console.error(`[square] GET ${path} failed`, e);
    return null;
  }
}

/* ---------------------------------- Hours --------------------------------- */

type Period = { day_of_week: string; start_local_time: string; end_local_time: string };
const SQUARE_DAY: Record<string, string> = { MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday", SAT: "Saturday", SUN: "Sunday" };
const hhmm = (t: string) => t.slice(0, 5);

/** Hours for the week, Monday first. Live from Square when connected, otherwise the site file. */
export async function getHours(): Promise<{ hours: DayHours[]; live: boolean }> {
  const fallback = { hours: business.hours.map((h) => ({ ...h })), live: false };
  const data = await get<{ location?: { business_hours?: { periods?: Period[] } } }>(`/v2/locations/${LOCATION}`);
  const periods = data?.location?.business_hours?.periods;
  if (!periods?.length) return fallback; // no hours set in Square: keep the published ones rather than show "Closed" all week
  const hours = business.hours.map((h) => {
    const p = periods.filter((x) => SQUARE_DAY[x.day_of_week] === h.day).sort((a, b) => a.start_local_time.localeCompare(b.start_local_time));
    // Split shifts (e.g. 11–2 and 3–7) show as first open to last close.
    return p.length ? { ...h, open: hhmm(p[0].start_local_time), close: hhmm(p[p.length - 1].end_local_time) } : { ...h, open: null, close: null };
  });
  return { hours, live: true };
}

/* --------------------------------- Services -------------------------------- */

type Money = { amount?: number; currency?: string };
export type Variation = {
  id: string;
  is_deleted?: boolean;
  item_variation_data?: {
    name?: string;
    pricing_type?: "FIXED_PRICING" | "VARIABLE_PRICING";
    price_money?: Money;
    service_duration?: number;
    available_for_booking?: boolean;
    track_inventory?: boolean;
    sellable?: boolean;
    location_overrides?: { location_id?: string; track_inventory?: boolean; sold_out?: boolean }[];
  };
};
export type CatalogObject = {
  type: string;
  id: string;
  is_deleted?: boolean;
  present_at_all_locations?: boolean;
  present_at_location_ids?: string[];
  absent_at_location_ids?: string[];
  category_data?: { name?: string };
  image_data?: { url?: string; name?: string };
  item_data?: {
    name?: string;
    description?: string;
    description_plaintext?: string;
    product_type?: string;
    is_archived?: boolean;
    category_id?: string;
    categories?: { id: string }[];
    reporting_category?: { id: string };
    image_ids?: string[];
    ecom_visibility?: string;
    variations?: Variation[];
  };
};

export const atLocation = (o: CatalogObject) =>
  o.present_at_all_locations ? !(o.absent_at_location_ids ?? []).includes(LOCATION) : (o.present_at_location_ids ?? []).includes(LOCATION);

export const usd = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;

function priceLabel(vs: Variation[]) {
  const fixed = vs.filter((v) => v.item_variation_data?.pricing_type !== "VARIABLE_PRICING" && v.item_variation_data?.price_money?.amount != null);
  const variable = vs.some((v) => v.item_variation_data?.pricing_type === "VARIABLE_PRICING");
  if (!fixed.length) return variable ? "Price varies" : "";
  const amounts = fixed.map((v) => v.item_variation_data!.price_money!.amount!);
  const lo = Math.min(...amounts);
  const hi = Math.max(...amounts);
  if (lo === 0 && hi === 0) return "Complimentary";
  if (lo === hi) return variable ? `From ${usd(lo)}` : usd(lo);
  return `${usd(lo)} – ${usd(hi)}`;
}

function durationLabel(vs: Variation[]) {
  const mins = vs.map((v) => Math.round((v.item_variation_data?.service_duration ?? 0) / 60000)).filter(Boolean);
  if (!mins.length) return "";
  const fmt = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ""}`);
  const lo = Math.min(...mins);
  const hi = Math.max(...mins);
  return lo === hi ? fmt(lo) : `${fmt(lo)} – ${fmt(hi)}`;
}

/** Her whole Square catalog (items, categories, images), shared by the service menu and the shop. null = not connected. */
export async function listCatalog(): Promise<CatalogObject[] | null> {
  const objects: CatalogObject[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 10; page++) {
    const data = await get<{ objects?: CatalogObject[]; cursor?: string }>(`/v2/catalog/list?types=ITEM,CATEGORY,IMAGE${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`);
    if (!data) return null;
    objects.push(...(data.objects ?? []));
    if (!data.cursor) break;
    cursor = data.cursor;
  }
  return objects;
}

/** Her bookable Square services (Appointments), grouped by category order in Square. Empty when not connected. */
export async function getServices(): Promise<LiveService[]> {
  const objects = await listCatalog();
  if (!objects) return [];
  const categories = new Map(objects.filter((o) => o.type === "CATEGORY" && !o.is_deleted).map((o) => [o.id, o.category_data?.name ?? ""]));
  return objects
    .filter((o) => o.type === "ITEM" && !o.is_deleted && o.item_data?.product_type === "APPOINTMENTS_SERVICE" && !o.item_data.is_archived && atLocation(o))
    .map((o) => {
      const d = o.item_data!;
      const vs = (d.variations ?? []).filter((v) => !v.is_deleted && v.item_variation_data?.available_for_booking !== false);
      const catId = d.categories?.[0]?.id ?? d.category_id;
      return {
        id: o.id,
        name: d.name ?? "",
        description: (d.description_plaintext ?? d.description ?? "").trim(),
        category: (catId && categories.get(catId)) || "Services",
        price: priceLabel(vs),
        duration: durationLabel(vs),
        _bookable: vs.length > 0,
      };
    })
    .filter((s) => s.name && s._bookable)
    .map(({ _bookable, ...s }) => s); // eslint-disable-line @typescript-eslint/no-unused-vars
}

/** Services grouped by category, keeping Square's order. */
export function groupServices(list: LiveService[]) {
  const groups = new Map<string, LiveService[]>();
  for (const s of list) groups.set(s.category, [...(groups.get(s.category) ?? []), s]);
  return [...groups.entries()].map(([category, items]) => ({ category, items }));
}
