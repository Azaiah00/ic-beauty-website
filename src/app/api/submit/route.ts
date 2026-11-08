/**
 * POST /api/submit  { form, data }
 * The one endpoint every form on the site posts to:
 *   1. validate + save the submission (Netlify Blobs) so nothing is ever lost
 *   2. email the person their confirmation (Resend)
 *   3. email Iisha a new-submission alert with a link to her dashboard
 *   4. add/tag the person in her Square customer directory
 * Steps 2–4 never block success: if one fails it's logged on the record and visible in the dashboard.
 */
import { NextResponse } from "next/server";
import { FORMS } from "@/lib/server/forms";
import { newId, saveSubmission, type Submission } from "@/lib/server/store";
import { sendEmail, OWNER } from "@/lib/server/email";
import { renderConfirmation, renderOwnerAlert } from "@/lib/server/templates";
import { squareReady, upsertCustomer } from "@/lib/server/square";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FIELD = 4000;

export async function POST(req: Request) {
  let body: { form?: string; data?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const form = String(body.form ?? "");
  const def = FORMS[form];
  if (!def) return NextResponse.json({ ok: false, error: "Unknown form" }, { status: 400 });

  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(body.data ?? {})) {
    if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") continue;
    if (Object.keys(data).length >= 60) break;
    data[k.slice(0, 60)] = String(v).slice(0, MAX_FIELD).trim();
  }
  // Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if (data["bot-field"]) return NextResponse.json({ ok: true });
  delete data["bot-field"];
  delete data["form-name"];

  const name = data.name || data["first-name"] || "";
  const email = (data.email || "").toLowerCase();
  const phone = data.phone || "";
  for (const f of def.required) {
    const v = f === "name" ? name : data[f];
    if (!v) return NextResponse.json({ ok: false, error: `Missing ${f}` }, { status: 422 });
  }
  if (email && !EMAIL_RE.test(email)) return NextResponse.json({ ok: false, error: "Please check your email address" }, { status: 422 });

  const now = new Date();
  const sub: Submission = {
    id: newId(now),
    form,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    status: def.statuses[0],
    notes: "",
    name,
    email,
    phone,
    data,
    log: [],
  };

  try {
    await saveSubmission(sub);
  } catch (e) {
    console.error("[submit] save failed", form, e);
    // Still try to alert Iisha so the lead isn't lost.
    const a = renderOwnerAlert(sub, `${def.label} (NOT SAVED: storage error)`);
    await sendEmail({ to: OWNER, subject: `New ${def.tab}: ${name || email} (storage error)`, ...a, replyTo: email || undefined });
    return NextResponse.json({ ok: false, error: "Could not save" }, { status: 500 });
  }

  const step = async (label: string, fn: () => Promise<{ ok: boolean; detail?: string }>) => {
    try {
      const r = await fn();
      sub.log.push({ at: new Date().toISOString(), step: label, ok: r.ok, detail: r.detail });
    } catch (e) {
      sub.log.push({ at: new Date().toISOString(), step: label, ok: false, detail: e instanceof Error ? e.message : String(e) });
    }
  };

  await Promise.all([
    def.confirmation && email
      ? step("Confirmation email", async () => {
          const c = def.confirmation!(sub);
          const r = await sendEmail({ to: email, subject: c.subject, ...renderConfirmation(c) });
          return { ok: r.ok, detail: r.id ?? r.error };
        })
      : Promise.resolve(),
    step("Alert to Iisha", async () => {
      const a = renderOwnerAlert(sub, def.label);
      const r = await sendEmail({ to: OWNER, subject: `New ${def.tab}: ${name || email}`, ...a, replyTo: email || undefined });
      return { ok: r.ok, detail: r.id ?? r.error };
    }),
    email && squareReady()
      ? step("Square customer", async () => {
          const r = await upsertCustomer({ name, email, phone, group: def.group, note: `Website: ${def.label} (${now.toISOString().slice(0, 10)})`, referenceId: sub.id });
          return { ok: true, detail: `${r.created ? "created" : "existing"} ${r.id}` };
        })
      : Promise.resolve(),
  ]);

  try {
    await saveSubmission(sub);
  } catch (e) {
    console.error("[submit] log save failed", e);
  }
  return NextResponse.json({ ok: true, id: sub.id });
}
