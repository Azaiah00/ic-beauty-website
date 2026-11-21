/**
 * POST /api/square/webhook
 * Square calls this when Iisha changes her services, prices or hours, and the website refreshes
 * its copy right away instead of waiting for the 15-minute refresh.
 *
 * Setup (Square Developer → her "Website" app → Webhooks → Subscriptions):
 *   URL:    https://www.icbeautyinyou.com/api/square/webhook  (must match SITE_URL exactly)
 *   Events: catalog.version.updated, location.updated, payment.updated (recovery enrollment emails)
 * Env: SQUARE_WEBHOOK_SIGNATURE_KEY (shown on the subscription), optional SQUARE_WEBHOOK_URL if the URL differs.
 */
import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { SITE_URL } from "@/lib/site";
import { SQUARE_TAG } from "@/lib/server/squareLive";
import { processEnrollment } from "@/lib/server/recoveryEnrollments";

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
  let orderId = "";
  let status = "";
  try {
    const evt = JSON.parse(raw) as { type?: string; data?: { object?: { payment?: { order_id?: string; status?: string } } } };
    type = evt.type ?? "";
    orderId = evt.data?.object?.payment?.order_id ?? "";
    status = evt.data?.object?.payment?.status ?? "";
  } catch {}
  if (type.startsWith("catalog.") || type.startsWith("location.") || type.startsWith("inventory.")) revalidateTag(SQUARE_TAG, { expire: 0 });
  // A completed payment: if it's a /recovery enrollment, email Iisha (and the client, if they asked). Non-recovery orders are ignored.
  if (type.startsWith("payment.") && status === "COMPLETED" && orderId) await processEnrollment(orderId).catch((e) => console.error("[square] enrollment processing failed", e));
  return NextResponse.json({ ok: true });
}
