/**
 * GET /api/shop/buy?v=<variationId>&q=<qty>
 * Sends the shopper to a Square checkout page for one in-salon product (payment goes to Iisha's Square).
 */
import { NextResponse } from "next/server";
import { SITE_URL, retailOrders } from "@/lib/site";
import { createCheckout } from "@/lib/server/squareShop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const u = new URL(req.url);
  const v = (u.searchParams.get("v") ?? "").slice(0, 64);
  const ship = u.searchParams.get("m") === "ship" && retailOrders.shipping.enabled;
  const q = Math.min(10, Math.max(1, Number.parseInt(u.searchParams.get("q") ?? "1", 10) || 1));
  const back = (reason: string) => NextResponse.redirect(new URL(`/shop?order=${reason}#salon`, req.url), 303);
  if (!process.env.SQUARE_ACCESS_TOKEN || !/^[A-Z0-9]+$/i.test(v)) return back("unavailable");
  try {
    const r = await createCheckout(v, q, `${SITE_URL}/shop/thank-you`, retailOrders.paymentNote, ship);
    return r.ok ? NextResponse.redirect(r.url, 303) : back(r.reason);
  } catch (e) {
    console.error("[shop] checkout failed", e);
    return back("error");
  }
}
