"use client";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Lock } from "lucide-react";

export type ChooserPlan = { id: string; num: string; name: string; term: string; support: string; blurb: string; full: string; fullToday: string; deposit: string; credit: string };

/** Iisha's terms, verbatim from "Your Recovery Agreement" (2026-11-21). */
const TERMS = [
  ["First visit & payments", "Your first program visit is scheduled 30-45 days after your deposit. Your first program installment is due at that visit. Afterward, monthly payments are due the day before each scheduled appointment."],
  ["Cancellations", "Please cancel or reschedule at least 48 hours before your appointment."],
  ["No-show policy", "A valid card must remain securely on file. If you do not attend a scheduled appointment without cancelling, a no-show fee of 50% of that appointment's stated value will be charged to the card on file."],
  ["Refunds", "There are no refunds for services already rendered. The treatment of unused services and enrollment deposits will be described in the written enrollment agreement before payment."],
  ["Results & your role", "Results are not guaranteed. Recovery is a team effort: your consistency with home care, recommended visits, communication, and follow-through are essential to working toward your goals."],
] as const;

const TONE = [
  { card: "bg-bone", rule: "bg-lilac", accent: "text-amethyst" },
  { card: "bg-mist", rule: "bg-amethyst", accent: "text-amethyst" },
  { card: "bg-[#f8f0e2]", rule: "bg-brass", accent: "text-brass-deep" },
];

/**
 * Step 1 pick a program, step 2 deposit or pay in full, step 3 agree to the terms, step 4 (optional) confirmation email.
 * Checkout stays locked until all are done; /api/recovery/checkout re-checks every value server-side (agree=1 included).
 */
