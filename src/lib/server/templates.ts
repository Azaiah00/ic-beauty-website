/** Branded, table-based HTML emails (renders in Gmail, Apple Mail, Outlook). Server-only. */
import { SITE_URL, business } from "@/lib/site";
import type { Confirmation } from "./forms";
import type { Submission } from "./store";

const PLUM = "#24132a";
const AMETHYST = "#6E3F86";
const BONE = "#F8F4EE";
const PAPER = "#FDFBF8";
const MARK = `${SITE_URL}/newsletter/2026-11/ic-mark.png`;

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const strip = (s: string) => s.replace(/<[^>]+>/g, "");

function shell(inner: string, preheader: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>I.C. Beauty</title></head>
<body style="margin:0;padding:0;background:${BONE};">
<span style="display:none!important;opacity:0;color:transparent;height:0;width:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BONE};"><tr><td align="center" style="padding:28px 14px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:${PAPER};border:1px solid #eadfe9;">
<tr><td align="center" style="background:${PLUM};padding:26px 20px;">
<img src="${MARK}" width="44" height="44" alt="" style="display:block;border:0;margin:0 auto 10px;">
<div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;letter-spacing:4px;color:${BONE};">I.C. BEAUTY</div>
<div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:3px;color:#d8c49a;margin-top:6px;">HAIR · HEALTH · EDUCATION</div>
</td></tr>
${inner}
<tr><td style="padding:22px 32px 28px;border-top:1px solid #eadfe9;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:18px;color:#6b5d6e;">
I.C. Beauty · Henrico (Richmond), VA &amp; virtual · <a href="${business.phoneHref}" style="color:${AMETHYST};">${business.phone}</a> · <a href="${SITE_URL}" style="color:${AMETHYST};">icbeautyinyou.com</a><br>
I.C. Beauty provides hair-wellness education and scalp care. We do not diagnose, treat or cure any medical condition.
</td></tr>
</table></td></tr></table></body></html>`;
}

const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 6px;"><tr><td style="background:${PLUM};border-radius:999px;">
<a href="${href}" style="display:inline-block;padding:14px 28px;font-family:Arial,Helvetica,sans-serif;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${BONE};text-decoration:none;font-weight:bold;">${esc(label)}</a></td></tr></table>`;

export function renderConfirmation(c: Confirmation) {
  const paras = c.paragraphs.map((p) => `<p style="margin:0 0 16px;">${p}</p>`).join("");
  const links = (c.links ?? []).map((l) => `<p style="margin:0 0 10px;"><a href="${l.href}" style="color:${AMETHYST};font-weight:bold;">${esc(l.label)}</a></p>`).join("");
  const inner = `<tr><td style="padding:34px 32px 10px;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:26px;color:#3a2a3e;">
<h1 style="margin:0 0 18px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:28px;line-height:34px;color:${PLUM};">${esc(c.heading)}</h1>
${paras}${c.cta ? button(c.cta.label, c.cta.href) : ""}<div style="height:10px"></div>${links}
<p style="margin:22px 0 6px;">With love,</p>
<p style="margin:0 0 24px;font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${PLUM};">Iisha C. Silver</p>
</td></tr>`;
  const text = [c.heading, "", ...c.paragraphs.map(strip), c.cta ? `${c.cta.label}: ${c.cta.href}` : "", ...(c.links ?? []).map((l) => `${l.label}: ${l.href}`), "", "With love,", "Iisha C. Silver", "I.C. Beauty · " + business.phone]
    .filter((l) => l !== undefined)
    .join("\n");
  return { html: shell(inner, strip(c.paragraphs[0] ?? c.heading)), text };
}

const NICE: Record<string, string> = { "utm-source": "Came from", "utm-medium": "Channel", "utm-campaign": "Campaign", "utm-content": "Post / ad", "sms-consent": "OK to text", "lead-magnet": "Download", "refer-flag": "Doctor referral suggested" };
const label = (k: string) => NICE[k] ?? k.replace(/^q-/, "Q: ").replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());

export function renderOwnerAlert(s: Submission, formLabel: string) {
  const link = `${SITE_URL}/admin?form=${encodeURIComponent(s.form)}#${s.id}`;
  const rows = Object.entries(s.data)
    .filter(([k, v]) => v && !["bot-field", "form-name", "name", "first-name", "email", "phone"].includes(k))
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee3ec;color:#6b5d6e;font-size:13px;vertical-align:top;white-space:nowrap;">${esc(label(k))}</td><td style="padding:8px 12px;border-bottom:1px solid #eee3ec;font-size:14px;color:#24132a;">${esc(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  const inner = `<tr><td style="padding:28px 32px 8px;font-family:Arial,Helvetica,sans-serif;color:#3a2a3e;">
<p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:${AMETHYST};font-weight:bold;">NEW · ${esc(formLabel.toUpperCase())}</p>
<h1 style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-weight:normal;font-size:26px;color:${PLUM};">${esc(s.name || s.email)}</h1>
<p style="margin:0 0 18px;font-size:14px;"><a href="mailto:${esc(s.email)}" style="color:${AMETHYST};">${esc(s.email)}</a>${s.phone ? ` · <a href="tel:${esc(s.phone.replace(/[^\d+]/g, ""))}" style="color:${AMETHYST};">${esc(s.phone)}</a>` : ""}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;border-top:1px solid #eee3ec;">${rows}</table>
<div style="height:18px"></div>${button("Open in your dashboard", link)}<div style="height:18px"></div>
</td></tr>`;
  const text = [`New ${formLabel}: ${s.name || s.email}`, `${s.email} ${s.phone}`, "", ...Object.entries(s.data).filter(([, v]) => v).map(([k, v]) => `${label(k)}: ${v}`), "", `Dashboard: ${link}`].join("\n");
  return { html: shell(inner, `${s.name || s.email} just filled out ${formLabel}`), text };
}
