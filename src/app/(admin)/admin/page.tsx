import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, LogOut, Mail, MessageSquare, Phone, Search, CheckCircle2, AlertTriangle } from "lucide-react";
import { isAdmin } from "@/lib/server/auth";
import { FORMS, formNames } from "@/lib/server/forms";
import { listSubmissions, backend, type Submission } from "@/lib/server/store";
import { funnel } from "@/lib/funnel";

export const metadata: Metadata = { title: "Owner dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const label = (k: string) => k.replace(/^q-/, "").replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const HIDE = new Set(["name", "first-name", "email", "phone"]);

function statusTone(s: string) {
  if (/^(New)$/.test(s)) return "bg-amethyst text-bone";
  if (/(Paid|Booked|Member|Enrolled|Accepted|Delivered|Subscribed)/.test(s)) return "bg-[#2f6b4f] text-white";
  if (/(Not a fit|Declined|Closed|Unsubscribed)/.test(s)) return "bg-plum-800/15 text-plum-800";
  return "bg-brass-soft/40 text-plum-900";
}

function Row({ s, back, showForm }: { s: Submission; back: string; showForm: boolean }) {
  const def = FORMS[s.form];
  const fields = Object.entries(s.data).filter(([k, v]) => v && !HIDE.has(k));
  const tel = s.phone.replace(/[^\d+]/g, "");
  return (
    <li id={s.id} className="scroll-mt-24 rounded-card border border-plum-800/10 bg-paper">
      <details className="group">
        <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[1.3rem] leading-tight text-plum-900">{s.name || s.email}</span>
            <span className="mt-0.5 block truncate text-[0.88rem] text-plum-700">
              {showForm && <span className="font-medium text-amethyst">{def?.tab ?? s.form} · </span>}
              {when(s.createdAt)}
              {s.data.tier ? ` · ${s.data.tier}` : ""}
              {s.data.profile ? ` · ${s.data.profile}` : ""}
            </span>
          </span>
          <span className={`rounded-pill px-3 py-1 text-[0.72rem] font-medium uppercase tracking-[0.1em] ${statusTone(s.status)}`}>{s.status}</span>
        </summary>
        <div className="border-t border-plum-800/10 p-4 sm:p-5">
          <div className="flex flex-wrap gap-2">
            {s.email && (
              <a href={`mailto:${s.email}`} className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-plum-800/20 px-4 text-[0.88rem] text-plum-900 hover:border-plum-800/50">
                <Mail className="h-4 w-4" aria-hidden="true" /> {s.email}
              </a>
            )}
            {tel && (
              <>
                <a href={`tel:${tel}`} className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-plum-800/20 px-4 text-[0.88rem] text-plum-900 hover:border-plum-800/50">
                  <Phone className="h-4 w-4" aria-hidden="true" /> {s.phone}
                </a>
                <a href={`sms:${tel}`} className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-plum-800/20 px-4 text-[0.88rem] text-plum-900 hover:border-plum-800/50">
                  <MessageSquare className="h-4 w-4" aria-hidden="true" /> Text
                </a>
              </>
            )}
          </div>
          {fields.length > 0 && (
            <dl className="mt-4 grid gap-x-6 gap-y-2 text-[0.92rem] sm:grid-cols-[minmax(9rem,auto)_1fr]">
              {fields.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-plum-700">{label(k)}</dt>
                  <dd className="whitespace-pre-wrap break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <form method="post" action="/api/admin/update" className="mt-5 grid gap-3 rounded-xl bg-mist p-4 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
            <input type="hidden" name="form" value={s.form} />
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="back" value={back} />
            <label className="block text-[0.75rem] font-medium uppercase tracking-[0.12em] text-plum-800">
              Status
              <select name="status" defaultValue={s.status} className="mt-1.5 block min-h-11 w-full rounded-lg border border-plum-800/20 bg-white px-3 text-[0.95rem] normal-case tracking-normal text-ink">
                {(def?.statuses ?? [s.status]).map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
            <label className="block text-[0.75rem] font-medium uppercase tracking-[0.12em] text-plum-800">
              Notes
              <textarea name="notes" defaultValue={s.notes} rows={2} className="mt-1.5 block w-full rounded-lg border border-plum-800/20 bg-white px-3 py-2 text-[0.95rem] normal-case tracking-normal text-ink" placeholder="Called Tuesday, wants VIP…" />
            </label>
            <button type="submit" className="min-h-11 rounded-pill bg-plum-900 px-6 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-plum-800">Save</button>
          </form>
          {s.log.length > 0 && (
            <ul className="mt-4 space-y-1 text-[0.8rem] text-plum-700">
              {s.log.map((l, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  {l.ok ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f6b4f]" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#b4533c]" aria-hidden="true" />}
                  <span>
                    {l.step}: {l.ok ? "done" : `not sent (${l.detail ?? "error"})`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ form?: string; q?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { form: rawForm, q: rawQ } = await searchParams;
  const form = rawForm && FORMS[rawForm] ? rawForm : "";
  const q = (rawQ ?? "").trim().toLowerCase();

  const all = await listSubmissions();
  const counts = Object.fromEntries(formNames.map((f) => [f, { total: 0, fresh: 0 }]));
  for (const s of all) {
    if (!counts[s.form]) continue;
    counts[s.form].total++;
    if (s.status === FORMS[s.form].statuses[0] && s.status === "New") counts[s.form].fresh++;
  }
  let rows = form ? all.filter((s) => s.form === form) : all;
  if (q) rows = rows.filter((s) => [s.name, s.email, s.phone, s.notes, ...Object.values(s.data)].join(" ").toLowerCase().includes(q));
  const back = `/admin${form || q ? "?" : ""}${new URLSearchParams({ ...(form ? { form } : {}), ...(q ? { q } : {}) }).toString()}`;
  const pilotCount = counts["pilot-application"]?.total ?? 0;
  const tab = (f: string, text: string, n?: number) => (
    <Link
      key={f || "all"}
      href={f ? `/admin?form=${f}` : "/admin"}
      className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-pill px-4 text-[0.8rem] font-medium ${form === f ? "bg-plum-900 text-bone" : "border border-plum-800/15 bg-paper text-plum-900 hover:border-plum-800/40"}`}
    >
      {text}
      {n !== undefined && <span className={`rounded-pill px-2 py-0.5 text-[0.7rem] ${form === f ? "bg-bone/20" : "bg-mist"}`}>{n}</span>}
    </Link>
  );

  return (
    <main className="min-h-dvh bg-bone pb-20">
      <header className="sticky top-0 z-20 bg-plum-950 text-bone">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="font-display text-[1.25rem] leading-none">I.C. Beauty</p>
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.2em] text-brass-soft">Owner dashboard</p>
          </div>
          <form method="post" action="/api/admin/logout">
            <button className="inline-flex min-h-10 items-center gap-2 rounded-pill border border-bone/25 px-4 text-[0.78rem] hover:border-bone/60">
              <LogOut className="h-4 w-4" aria-hidden="true" /> Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4">
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { f: "pilot-application", t: "30-Day applications", sub: funnel.pilot.seats ? `of ${funnel.pilot.seats} seats` : "founding pilot" },
            { f: "hair-love-optin", t: "Checklist sign-ups", sub: "free download" },
            { f: "scalp-check", t: "Scalp Checks", sub: "quiz results" },
            { f: "circle-join", t: "Circle list", sub: "founding members" },
          ].map((c) => (
            <Link key={c.f} href={`/admin?form=${c.f}`} className="rounded-card bg-plum-900 p-4 text-bone hover:bg-plum-800">
              <p className="text-[2.2rem] font-light leading-none tabular-nums">{counts[c.f]?.total ?? 0}</p>
              <p className="mt-2 text-[0.85rem]">{c.t}</p>
              <p className="text-[0.75rem] text-bone/60">
                {counts[c.f]?.fresh ? `${counts[c.f].fresh} new · ` : ""}
                {c.sub}
              </p>
            </Link>
          ))}
        </section>
        {pilotCount > 0 && !funnel.pilot.corePrice && (
          <p className="mt-3 text-[0.85rem] text-plum-700">Pilot prices aren&apos;t set yet, so applicants get a personal follow-up from you instead of a payment link.</p>
        )}

        <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Forms">
          {tab("", "Everything", all.length)}
          {formNames.map((f) => tab(f, FORMS[f].tab, counts[f].total))}
        </nav>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <form className="flex min-w-0 flex-1 items-center gap-2 rounded-pill border border-plum-800/15 bg-paper px-4" role="search">
            {form && <input type="hidden" name="form" value={form} />}
            <Search className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />
            <input name="q" defaultValue={rawQ} placeholder="Search name, email, phone, notes" aria-label="Search" className="min-h-11 w-full bg-transparent text-[0.95rem] outline-none" />
          </form>
          <a href={`/api/admin/export${form ? `?form=${form}` : ""}`} className="inline-flex min-h-11 items-center gap-2 rounded-pill bg-plum-900 px-5 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-bone hover:bg-plum-800">
            <Download className="h-4 w-4" aria-hidden="true" /> Download CSV
          </a>
        </div>

        <h1 className="mt-8 font-display text-[1.8rem] text-plum-900">{form ? FORMS[form].label : "Everything, newest first"}</h1>
        {rows.length === 0 ? (
          <p className="mt-4 rounded-card bg-paper p-6 text-plum-700">{q ? "No matches." : "Nothing here yet. New submissions appear the moment someone fills out the form."}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((s) => (
              <Row key={s.id} s={s} back={back} showForm={!form} />
            ))}
          </ul>
        )}
        <p className="mt-10 text-[0.75rem] text-plum-700/70">Storage: {backend().kind === "blobs" ? "Netlify Blobs" : "local files (preview)"} · Times shown in Eastern time.</p>
      </div>
    </main>
  );
}
