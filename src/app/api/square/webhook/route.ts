/**
 * POST /api/square/webhook
 * Square calls this when Iisha changes her services, prices or hours, and the website refreshes
 * its copy right away instead of waiting for the 15-minute refresh.
 *
 * Setup (Square Developer → her "Website" app → Webhooks → Subscriptions):
 *   URL:    https://www.icbeautyinyou.com/api/square/webhook  (must match SITE_URL exactly)
 *   Events: catalog.version.updated, location.updated
 * Env: SQUARE_WEBHOOK_SIGNATURE_KEY (shown on the subscription), optional SQUARE_WEBHOOK_URL if the URL differs.
 */
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { SITE_URL } from "@/lib/site";
import { SQUARE_TAG } from "@/lib/server/squareLive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) return NextResponse.json({ ok: false, error: "Webhook not configured" }, { status: 503 });

  const raw = await req.text();
  const url = process.env.SQUARE_WEBHOOK_URL || `${SITE_URL}/api/square/webhook`;
  const expected = crypto.createHmac("sha256", key).update(url + raw).digest("base64");
  const got = req.headers.get("x-square-hmacsha256-signature") ?? "";
  const a = Buffer.from(expected);
  const b = Buffer.from(got);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return NextResponse.json({ ok: false }, { status: 401 });

  let type = "";
  try {
    type = (JSON.parse(raw) as { type?: string }).type ?? "";
  } catch {}
  if (type.startsWith("catalog.") || type.startsWith("location.")) revalidateTag(SQUARE_TAG, { expire: 0 });
  return NextResponse.json({ ok: true });
}
