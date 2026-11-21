/**
 * POST /api/recovery/checkout   form fields: plan=guided|supported|exclusive, pay=deposit|full, agree=1,
 *                                optional confirm=1 + email (client wants an emailed enrollment confirmation)
 * GET  /api/recovery/checkout?plan=&pay=&agree=1   same, without the confirmation email (kept for old links)
 * Sends the client to a Square checkout page for that program's deposit or full price (payment goes to Iisha's Square).
 * The email is sent in the form body, never in the URL.
 */
import { NextResponse } from "next/server";
import { seeOther } from "@/lib/server/redirect";
import { recoveryPlans } from "@/lib/site";
import { createRecoveryCheckout, type PayKind } from "@/lib/server/recoveryCheckout";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

async function go(req: Request, v: { plan: string | null; pay: string | null; agree: string | null; confirm: string | null; email: string | null }) {
  const plan = recoveryPlans.find((p) => p.id === v.plan);
  const pay = v.pay as PayKind | null;
  const back = (reason: string) => seeOther(`/recovery?checkout=${reason}#plans`);
  if (!plan || (pay !== "deposit" && pay !== "full")) return back("missing");
  if (v.agree !== "1") return back("terms");
  const email = v.confirm === "1" ? (v.email ?? "").trim().toLowerCase().slice(0, 200) : "";
  if (v.confirm === "1" && !EMAIL_RE.test(email)) return back("email");
  if (!process.env.SQUARE_ACCESS_TOKEN) return back("unavailable");
  try {
    const r = await createRecoveryCheckout(plan.id, pay, email || undefined);
    return r.ok ? NextResponse.redirect(r.url, 303) : back(r.reason);
  } catch (e) {
    console.error("[recovery] checkout failed", e);
    return back("error");
  }
}

export async function POST(req: Request) {
  const fd = await req.formData().catch(() => null);
  const s = (k: string) => (fd?.get(k) == null ? null : String(fd.get(k)));
  return go(req, { plan: s("plan"), pay: s("pay"), agree: s("agree"), confirm: s("confirm"), email: s("email") });
}

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  return go(req, { plan: q.get("plan"), pay: q.get("pay"), agree: q.get("agree"), confirm: null, email: null });
}
