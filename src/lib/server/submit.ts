/**
 * Records one form submission. Shared by POST /api/submit and the community join request:
 *   1. validate + save the submission (Netlify Blobs) so nothing is ever lost
 *   2. email the person their confirmation
 *   3. email Iisha a new-submission alert with a link to her dashboard
 *   4. add/tag the person in her Square customer directory
 * Steps 2–4 never block success: if one fails it's logged on the record and visible in the dashboard.
 */
import { FORMS } from "@/lib/server/forms";
import { newId, saveSubmission, type Submission } from "@/lib/server/store";
import { sendEmail, OWNER } from "@/lib/server/email";
import { renderConfirmation, renderOwnerAlert } from "@/lib/server/templates";
import { squareReady, upsertCustomer } from "@/lib/server/square";
import { anyRandom } from "@/lib/server/spam";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_FIELD = 4000;

export type SubmitResult = { ok: true; id?: string } | { ok: false; status: number; error: string };

export async function recordSubmission(form: string, input: Record<string, unknown>): Promise<SubmitResult> {
  const def = FORMS[form];
  if (!def) return { ok: false, status: 400, error: "Unknown form" };

  const data: Record<string, string> = {};
  for (const [k, v] of Object.entries(input ?? {})) {
    if (typeof v !== "string" && typeof v !== "number" && typeof v !== "boolean") continue;
    if (Object.keys(data).length >= 60) break;
    data[k.slice(0, 60)] = String(v).slice(0, MAX_FIELD).trim();
  }
  // Honeypot: bots fill the hidden field. Pretend success, store nothing.
  if (data["bot-field"]) return { ok: true };
  // Random-text names (spam bots using real people's emails): same silent success, nothing saved or sent.
  if (anyRandom([data.name, data["first-name"], data["last-name"], data.goal])) return { ok: true };
  delete data["bot-field"];
  delete data["form-name"];

  const name = data.name || data["first-name"] || "";
  const email = (data.email || "").toLowerCase();
  const phone = data.phone || "";
  for (const f of def.required) {
    const v = f === "name" ? name : data[f];
    if (!v) return { ok: false, status: 422, error: `Missing ${f}` };
  }
  if (email && !EMAIL_RE.test(email)) return { ok: false, status: 422, error: "Please check your email address" };

  const now = new Date();
  const sub: Submission = { id: newId(now), form, createdAt: now.toISOString(), updatedAt: now.toISOString(), status: def.statuses[0], notes: "", name, email, phone, data, log: [] };

  try {
    await saveSubmission(sub);
  } catch (e) {
    console.error("[submit] save failed", form, e);
    // Still try to alert Iisha so the lead isn't lost.
    const a = renderOwnerAlert(sub, `${def.label} (NOT SAVED: storage error)`);
    await sendEmail({ to: OWNER, subject: `New ${def.tab}: ${name || email} (storage error)`, ...a, replyTo: email || undefined });
    return { ok: false, status: 500, error: "Could not save" };
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
    def.ownerAlert === false
      ? Promise.resolve()
      : step("Alert to Iisha", async () => {
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
  return { ok: true, id: sub.id };
}
