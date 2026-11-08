/**
 * Email sending. Server-only. Tries, in order:
 *   1. Iisha's own Gmail (GMAIL_APP_PASSWORD set): mail truly comes from icbeautyinyou@gmail.com and lands in her Sent folder.
 *   2. Resend (RESEND_API_KEY set): sends from EMAIL_FROM on a verified domain.
 *   3. Preview mode: nothing is sent; a copy is written to .data/outbox so the flow can be checked.
 *
 * Env:
 *   GMAIL_USER          default icbeautyinyou@gmail.com
 *   GMAIL_APP_PASSWORD  16-character Google app password (Google Account → Security → App passwords)
 *   EMAIL_FROM_NAME     default "Iisha C. Silver"
 *   OWNER_EMAIL         where new-submission alerts go (comma-separated). Default icbeautyinyou@gmail.com
 *   RESEND_API_KEY / EMAIL_FROM / EMAIL_REPLY_TO   only used if Gmail isn't configured
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import nodemailer, { type Transporter } from "nodemailer";

export type Mail = { to: string | string[]; subject: string; html: string; text: string; replyTo?: string };
export type SendResult = { ok: boolean; id?: string; skipped?: boolean; error?: string; via?: "gmail" | "resend" | "preview" };

const GMAIL_USER = process.env.GMAIL_USER || "icbeautyinyou@gmail.com";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "Iisha C. Silver";
export const REPLY_TO = process.env.EMAIL_REPLY_TO || GMAIL_USER;
export const OWNER = (process.env.OWNER_EMAIL || GMAIL_USER).split(",").map((s) => s.trim()).filter(Boolean);

export const emailMode = (): "gmail" | "resend" | "off" => (process.env.GMAIL_APP_PASSWORD ? "gmail" : process.env.RESEND_API_KEY ? "resend" : "off");
export const senderAddress = () => (emailMode() === "gmail" ? GMAIL_USER : emailMode() === "resend" ? process.env.EMAIL_FROM || "hello@icbeautyinyou.com" : GMAIL_USER);

let gmail: Transporter | null = null;
function gmailTransport() {
  if (!gmail) {
    gmail = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "") },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }
  return gmail;
}

export async function sendEmail(m: Mail): Promise<SendResult> {
  const mode = emailMode();
  if (mode === "gmail") {
    try {
      const info = await gmailTransport().sendMail({
        from: { name: FROM_NAME, address: GMAIL_USER },
        to: m.to,
        subject: m.subject,
        html: m.html,
        text: m.text,
        replyTo: m.replyTo || REPLY_TO,
      });
      return { ok: true, id: info.messageId, via: "gmail" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e), via: "gmail" };
    }
  }
  if (mode === "resend") {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: process.env.EMAIL_FROM || `${FROM_NAME} <hello@icbeautyinyou.com>`, to: [m.to].flat(), subject: m.subject, html: m.html, text: m.text, reply_to: m.replyTo || REPLY_TO }),
        signal: AbortSignal.timeout(10000),
      });
      const body = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      return res.ok ? { ok: true, id: body.id, via: "resend" } : { ok: false, error: `${res.status} ${body.message ?? ""}`.trim(), via: "resend" };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e), via: "resend" };
    }
  }
  // Preview mode: keep a copy so the flow can be checked without sending anything.
  try {
    const dir = path.join(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME ? "/tmp" : process.cwd(), ".data", "outbox");
    await fs.mkdir(dir, { recursive: true });
    const name = `${Date.now()}-${m.subject.replace(/[^a-z0-9]+/gi, "-").slice(0, 60)}.html`;
    await fs.writeFile(path.join(dir, name), `<!-- to: ${[m.to].flat().join(", ")} | subject: ${m.subject} -->\n${m.html}`);
  } catch {}
  return { ok: false, skipped: true, error: "Email not connected yet", via: "preview" };
}
