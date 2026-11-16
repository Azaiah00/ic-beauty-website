/**
 * POST /api/jotform  (Jotform webhook)
 * Brings registrations made on an embedded Jotform into the owner dashboard, the same inbox as
 * the site's own forms. Jotform stays the form builder (and sends its own emails); this route only
 *   1. saves the submission (Netlify Blobs) under the matching dashboard form, once per Jotform submission
 *   2. adds/tags the person in Iisha's Square customer directory
 *
 * Setup (one time, in Jotform): Form → Settings → Integrations → WebHooks →
 *   https://www.icbeautyinyou.com/api/jotform
 * Optional hardening: set JOTFORM_WEBHOOK_KEY in Netlify and add ?key=<that value> to the webhook URL.
 * Map more Jotforms to dashboard tabs in JOTFORM_FORMS below.
 */
import { NextResponse } from "next/server";
import { FORMS } from "@/lib/server/forms";
import { listSubmissions, newId, saveSubmission, type Submission } from "@/lib/server/store";
import { squareReady, upsertCustomer } from "@/lib/server/square";
import { links } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Jotform form id → dashboard form key (must exist in FORMS). */
const JOTFORM_FORMS: Record<string, string> = {
  [links.masterclassFormId]: "masterclass",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FIELD = 4000;

/** "q12_ifCaring" → "If caring" */
const labelFor = (k: string) => {
  const slug = k.replace(/^q\d+_/, "").replace(/\[\]$/, "");
  const words = slug.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").trim().toLowerCase();
  return (words.charAt(0).toUpperCase() + words.slice(1)).slice(0, 60) || k;
};

/** Flatten a Jotform answer (string, array, or {first,last} / {full} / {area,phone} objects). */
const flat = (v: unknown): string => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.map(flat).filter(Boolean).join(", ");
  if (typeof v === "object") {
    const o = v as Record<string, unknown>;
    if (o.full) return String(o.full);
    if ("first" in o || "last" in o) return [o.prefix, o.first, o.middle, o.last, o.suffix].filter(Boolean).map(String).join(" ");
    if ("area" in o || "phone" in o) return [o.country, o.area, o.phone].filter(Boolean).map(String).join(" ");
    return Object.values(o).map(flat).filter(Boolean).join(" ");
  }
  return String(v);
};

export async function POST(req: Request) {
  const want = process.env.JOTFORM_WEBHOOK_KEY;
  if (want && new URL(req.url).searchParams.get("key") !== want) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const formID = String(fd.get("formID") ?? "");
  const form = JOTFORM_FORMS[formID];
  const def = form ? FORMS[form] : undefined;
  if (!form || !def) return NextResponse.json({ ok: false, error: "Unknown form" }, { status: 400 });

  const submissionID = String(fd.get("submissionID") ?? "");
  let raw: Record<string, unknown> = {};
  try {
    raw = JSON.parse(String(fd.get("rawRequest") ?? "{}"));
  } catch {
    /* fall through with empty answers */
  }

  // Jotform's "pretty" field reads "Question:Answer, Question:Answer". Use it for real question labels.
  const pretty = String(fd.get("pretty") ?? "");
  // Walk it in order with a cursor, so a comma inside a question can't cut its label short.
  let cursor = 0;
  const prettyLabel = (values: string[]) => {
    const first = values[0];
    if (!pretty || !first) return "";
    const i = pretty.indexOf(":" + first, cursor);
    if (i < 0) return "";
    const label = pretty.slice(cursor, i).replace(/^[,\s]+/, "").trim();
    let end = i + 1 + first.length;
    for (const v of values.slice(1)) {
      const j = pretty.indexOf(v, end);
      if (j >= 0) end = j + v.length;
    }
    cursor = end;
    return label.length > 0 && label.length <= 200 ? label : "";
  };

  // Answers only (Jotform question keys look like q3_name); skip Jotform's own bookkeeping fields.
  let name = "";
  let email = "";
  let phone = "";
  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    if (!/^q\d+_/.test(k)) continue;
    const val = flat(v).slice(0, MAX_FIELD).trim();
    if (!val) continue;
    const parts = Array.isArray(v) ? v.map(flat).filter(Boolean) : [val];
    const label = prettyLabel(parts); // advances the cursor for every answer, in form order
    const isObj = v && typeof v === "object" && !Array.isArray(v);
    if (!name && isObj && ("first" in (v as object) || "last" in (v as object))) { name = val; continue; }
    if (!email && /e-?mail/i.test(k) && EMAIL_RE.test(val)) { email = val.toLowerCase(); continue; }
    if (!phone && /phone|mobile|cell/i.test(k)) { phone = val; continue; }
    if (Object.keys(data).length >= 50) break;
    data[label || labelFor(k)] = parts.join("\n").slice(0, MAX_FIELD);
  }
  if (!name) name = flat(raw["q1_name"] ?? raw["name"] ?? "");
  if (!email) {
    const anyEmail = Object.values(raw).map(flat).find((s) => EMAIL_RE.test(s.trim()));
    if (anyEmail) email = anyEmail.trim().toLowerCase();
  }
  if (!email && !name) return NextResponse.json({ ok: false, error: "No answers" }, { status: 422 });

  if (submissionID) {
    data["Jotform submission"] = `https://www.jotform.com/inbox/${formID}/${submissionID}`;
    // Jotform can retry a webhook; keep exactly one record per Jotform submission.
    const existing = (await listSubmissions(form)).find((s) => s.data["Jotform submission"] === data["Jotform submission"]);
    if (existing) return NextResponse.json({ ok: true, id: existing.id, duplicate: true });
  }
  data["Source"] = "Jotform (icbeautyinyou.com/masterclass)";

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
    log: [{ at: now.toISOString(), step: "Received from Jotform", ok: true, detail: submissionID || undefined }],
  };

  try {
    await saveSubmission(sub);
  } catch (e) {
    console.error("[jotform] save failed", e);
    return NextResponse.json({ ok: false, error: "Could not save" }, { status: 500 });
  }

  if (email && squareReady()) {
    try {
      const r = await upsertCustomer({ name, email, phone, group: def.group, note: `Website: ${def.label} (${now.toISOString().slice(0, 10)})`, referenceId: sub.id });
      sub.log.push({ at: new Date().toISOString(), step: "Square customer", ok: true, detail: `${r.created ? "created" : "existing"} ${r.id}` });
    } catch (e) {
      sub.log.push({ at: new Date().toISOString(), step: "Square customer", ok: false, detail: e instanceof Error ? e.message : String(e) });
    }
    try {
      await saveSubmission(sub);
    } catch (e) {
      console.error("[jotform] log save failed", e);
    }
  }
  return NextResponse.json({ ok: true, id: sub.id });
}
