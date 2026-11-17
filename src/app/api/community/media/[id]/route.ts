/** GET /api/community/media/<id>: a photo a member added to a post or their profile. Members only. */
import { NextResponse } from "next/server";
import { isLive } from "@/lib/community/permissions";
import { getActor } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isLive(await getActor())) return new NextResponse("Please sign in to the community first.", { status: 403 });
  const m = await db.media((await params).id.replace(/[^\w-]/g, ""));
  if (!m) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(Buffer.from(m.b64, "base64"), { headers: { "Content-Type": m.type, "Cache-Control": "private, max-age=31536000, immutable" } });
}
