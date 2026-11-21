/** POST /api/admin/square-refresh: Iisha's "Refresh from Square" button. Pulls her latest hours, services and prices now. */
import { NextResponse } from "next/server";
import { seeOther } from "@/lib/server/redirect";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/server/auth";
import { SQUARE_TAG } from "@/lib/server/squareLive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) return seeOther("/admin/login");
  revalidateTag(SQUARE_TAG, { expire: 0 });
  return seeOther("/admin?msg=" + encodeURIComponent("Updated from Square. Your hours, services and prices on the website are now current."));
}
