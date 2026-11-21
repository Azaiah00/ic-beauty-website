/** POST /api/admin/order (id, status, notes): Iisha marks a website order Ready for pickup / Picked up. */
import { NextResponse } from "next/server";
import { seeOther } from "@/lib/server/redirect";
import { isAdmin } from "@/lib/server/auth";
import { setOrderMark, ORDER_STATUSES } from "@/lib/server/tracking";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) return seeOther("/admin/login");
  const fd = await req.formData();
  const id = String(fd.get("id") ?? "").slice(0, 64);
  const status = String(fd.get("status") ?? "");
  const notes = String(fd.get("notes") ?? "").slice(0, 2000);
  if (!/^[A-Za-z0-9_-]+$/.test(id) || !(ORDER_STATUSES as readonly string[]).includes(status)) return seeOther("/admin?view=shop");
  await setOrderMark(id, { status, notes });
  return seeOther(`/admin?view=shop&msg=${encodeURIComponent("Order updated.")}#${id}`);
}
