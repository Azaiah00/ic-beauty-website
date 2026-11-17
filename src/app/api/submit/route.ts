/**
 * POST /api/submit  { form, data }
 * The one endpoint every form on the site posts to. The work happens in src/lib/server/submit.ts
 * (save, confirmation email, alert to Iisha, Square customer), shared with the community join request.
 */
import { NextResponse } from "next/server";
import { recordSubmission } from "@/lib/server/submit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { form?: string; data?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const r = await recordSubmission(String(body.form ?? ""), body.data ?? {});
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
  return NextResponse.json({ ok: true, ...(r.id ? { id: r.id } : {}) });
}
