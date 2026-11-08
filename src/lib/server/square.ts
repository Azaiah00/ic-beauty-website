/**
 * Square: adds every website sign-up to Iisha's Square customer directory (so Square Marketing
 * newsletters reach them) and tags them with a customer group per form. Server-only, plain fetch.
 *
 * Env:
 *   SQUARE_ACCESS_TOKEN  production access token from her Square Developer app (Credentials → Production)
 *   SQUARE_ENV           "production" (default) or "sandbox"
 */
import crypto from "node:crypto";

const VERSION = "2025-01-23";
const base = () => (process.env.SQUARE_ENV === "sandbox" ? "https://connect.squareupsandbox.com" : "https://connect.squareup.com");

export const squareReady = () => !!process.env.SQUARE_ACCESS_TOKEN;

export async function sq<T = Record<string, unknown>>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": VERSION,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000),
  });
  const json = (await res.json().catch(() => ({}))) as T & { errors?: { code: string; detail?: string }[] };
  if (!res.ok) {
    const e = json.errors?.[0];
    throw new Error(`Square ${method} ${path} ${res.status}: ${e?.code ?? ""} ${e?.detail ?? ""}`.trim());
  }
  return json;
}

/** US numbers to E.164; anything Square might reject is dropped rather than failing the whole sync. */
function e164(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return undefined;
}

const groupCache = new Map<string, string>();
async function groupId(name: string) {
  if (groupCache.has(name)) return groupCache.get(name)!;
  let cursor: string | undefined;
  do {
    const r = await sq<{ groups?: { id: string; name: string }[]; cursor?: string }>("GET", `/v2/customers/groups${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);
    for (const g of r.groups ?? []) groupCache.set(g.name, g.id);
    cursor = r.cursor;
  } while (cursor && !groupCache.has(name));
  if (groupCache.has(name)) return groupCache.get(name)!;
  const c = await sq<{ group: { id: string } }>("POST", "/v2/customers/groups", { idempotency_key: crypto.randomUUID(), group: { name } });
  groupCache.set(name, c.group.id);
  return c.group.id;
}

export async function upsertCustomer(p: { name: string; email: string; phone: string; group: string; note: string; referenceId: string }) {
  const email = p.email.trim().toLowerCase();
  if (!email) throw new Error("no email");
  const found = await sq<{ customers?: { id: string }[] }>("POST", "/v2/customers/search", {
    limit: 1,
    query: { filter: { email_address: { exact: email } } },
  });
  let id = found.customers?.[0]?.id;
  let created = false;
  if (!id) {
    const [given, ...rest] = p.name.trim().split(/\s+/);
    const phone = e164(p.phone);
    const c = await sq<{ customer: { id: string } }>("POST", "/v2/customers", {
      idempotency_key: crypto.randomUUID(),
      given_name: given || undefined,
      family_name: rest.join(" ") || undefined,
      email_address: email,
      phone_number: phone,
      reference_id: p.referenceId,
      note: p.note,
    });
    id = c.customer.id;
    created = true;
  }
  const gid = await groupId(p.group);
  await sq("PUT", `/v2/customers/${id}/groups/${gid}`);
  return { id, created };
}
