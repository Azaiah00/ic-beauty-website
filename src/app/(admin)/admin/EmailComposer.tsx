"use client";

/** Write-an-email box on each person in the owner dashboard. Templates fill the subject + message; Iisha edits and sends. */
import { useState } from "react";
import { Mail, Send } from "lucide-react";

export type Template = { key: string; label: string; subject: string; body: string };

export function EmailComposer({ form, id, to, back, templates, connected, canMarkContacted }: { form: string; id: string; to: string; back: string; templates: Template[]; connected: boolean; canMarkContacted: boolean }) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(templates[0]?.subject ?? "");
  const [body, setBody] = useState(templates[0]?.body ?? "");
  const [sending, setSending] = useState(false);
  const field = "mt-1.5 block w-full rounded-xl border border-plum-800/15 bg-white px-3 text-[0.95rem] normal-case tracking-normal text-ink focus:border-amethyst focus:outline-none";

  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-amethyst px-4 text-[0.86rem] text-bone transition hover:bg-plum-800">
        <Mail className="h-4 w-4" aria-hidden="true" /> Write an email
      </button>
    );

  return (
    <form method="post" action="/api/admin/email" onSubmit={() => setSending(true)} className="mt-1 grid gap-3 rounded-2xl border border-amethyst/25 bg-mist/60 p-4">
      <input type="hidden" name="form" value={form} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="back" value={back} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.85rem] text-plum-800">
          To <span className="font-medium text-plum-900">{to}</span>
        </p>
        <label className="text-[0.75rem] font-medium uppercase tracking-[0.12em] text-plum-700">
          <span className="sr-only">Start from a template</span>
          <select
            aria-label="Start from a template"
            defaultValue={templates[0]?.key}
            onChange={(e) => {
              const t = templates.find((x) => x.key === e.target.value);
              if (t) {
                setSubject(t.subject);
                setBody(t.body);
              }
            }}
            className="min-h-10 rounded-full border border-plum-800/15 bg-white px-3 text-[0.85rem] normal-case tracking-normal text-plum-900"
          >
            {templates.map((t) => (
              <option key={t.key} value={t.key}>{t.label}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-[0.72rem] font-medium uppercase tracking-[0.14em] text-plum-700">
        Subject
        <input name="subject" required value={subject} onChange={(e) => setSubject(e.target.value)} className={`${field} min-h-11`} />
      </label>
      <label className="block text-[0.72rem] font-medium uppercase tracking-[0.14em] text-plum-700">
        Message
        <textarea name="body" required rows={9} value={body} onChange={(e) => setBody(e.target.value)} className={`${field} py-2.5 leading-relaxed`} />
      </label>
      <p className="text-[0.78rem] text-plum-700">Your signature (&ldquo;With love, Iisha C. Silver&rdquo;) and your I.C. Beauty header are added automatically.</p>
      {canMarkContacted && (
        <label className="flex items-center gap-2 text-[0.88rem] text-plum-900">
          <input type="checkbox" name="markContacted" value="1" defaultChecked className="h-4 w-4 accent-amethyst" /> Mark as Contacted after sending
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button disabled={sending || !connected} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-plum-900 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-bone transition hover:bg-amethyst disabled:opacity-50">
          <Send className="h-4 w-4" aria-hidden="true" /> {sending ? "Sending…" : "Send"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-full px-4 text-[0.82rem] text-plum-700 hover:text-plum-900">Cancel</button>
        {!connected && <span className="text-[0.8rem] text-[#8a3a26]">Your Gmail isn&apos;t connected yet, so sending is off.</span>}
      </div>
    </form>
  );
}
