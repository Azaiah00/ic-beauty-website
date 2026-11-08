/**
 * POST /api/admin/email  (form: form, id, subject, body, back, markContacted)
 * Iisha writes to one person from her dashboard. Sends through her Gmail, logs it on the record.
 */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/auth";
import { FORMS } from "@/lib/server/forms";
import { getSubmission, updateSubmission } from "@/lib/server/store";
import { sendEmail } from "@/lib/server/email";
import { renderPersonal } from "@/lib/server/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  const fd = await req.formData();
  const form = String(fd.get("form") ?? "");
  const id = String(fd.get("id") ?? "");
  const subject = String(fd.get("subject") ?? "").trim().slice(0, 200);
  const body = String(fd.get("body") ?? "").slice(0, 8000);
  const backRaw = String(fd.get("back") ?? "/admin");
  const back = backRaw.startsWith("/admin") ? backRaw : "/admin";
  const go = (msg: string) => {
    const u = new URL(back.split("#")[0], req.url);
    u.searchParams.set("sent", msg);
    u.hash = id;
    return NextResponse.redirect(u, 303);
  };

  const s = FORMS[form] ? await getSubmission(form, id) : null;
  if (!s || !s.email) return go("missing");
  if (!subject || !body.trim()) return go("empty");

  const mail = renderPersonal(subject, body);
  const r = await sendEmail({ to: s.email, subject, html: mail.html, text: mail.text });
  await updateSubmission(form, id, (cur) => ({
    ...cur,
    status: r.ok && fd.get("markContacted") && cur.status === "New" && FORMS[form].statuses.includes("Contacted") ? "Contacted" : cur.status,
    log: [...cur.log, { at: new Date().toISOString(), step: `Email from Iisha: "${subject}"`, ok: r.ok, detail: r.ok ? r.id : r.error }],
  }));
  return go(r.ok ? "ok" : r.skipped ? "notconnected" : "failed");
}
