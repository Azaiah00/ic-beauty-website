/**
 * Owner dashboard → Shop & orders.
 *   1. Website orders (paid through the site's Buy buttons, read from Square) with a pickup status Iisha sets.
 *   2. In-salon products: what's live on the website right now, what's sold out.
 *   3. Storefront clicks (Amazon, Solex, supplements, enzyme) this month vs last month.
 */
import Link from "next/link";
import { CheckCircle2, AlertTriangle, ExternalLink, ShoppingBag, Package, MousePointerClick, Mail, Phone } from "lucide-react";
import { getWebsiteOrders, getRetail } from "@/lib/server/squareShop";
import { getClicks, getOrderMarks, ORDER_STATUSES } from "@/lib/server/tracking";
import { storefronts } from "@/lib/content";
import { TZ } from "./ui";

const card = "rounded-[1.4rem] bg-white shadow-[0_1px_2px_rgba(36,19,42,0.05),0_18px_40px_-28px_rgba(36,19,42,0.35)]";
const prettyPhone = (p: string) => {
  const d = p.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p;
};
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const STATUS_TONE: Record<string, string> = { New: "bg-[#fbeee0] text-[#8a5a1f]", "Ready for pickup": "bg-mist text-amethyst", "Picked up": "bg-[#e3efe8] text-[#24603f]", Shipped: "bg-[#e3efe8] text-[#24603f]" };
const DONE = new Set(["Picked up", "Shipped"]);

