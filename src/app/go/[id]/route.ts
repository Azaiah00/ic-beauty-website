/** GET /go/<storefront id>: counts the click for Iisha's dashboard, then sends the shopper to that storefront. */
import { NextResponse } from "next/server";
import { storefronts } from "@/lib/content";
import { countClick } from "@/lib/server/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const s = storefronts.find((x) => x.id === id);
  if (!s) return NextResponse.redirect(new URL("/shop#picks", req.url), 302);
  const ua = req.headers.get("user-agent") ?? "";
  if (!/bot|crawl|spider|preview|facebookexternalhit|slurp/i.test(ua)) await countClick(s.id);
  return NextResponse.redirect(s.href, 302);
}
