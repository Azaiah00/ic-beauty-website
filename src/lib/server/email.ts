/**
 * Transactional email through Resend (https://resend.com), plain fetch, no SDK. Server-only.
 *
 * Env:
 *   RESEND_API_KEY  required to send (without it, emails are written to .data/outbox for preview and reported as skipped)
 *   EMAIL_FROM      default "Iisha C. Silver <hello@icbeautyinyou.com>" (the domain must be verified in Resend)
 *   EMAIL_REPLY_TO  default icbeautyinyou@gmail.com (replies go to Iisha's inbox)
 *   OWNER_EMAIL     where new-submission alerts go; comma-separated for more than one. Default icbeautyinyou@gmail.com
 */
import { promises as fs } from "node:fs";
import path from "node:path";

export type Mail = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string };
export type SendResult = { ok: boolean; id?: string; skipped?: boolean; error?: string };

export const FROM = process.env.EMAIL_FROM || "Iisha C. Silver <hello@icbeautyinyou.com>";
export const REPLY_TO = process.env.EMAIL_REPLY_TO || "icbeautyinyou@gmail.com";
export const OWNER = (process.env.OWNER_EMAIL || "icbeautyinyou@gmail.com").split(",").map((s) => s.trim()).filter(Boolean);

export async function sendEmail(m: Mail): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    // Preview mode: keep a copy so the flow can be checked without sending anything.
    try {
      const dir = path.join(process.env.NETLIFY ? "/tmp" : process.cwd(), ".data", "outbox");
      await fs.mkdir(dir, { recursive: true });
      const name = `${Date.now()}-${m.subject.replace(/[^a-z0-9]+/gi, "-").slice(0, 60)}.html`;
      await fs.writeFile(path.join(dir, name), `<!-- to: ${[m.to].flat().join(", ")} | subject: ${m.subject} -->\n${m.html}`);
    } catch {}
    return { ok: false, skipped: true, error: "RESEND_API_KEY not set" };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: [m.to].flat(), subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo || REPLY_TO }),
      signal: AbortSignal.timeout(10000),
    });
    const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
    return res.ok ? { ok: true, id: body.id } : { ok: false, error: `${res.status} ${body.message ?? ""}`.trim() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
