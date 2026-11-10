/**
 * In-salon products. Live from Iisha's Square item library (photos, prices, stock) with a Square
 * checkout per product; falls back to the saved list (order by call/text) if Square isn't connected.
 */
import { ShoppingBag, Phone } from "lucide-react";
import { getRetail, groupRetail, type RetailItem } from "@/lib/server/squareShop";
import { retail } from "@/lib/content";
import { business, retailOrders } from "@/lib/site";

const money = (c: number) => `$${(c / 100).toFixed(c % 100 ? 2 : 0)}`;
const SHIP = retailOrders.shipping;
import { ICMark } from "@/components/brand/ICMark";

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function Product({ p }: { p: RetailItem }) {
  const multi = p.variations.length > 1;
  return (
    <li className="flex flex-col" data-reveal="fade">
      <div className="relative aspect-square overflow-hidden rounded-card bg-mist">
        {p.image ? (
          // Square-hosted product photo (her own item images); plain <img> so no image-domain config is needed.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.image} alt={p.name} loading="lazy" decoding="async" className={`h-full w-full object-cover ${p.soldOut ? "opacity-60 grayscale-[35%]" : ""}`} />
        ) : (
          <span className="flex h-full w-full items-center justify-center"><ICMark className="h-14 w-auto text-plum-900/25" /></span>
        )}
        {p.soldOut && <span className="absolute left-3 top-3 rounded-pill bg-plum-950/85 px-3 py-1.5 font-sans text-[0.64rem] font-medium uppercase tracking-[0.16em] text-bone">Sold out</span>}
      </div>
      <h4 className="mt-4 font-display text-[1.35rem] leading-snug text-plum-900">{p.name}</h4>
      <p className="mt-1 font-sans text-[0.95rem] text-plum-800">{p.price}</p>
      {p.soldOut ? (
        <p className="mt-4 text-[0.85rem] text-plum-700">Back soon. Ask Iisha at your next visit.</p>
      ) : (
        <form action="/api/shop/buy" method="get" className="mt-4 flex flex-wrap items-center gap-2">
          {multi ? (
            <label className="w-full">
              <span className="sr-only">Choose an option for {p.name}</span>
              <select name="v" className="min-h-10 w-full rounded-pill border border-plum-800/15 bg-white px-3 text-[0.88rem] text-plum-900">
                {p.variations.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.soldOut}>{`${v.name || "Standard"} · ${v.price}${v.soldOut ? " (sold out)" : ""}`}</option>
                ))}
              </select>
            </label>
          ) : (
            <input type="hidden" name="v" value={p.variations[0].id} />
          )}
          {SHIP.enabled && (
            <label className="w-full">
              <span className="sr-only">Pickup or shipping for {p.name}</span>
              <select name="m" defaultValue="pickup" className="min-h-10 w-full rounded-pill border border-plum-800/15 bg-white px-3 text-[0.88rem] text-plum-900">
                <option value="pickup">Pick up at the studio · free</option>
                <option value="ship">Ship to me · from {money(SHIP.firstItemCents)}</option>
              </select>
            </label>
          )}
          <label>
            <span className="sr-only">Quantity of {p.name}</span>
            <select name="q" defaultValue="1" className="min-h-10 rounded-pill border border-plum-800/15 bg-white px-3 text-[0.88rem] text-plum-900">
              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>Qty {n}</option>)}
            </select>
          </label>
          <button className="inline-flex min-h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-pill bg-plum-900 px-4 font-sans text-[0.68rem] font-medium uppercase tracking-[0.16em] text-bone transition hover:bg-amethyst">
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.5} /> Buy now
          </button>
        </form>
      )}
    </li>
  );
}

export async function SalonProducts() {
  const live = groupRetail(await getRetail());

  if (live.length)
    return (
      <>
        <nav aria-label="Product categories" className="mt-10 flex flex-wrap gap-2">
          {live.map((g) => (
            <a key={g.category} href={`#salon-${slug(g.category)}`} className="rounded-pill border border-plum-800/15 bg-bone px-4 py-2 text-[0.85rem] text-plum-900 transition hover:border-amethyst hover:text-amethyst">{g.category}</a>
          ))}
        </nav>
        {live.map((g) => (
          <div key={g.category} id={`salon-${slug(g.category)}`} className="mt-14 scroll-mt-28">
            <h3 className="eyebrow text-brass-deep">{g.category}</h3>
            <ul className="mt-6 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
              {g.items.map((p) => <Product key={p.id} p={p} />)}
            </ul>
          </div>
        ))}
        <p className="mt-12 max-w-3xl text-[0.88rem] text-plum-700">
          {retailOrders.note}
          {SHIP.enabled && ` Shipping is ${money(SHIP.firstItemCents)} for one item${SHIP.eachAdditionalCents ? ` plus ${money(SHIP.eachAdditionalCents)} for each additional item` : ""}${SHIP.freeOverCents ? `, and free on orders of ${money(SHIP.freeOverCents)} or more` : ""}.`}{" "}
          Secure checkout by Square. Questions? Call or text <a href={business.phoneHref} className="link-underline text-plum-900">{business.phone}</a>.
        </p>
      </>
    );

  // Not connected to Square yet: the saved list, ordered by call or text.
  const groups = ["Cleanse", "Condition", "Style", "Treat"] as const;
  return (
    <>
      <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {groups.map((grp) => (
          <div key={grp} data-reveal>
            <h3 className="eyebrow text-brass-deep">{grp}</h3>
            <ul className="mt-4 divide-y divide-plum-800/10 border-y border-plum-800/10">
              {retail.filter((r) => r.group === grp).map((r) => (
                <li key={r.name} className="flex items-baseline justify-between gap-4 py-3 text-[0.95rem]">
                  <span className="text-plum-900">{r.name}{r.status && <span className="ml-2 text-[0.68rem] uppercase tracking-wider text-brass-deep">{r.status}</span>}</span>
                  <span className="shrink-0 text-[0.88rem] text-plum-700">{r.price}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <a href={business.phoneHref} className="mt-10 inline-flex items-center gap-2 rounded-pill bg-plum-900 px-6 py-3.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-bone hover:bg-amethyst">
        <Phone className="h-4 w-4" aria-hidden="true" strokeWidth={1.5} /> Call or text to order · {business.phone}
      </a>
    </>
  );
}
