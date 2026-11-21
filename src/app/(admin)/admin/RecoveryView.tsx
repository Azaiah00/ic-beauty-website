/**
 * Owner dashboard → Recovery enrollments (?view=recovery).
 * Everyone who paid on /recovery, read live from Square: who, which program, deposit or paid in full, what they paid,
 * what's left after the $100 credit. Iisha tracks each one's progress here (status + notes, saved on the site).
 */
import { after } from "next/server";
import { CheckCircle2, AlertTriangle, ExternalLink, Mail, Phone, Download, Users, Wallet, Inbox, Receipt, Send } from "lucide-react";
import { getRecoveryEnrollments, processEnrollment } from "@/lib/server/recoveryEnrollments";
import { getRecoveryMarks, RECOVERY_STATUSES } from "@/lib/server/tracking";
import { recoveryPlans, usdWhole } from "@/lib/site";
import { emailMode } from "@/lib/server/email";
import { TZ } from "./ui";

const card = "rounded-[1.4rem] bg-white shadow-[0_1px_2px_rgba(36,19,42,0.05),0_18px_40px_-28px_rgba(36,19,42,0.35)]";
const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: TZ, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const prettyPhone = (p: string) => {
  const d = p.replace(/\D/g, "").replace(/^1(?=\d{10}$)/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p;
};
const TONE: Record<string, string> = {
  New: "bg-[#fbeee0] text-[#8a5a1f]",
  "Care plan sent": "bg-mist text-amethyst",
  "Roadmap Zoom done": "bg-mist text-amethyst",
  "In program": "bg-[#e3efe8] text-[#24603f]",
  Completed: "bg-[#e3efe8] text-[#24603f]",
  Cancelled: "bg-plum-800/10 text-plum-800",
};

export async function RecoveryView() {
  const connected = !!process.env.SQUARE_ACCESS_TOKEN;
  const list = await getRecoveryEnrollments();
  const rows = list ?? [];
  const marks = await getRecoveryMarks(rows.map((e) => e.id));

  // Catch-up: an enrollment from the last 3 days that hasn't been emailed yet (client closed the tab before the
  // thank-you page, webhook not set up) gets its emails now, after this page is sent. Each one is only emailed once.
  const pending = rows.filter((e) => !marks.get(e.id)?.alertedAt && Date.now() - +new Date(e.createdAt) < 3 * 864e5);
  if (pending.length) after(async () => { for (const e of pending) await processEnrollment(e).catch(() => null); });

  const status = (id: string) => marks.get(id)?.status ?? "New";
  const collected = rows.reduce((a, e) => a + e.paidCents, 0);
  const owed = rows.filter((e) => status(e.id) !== "Cancelled").reduce((a, e) => a + e.balanceCents, 0);
  const waiting = rows.filter((e) => status(e.id) === "New").length;
  const byPlan = recoveryPlans.map((p) => {
    const mine = rows.filter((e) => e.planId === p.id);
    return { p, deposit: mine.filter((e) => e.pay === "deposit").length, full: mine.filter((e) => e.pay === "full").length };
  });

  return (
    <div className="mt-6 space-y-5">
      {!connected && (
        <p className="flex items-start gap-2 rounded-2xl bg-[#fbeee0] px-4 py-3 text-[0.9rem] text-[#8a5a1f]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          Square isn&apos;t connected on this copy of the site, so enrollments can&apos;t load here.
        </p>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Enrollment totals">
        {[
          { i: Users, t: "Enrolled", v: String(rows.length), s: (() => { const f = rows.filter((e) => e.pay === "full").length, d = rows.length - f; return `${f} paid in full · ${d} deposit${d === 1 ? "" : "s"}`; })() },
          { i: Inbox, t: "Waiting on you", v: String(waiting), s: "New enrollments to welcome" },
          { i: Wallet, t: "Collected online", v: usdWhole(collected), s: "Deposits + full payments" },
          { i: Receipt, t: "Balances still due", v: usdWhole(owed), s: "After each $100 credit" },
        ].map((k) => (
          <div key={k.t} className={`${card} flex items-center gap-4 p-5`}>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mist text-amethyst"><k.i className="h-5 w-5" aria-hidden="true" strokeWidth={1.6} /></span>
            <span className="min-w-0">
              <span className="block text-[0.78rem] font-medium text-plum-700">{k.t}</span>
              <span className="block text-[2rem] font-light leading-tight tabular-nums text-plum-900">{k.v}</span>
              <span className="block truncate text-[0.75rem] text-plum-700/80">{k.s}</span>
            </span>
          </div>
        ))}
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="byplan-title">
        <h2 id="byplan-title" className="font-display text-[1.45rem] leading-tight text-plum-900">By program</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {byPlan.map(({ p, deposit, full }) => (
            <li key={p.id} className="rounded-2xl bg-bone/80 p-4">
              <p className="font-display text-[1.2rem] text-plum-900">{p.name} <span className="italic text-amethyst">Recovery</span></p>
              <p className="text-[0.78rem] text-plum-700">{p.term} · {usdWhole(p.fullCents)} · deposit {usdWhole(p.depositCents)}</p>
              <p className="mt-2 text-[0.9rem] text-plum-900"><span className="text-[1.6rem] font-light tabular-nums">{deposit + full}</span> enrolled</p>
              <p className="text-[0.8rem] text-plum-700">{full} paid in full · {deposit} deposit{deposit === 1 ? "" : "s"}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="enrolled-title">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 id="enrolled-title" className="font-display text-[1.45rem] leading-tight text-plum-900">Everyone enrolled, newest first</h2>
            <p className="text-[0.85rem] text-plum-700">Straight from your Square payments on the Your Recovery. Your Way. page. You get an email each time someone enrolls.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/api/admin/recovery" className="inline-flex min-h-10 items-center gap-2 rounded-full bg-plum-900 px-4 text-[0.8rem] text-bone hover:bg-amethyst"><Download className="h-3.5 w-3.5" aria-hidden="true" /> Spreadsheet</a>
            <a href="https://app.squareup.com/dashboard/sales/transactions" target="_blank" rel="noopener" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-plum-800/15 px-4 text-[0.8rem] text-plum-900 hover:border-amethyst">Square transactions <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
          </div>
        </div>
        {list === null ? (
          <p className="mt-5 text-[0.9rem] text-plum-700">{connected ? "Square didn't answer just now. Refresh in a minute." : "Enrollments show here once Square is connected."}</p>
        ) : rows.length === 0 ? (
          <p className="mt-5 rounded-2xl bg-bone px-4 py-6 text-center text-[0.92rem] text-plum-700">No enrollments yet. They&apos;ll appear here the moment someone pays on your recovery page.</p>
        ) : (
          <ul className="mt-5 space-y-3">
            {rows.map((e) => {
              const m = marks.get(e.id);
              const st = status(e.id);
              return (
                <li key={e.id} id={e.id} className="scroll-mt-24 rounded-2xl border border-plum-800/10 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-plum-900">{e.name || e.email || "Recovery client"}</p>
                      <p className="text-[0.8rem] text-plum-700">{when(e.createdAt)}</p>
                    </div>
                    <span className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-plum-800/15 px-3 py-1 text-[0.75rem] font-medium text-plum-900">{e.pay === "full" ? "Paid in full" : "Deposit"}</span>
                      <span className={`rounded-full px-3 py-1 text-[0.75rem] font-medium ${TONE[st] ?? TONE.New}`}>{st}</span>
                    </span>
                  </div>
                  <dl className="mt-3 grid gap-x-6 gap-y-1.5 rounded-2xl bg-bone/70 p-3.5 text-[0.9rem] sm:grid-cols-[minmax(9rem,auto)_1fr]">
                    <dt className="text-plum-700">Program</dt><dd className="text-ink">{e.program}</dd>
                    <dt className="text-plum-700">Paid</dt><dd className="text-ink">{usdWhole(e.paidCents)}{e.pay === "full" ? " ($100 credit applied)" : ""}</dd>
                    {e.pay === "deposit" && (<><dt className="text-plum-700">Balance after credit</dt><dd className="text-ink">{usdWhole(e.balanceCents)}</dd></>)}
                    <dt className="text-plum-700">Confirmation email</dt><dd className="text-ink">{m?.confirmedTo ? `Sent to ${m.confirmedTo}` : e.confirmEmail ? `Requested (${e.confirmEmail})` : "Not requested"}</dd>
                  </dl>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {e.phone && <a href={`tel:${e.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-mist px-3 text-[0.8rem] text-plum-900"><Phone className="h-3.5 w-3.5" aria-hidden="true" /> Call {prettyPhone(e.phone)}</a>}
                    {e.phone && <a href={`sms:${e.phone}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-mist px-3 text-[0.8rem] text-plum-900">Text</a>}
                    {e.email && <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Your ${e.program}`)}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-mist px-3 text-[0.8rem] text-plum-900"><Mail className="h-3.5 w-3.5" aria-hidden="true" /> {e.email}</a>}
                    {e.receiptUrl && <a href={e.receiptUrl} target="_blank" rel="noopener" className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-plum-800/15 px-3 text-[0.8rem] text-plum-900">Receipt <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
                  </div>
                  <form method="post" action="/api/admin/recovery" className="mt-4 grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
                    <input type="hidden" name="action" value="status" />
                    <input type="hidden" name="id" value={e.id} />
                    <label>
                      <span className="sr-only">Progress</span>
                      <select name="status" defaultValue={st} className="min-h-10 w-full rounded-full border border-plum-800/15 bg-white px-3 text-[0.88rem] text-plum-900">
                        {RECOVERY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">Notes</span>
                      <input name="notes" defaultValue={m?.notes ?? ""} placeholder="Notes (care plan sent, Zoom date…)" className="min-h-10 w-full rounded-full border border-plum-800/15 bg-white px-4 text-[0.88rem]" />
                    </label>
                    <button className="min-h-10 rounded-full bg-plum-900 px-5 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-bone hover:bg-amethyst">Save</button>
                  </form>
                  {m?.emailLog && <p className="mt-2 flex items-start gap-1.5 text-[0.75rem] text-plum-700">{/not sent/.test(m.emailLog) ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass-deep" aria-hidden="true" /> : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2f6b4f]" aria-hidden="true" />} {m.emailLog}</p>}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className={`${card} p-5 sm:p-6`} aria-labelledby="test-title">
        <h2 id="test-title" className="font-display text-[1.45rem] leading-tight text-plum-900">Send a test</h2>
        <p className="text-[0.85rem] text-plum-700">
          Sends both enrollment emails with sample details (Supported Recovery, $375 deposit), marked [TEST]: your new-enrollment alert, and the client confirmation to the address below. Nothing is charged and nothing is added to the list.
          {emailMode() === "off" && " Email isn't connected on this copy of the site, so the test won't send."}
        </p>
        <form method="post" action="/api/admin/recovery" className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="action" value="test" />
          <label className="flex-1">
            <span className="sr-only">Client email for the test</span>
            <input name="email" type="email" required placeholder="Client email for the test" className="min-h-11 w-full rounded-full border border-plum-800/15 bg-white px-4 text-[0.92rem]" />
          </label>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-plum-900 px-6 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-bone hover:bg-amethyst"><Send className="h-4 w-4" aria-hidden="true" /> Send test</button>
        </form>
      </section>
    </div>
  );
}