export async function ShopView({ msg }: { msg?: string }) {
  const connected = !!process.env.SQUARE_ACCESS_TOKEN;
  const [orders, products, clicks] = await Promise.all([getWebsiteOrders(), getRetail(), getClicks()]);
  const marks = await getOrderMarks((orders ?? []).map((o) => o.id));
  const waiting = (orders ?? []).filter((o) => !DONE.has(marks.get(o.id)?.status ?? "New")).length;
  const soldOut = products.filter((p) => p.soldOut);
  const totalClicks = Object.values(clicks.thisMonth).reduce((a, b) => a + b, 0);

  return (
    <div className="mt-6 space-y-5">
      {msg && (
        <p role="status" className="flex items-start gap-2 rounded-2xl bg-[#e3efe8] px-4 py-3 text-[0.9rem] text-[#24603f]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {msg}
        </p>
      )}

      {!connected && (
        <p className="flex items-start gap-2 rounded-2xl bg-[#fbeee0] px-4 py-3 text-[0.9rem] text-[#8a5a1f]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Square isn&apos;t connected on this copy of the site, so orders and live products can&apos;t load here.
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Shop totals">
        {[
          { i: ShoppingBag, t: "Website orders to hand off", v: waiting, s: `${orders?.length ?? 0} paid in the last 90 days` },
          { i: Package, t: "Products on your website", v: products.length, s: soldOut.length ? `${soldOut.length} sold out` : "Everything in stock" },
          { i: MousePointerClick, t: `Storefront clicks in ${clicks.labels.thisMonth}`, v: totalClicks, s: "Amazon, Solex, supplements & enzyme" },
        ].map((k) => (
          <div key={k.t} className={`${card} flex items-center gap-4 p-5`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mist text-amethyst"><k.i className="h-5 w-5" aria-hidden="true" strokeWidth={1.6} /></span>
            <span className="min-w-0">
              <span className="block text-[0.78rem] font-medium text-plum-700">{k.t}</span>
              <span className="block text-[2rem] font-light leading-tight tabular-nums text-plum-900">{k.v}</span>
              <span className="block truncate text-[0.75rem] text-plum-700/80">{k.s}</span>
            </span>
          </div>
        ))}
      </section>

      {/* Orders */}
      <section className={`${card} p-5 sm:p-6`} aria-labelledby="orders-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="orders-title" className="font-display text-[1.45rem] leading-tight text-plum-900">Website orders</h2>
            <p className="text-[0.85rem] text-plum-700">Paid through your website&apos;s Buy buttons. Square emails you each one too. Each order shows whether it&apos;s pickup or shipping.</p>
          </div>
          <a href="https://app.squareup.com/dashboard/orders/overview" target="_blank" rel="noopener" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-plum-800/15 px-4 text-[0.8rem] text-plum-900 hover:border-amethyst">
            All orders in Square <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
        {orders === null ? (
          <p className="mt-5 text-[0.9rem] text-plum-700">{connected ? "Square didn't answer just now. Refresh in a minute." : "Orders show here once Square is connected."}</p>
        ) : orders.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-bone px-4 py-6 text-center text-[0.92rem] text-plum-700">No website orders yet. They&apos;ll appear here the moment someone checks out.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {orders.map((o) => {
              const m = marks.get(o.id);
              const status = m?.status ?? "New";
              return (
                <li key={o.id} id={o.id} className="scroll-mt-24 rounded-2xl border border-plum-800/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-plum-900">{o.customer.name || "Website customer"}</p>
                      <p className="text-[0.8rem] text-plum-700">{when(o.createdAt)} · {o.total}</p>
                    </div>
                    <span className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-plum-800/15 px-3 py-1 text-[0.75rem] font-medium text-plum-900">{o.method === "ship" ? "Ship" : "Pickup"}</span>
                      <span className={`rounded-full px-3 py-1 text-[0.75rem] font-medium ${STATUS_TONE[status] ?? STATUS_TONE.New}`}>{status}</span>
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-[0.9rem] text-plum-900">
                    {o.items.map((it, i) => <li key={i}>{it.qty} × {it.name}</li>)}
                  </ul>
                  {o.method === "ship" && o.shipTo && <p className="mt-2 text-[0.85rem] text-plum-700"><span className="font-medium text-plum-900">Ship to:</span> {o.shipTo}</p>}
                  {(o.customer.email || o.customer.phone) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {o.customer.phone && <a href={`sms:${o.customer.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-mist px-3 text-[0.8rem] text-plum-900"><Phone className="h-3.5 w-3.5" aria-hidden="true" /> Text {prettyPhone(o.customer.phone)}</a>}
                      {o.customer.email && <a href={`mailto:${o.customer.email}?subject=${encodeURIComponent("Your I.C. Beauty order is ready")}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-mist px-3 text-[0.8rem] text-plum-900"><Mail className="h-3.5 w-3.5" aria-hidden="true" /> Email</a>}
                    </div>
                  )}
                  <form method="post" action="/api/admin/order" className="mt-4 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                    <input type="hidden" name="id" value={o.id} />
                    <label>
                      <span className="sr-only">Pickup status</span>
                      <select name="status" defaultValue={status} className="min-h-10 w-full rounded-full border border-plum-800/15 bg-white px-3 text-[0.88rem] text-plum-900">
                        {ORDER_STATUSES.filter((s) => (o.method === "ship" ? s !== "Ready for pickup" && s !== "Picked up" : s !== "Shipped")).map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">Notes</span>
                      <input name="notes" defaultValue={m?.notes ?? ""} placeholder="Notes (optional)" className="min-h-10 w-full rounded-full border border-plum-800/15 bg-white px-4 text-[0.88rem]" />
                    </label>
                    <button className="min-h-10 rounded-full bg-plum-900 px-5 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-bone hover:bg-amethyst">Save</button>
                  </form>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Products */}
        <section className={`${card} p-5 sm:p-6`} aria-labelledby="stock-title">
          <h2 id="stock-title" className="font-display text-[1.45rem] leading-tight text-plum-900">In-salon products</h2>
          <p className="text-[0.85rem] text-plum-700">These come straight from your Square item library. Change a price, photo or stock in Square and the website follows. To keep an item off the website, set it to hidden on your Square Online store.</p>
          {products.length === 0 ? (
            <p className="mt-5 text-[0.9rem] text-plum-700">{connected ? "No products came through from Square yet." : "Shows once Square is connected."}</p>
          ) : (
            <>
              <p className="mt-5 text-[0.9rem] text-plum-900"><span className="font-medium">{products.length - soldOut.length}</span> available · <span className="font-medium">{soldOut.length}</span> sold out</p>
              {soldOut.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {soldOut.map((p) => <li key={p.id} className="rounded-full bg-[#f8e6e1] px-3 py-1 text-[0.8rem] text-[#8a3a26]">{p.name}</li>)}
                </ul>
              )}
            </>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/shop#salon" target="_blank" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-plum-900 px-4 text-[0.8rem] text-bone hover:bg-amethyst">See your shop <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            <a href="https://app.squareup.com/dashboard/items/library" target="_blank" rel="noopener" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-plum-800/15 px-4 text-[0.8rem] text-plum-900 hover:border-amethyst">Edit items in Square <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </section>

        {/* Storefront clicks */}
        <section className={`${card} p-5 sm:p-6`} aria-labelledby="clicks-title">
          <h2 id="clicks-title" className="font-display text-[1.45rem] leading-tight text-plum-900">Storefront clicks</h2>
          <p className="text-[0.85rem] text-plum-700">How many people tapped through to each of your storefronts from the website. Your commissions show in each store&apos;s own affiliate account.</p>
          <table className="mt-5 w-full text-[0.9rem]">
            <thead>
              <tr className="text-left text-[0.72rem] uppercase tracking-[0.12em] text-plum-700">
                <th className="pb-2 font-medium">Storefront</th>
                <th className="pb-2 text-right font-medium">{clicks.labels.thisMonth}</th>
                <th className="pb-2 text-right font-medium">{clicks.labels.lastMonth}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-plum-800/10 border-t border-plum-800/10">
              {storefronts.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-3 text-plum-900">{s.title}<span className="block text-[0.75rem] text-plum-700">{s.eyebrow}</span></td>
                  <td className="py-2.5 text-right tabular-nums text-plum-900">{clicks.thisMonth[s.id] ?? 0}</td>
                  <td className="py-2.5 text-right tabular-nums text-plum-700">{clicks.lastMonth[s.id] ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <a href="https://affiliate-program.amazon.com/home/reports" target="_blank" rel="noopener" className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full border border-plum-800/15 px-4 text-[0.8rem] text-plum-900 hover:border-amethyst">Amazon earnings report <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
        </section>
      </div>
    </div>
  );
}