export function RecoveryChooser({ plans }: { plans: ChooserPlan[] }) {
  const [plan, setPlan] = useState<string | null>(null);
  const [pay, setPay] = useState<"deposit" | "full" | null>(null);
  const [agree, setAgree] = useState(false);
  const [open, setOpen] = useState(false);
  const [wantEmail, setWantEmail] = useState(false);
  const [email, setEmail] = useState("");
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
  const chosen = plans.find((p) => p.id === plan);
  const ready = !!chosen && !!pay && agree && (!wantEmail || emailOk);
  const amount = chosen && pay ? (pay === "full" ? chosen.fullToday : chosen.deposit) : null;

  return (
    <div className="grid gap-8">
      <fieldset>
        <legend className="eyebrow mb-3 text-amethyst">Step 1 &middot; Choose your program</legend>
        <div role="radiogroup" className="grid gap-4">
          {plans.map((p, i) => {
            const t = TONE[i % 3];
            const on = plan === p.id;
            return (
              <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setPlan(p.id)}
                className={`relative overflow-hidden rounded-card ${t.card} p-6 text-left outline-offset-4 transition-shadow duration-300 sm:p-7 ${on ? "shadow-[0_0_0_2px_var(--color-amethyst)]" : "shadow-[0_0_0_1px_rgba(58,29,69,0.08)] hover:shadow-[0_0_0_1px_rgba(58,29,69,0.3)]"}`}>
                <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1.5 ${t.rule}`} />
                <span className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <span className="flex gap-5">
                    <span className={`font-display text-[2.5rem] italic leading-none ${t.accent}`}>{p.num}</span>
                    <span>
                      <span className="block font-display text-[1.85rem] leading-tight text-plum-900">{p.name} <span className={`italic-accent ${t.accent}`}>Recovery</span></span>
                      <span className={`eyebrow mt-1 block ${t.accent}`}>{p.term} &nbsp;|&nbsp; {p.support}</span>
                      <span className="mt-3 block max-w-md text-[0.98rem] text-plum-700">{p.blurb}</span>
                    </span>
                  </span>
                  <span className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
                    <span className="sm:text-right">
                      <span className="block font-display text-[2.4rem] leading-none text-plum-900">{p.full}</span>
                      <span className="mt-1 block text-[0.88rem] text-plum-700">Deposit {p.deposit}</span>
                    </span>
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${on ? "border-amethyst bg-amethyst text-bone" : "border-plum-800/30"}`} aria-hidden="true">
                      {on && <Check className="h-4 w-4" strokeWidth={2} />}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset disabled={!chosen} className={chosen ? "" : "opacity-50"}>
        <legend className="eyebrow mb-3 text-amethyst">Step 2 &middot; How would you like to pay?</legend>
        <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
          {(["deposit", "full"] as const).map((k) => {
            const on = pay === k;
            const price = chosen ? (k === "full" ? chosen.fullToday : chosen.deposit) : "";
            return (
              <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setPay(k)}
                className={`rounded-card bg-paper p-5 text-left transition-shadow duration-300 ${on ? "shadow-[0_0_0_2px_var(--color-amethyst)]" : "shadow-[0_0_0_1px_rgba(58,29,69,0.12)] hover:shadow-[0_0_0_1px_rgba(58,29,69,0.35)]"}`}>
                <span className="flex items-center justify-between gap-4">
                  <span>
                    <span className="block font-display text-[1.45rem] leading-tight text-plum-900">{k === "deposit" ? "Pay the deposit" : "Pay in full"}</span>
                    <span className="mt-1 block text-[0.88rem] text-plum-700">{k === "deposit" ? <>Secure your spot today; the balance is paid with your program visits. Your {chosen?.credit ?? "$100"} credit comes off that balance.</> : <>Pay for your whole program today, with your {chosen?.credit ?? "$100"} credit already taken off{chosen ? <> (<s>{chosen.full}</s>)</> : null}.</>}</span>
                  </span>
                  <span className="font-display text-[1.7rem] text-plum-900">{price}</span>
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset disabled={!chosen || !pay} className={chosen && pay ? "" : "opacity-50"}>
        <legend className="eyebrow mb-3 text-amethyst">Step 3 &middot; Review your recovery agreement</legend>
        <div className="rounded-card bg-paper p-5 shadow-[0_0_0_1px_rgba(58,29,69,0.12)] sm:p-6">
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 text-left">
            <span className="font-display text-[1.35rem] text-plum-900">Clear expectations. Consistent support. A shared commitment.</span>
            <ChevronDown className={`h-5 w-5 shrink-0 text-amethyst transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {open && (
            <ol className="mt-4 grid gap-4 border-t border-plum-800/10 pt-4">
              {TERMS.map(([h, b], i) => (
                <li key={h} className="flex gap-4">
                  <span className="font-display text-[1.5rem] italic leading-none text-amethyst">{String(i + 1).padStart(2, "0")}</span>
                  <span><span className="block font-display text-[1.2rem] text-plum-900">{h}</span><span className="block text-[0.93rem] text-plum-700">{b}</span></span>
                </li>
              ))}
            </ol>
          )}
          <label className="mt-5 flex cursor-pointer items-start gap-3 border-t border-plum-800/10 pt-4 text-[0.95rem] text-plum-800">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-amethyst)]" />
            <span>I have reviewed these terms, including the 48-hour cancellation requirement, no-show fee, payment timing, and the absence of guaranteed results.</span>
          </label>
        </div>
      </fieldset>

      <fieldset disabled={!chosen || !pay} className={chosen && pay ? "" : "opacity-50"}>
        <legend className="eyebrow mb-3 text-amethyst">Step 4 &middot; Your confirmation</legend>
        <div className="rounded-card bg-paper p-5 shadow-[0_0_0_1px_rgba(58,29,69,0.12)] sm:p-6">
          <label className="flex cursor-pointer items-start gap-3 text-[0.95rem] text-plum-800">
            <input type="checkbox" checked={wantEmail} onChange={(e) => setWantEmail(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--color-amethyst)]" />
            <span>Email me my enrollment confirmation from Iisha, with my program, what I paid and my next steps.</span>
          </label>
          {wantEmail && (
            <label className="mt-4 block">
              <span className="eyebrow block text-plum-700">Email address</span>
              <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                aria-invalid={email.length > 0 && !emailOk}
                className="mt-2 block min-h-12 w-full rounded-xl border border-plum-800/20 bg-white px-4 text-[1rem] text-ink outline-none focus:border-amethyst" />
              {email.length > 0 && !emailOk && <span className="mt-1.5 block text-[0.85rem] text-[#8a3a26]">Please check your email address.</span>}
            </label>
          )}
          <p className="mt-3 text-[0.82rem] text-plum-700">Square also emails your payment receipt.</p>
        </div>
      </fieldset>

      <form method="post" action="/api/recovery/checkout" className="rounded-card bg-plum-950 p-6 text-bone sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-7">
        {ready && (
          <>
            <input type="hidden" name="plan" value={chosen!.id} />
            <input type="hidden" name="pay" value={pay!} />
            <input type="hidden" name="agree" value="1" />
            {wantEmail && (
              <>
                <input type="hidden" name="confirm" value="1" />
                <input type="hidden" name="email" value={email.trim()} />
              </>
            )}
          </>
        )}
        <p className="text-[0.98rem] text-bone/85">
          {ready ? <>You chose <strong className="font-medium text-bone">{chosen!.name} Recovery</strong>, {pay === "full" ? `paid in full, ${chosen!.credit} credit applied` : "deposit"}: <strong className="font-medium text-brass-soft">{amount}</strong></> : wantEmail && chosen && pay && agree && !emailOk ? "Add your email for the confirmation, or untick the box." : "Choose a program, a payment option and agree to the terms to continue."}
        </p>
        <button type="submit" disabled={!ready}
          className={`group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-pill px-7 py-3.5 text-[0.74rem] font-medium uppercase tracking-[0.16em] transition-colors sm:mt-0 sm:w-auto ${ready ? "bg-bone text-plum-900 hover:bg-white" : "cursor-not-allowed border border-bone/25 text-bone/50"}`}>
          <Lock className="h-3.5 w-3.5" aria-hidden="true" strokeWidth={1.6} /> Secure checkout {ready && <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" aria-hidden="true" strokeWidth={1.5} />}
        </button>
      </form>
    </div>
  );
}
