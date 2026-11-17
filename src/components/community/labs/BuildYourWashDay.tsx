"use client";

/**
 * LAB: Build Your Wash Day. Put the steps in order with the up / down buttons, check the order, then
 * print a personal routine card. The gentle hints come from Lesson 3, "Wash Day, Reimagined".
 */
import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, CheckCircle2, Info, Printer } from "lucide-react";
import type { LabProps } from "./types";

const STEPS = [
  { id: "detangle", label: "Detangle", note: "Gently, in sections", hint: "Detangle first, gently and in sections, so cleansing doesn't tighten the knots." },
  { id: "cleanse", label: "Cleanse your scalp", note: "Clean scalp first", hint: "Clean scalp first, then oils and stylers. Cleansing comes before anything you want your hair to hold on to." },
  { id: "condition", label: "Condition", note: "With intention", hint: "Condition with intention, once your scalp is clean." },
  { id: "rinse", label: "Rinse", note: "Thoroughly", hint: "Rinse before you layer anything on, so nothing sits on top of leftover conditioner." },
  { id: "moisturize", label: "Moisturize", note: "While hair is damp", hint: "Water is the moisturizer. Add moisture while your hair is still damp, before you seal." },
  { id: "seal", label: "Seal", note: "A little oil or butter", hint: "Oils seal, they don't hydrate. Sealing comes after moisture, to hold it in." },
  { id: "style", label: "Style", note: "Low tension", hint: "Style last, with fewer products, used on purpose." },
] as const;
type Id = (typeof STEPS)[number]["id"];
const ORDER: Id[] = STEPS.map((s) => s.id);
const SCRAMBLED: Id[] = ["condition", "style", "cleanse", "seal", "detangle", "moisturize", "rinse"];
const step = (id: Id) => STEPS.find((s) => s.id === id)!;
const CADENCES = ["Every 7 days", "Every 7 to 10 days", "Every 2 weeks"];

export default function BuildYourWashDay({ actor, onComplete }: LabProps) {
  const [order, setOrder] = useState<Id[]>(SCRAMBLED);
  const [checked, setChecked] = useState(false);
  const [tries, setTries] = useState(0);
  const [cadence, setCadence] = useState(CADENCES[1]);
  const [day, setDay] = useState("Sunday");
  const [status, setStatus] = useState("");
  const sent = useRef(false);
  const first = actor.name.split(/\s+/)[0] || "My";
  const allRight = order.every((id, i) => id === ORDER[i]);
  const solved = checked && allRight;

  const move = (i: number, by: -1 | 1) => {
    const j = i + by;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setChecked(false);
    setStatus(`${step(order[i]).label} moved to step ${j + 1}.`);
  };
  const check = () => {
    const n = tries + 1;
    setTries(n);
    setChecked(true);
    const wrong = order.filter((id, i) => id !== ORDER[i]).length;
    setStatus(wrong ? `${wrong} ${wrong === 1 ? "step is" : "steps are"} out of place. Read the notes and try again.` : "That's the order. Your routine card is ready below.");
    if (!wrong && !sent.current) {
      sent.current = true;
      onComplete(Math.max(40, 100 - (n - 1) * 15));
    }
  };

  return (
    <div className="space-y-6">
      <style>{`@media print { body * { visibility: hidden !important; } #wash-day-card, #wash-day-card * { visibility: visible !important; } #wash-day-card { position: absolute; left: 0; top: 0; width: 100%; border: 0 !important; box-shadow: none !important; } .wash-day-noprint { display: none !important; } }`}</style>

      <section className="rounded-card border border-plum-800/10 bg-paper p-4 sm:p-6" aria-labelledby="wd-h">
        <h2 id="wd-h" className="font-display text-[1.6rem] leading-tight text-plum-900">Put the steps in order</h2>
        <p className="text-plum-700">Use the arrows to move each step up or down. Rhythm beats perfection, so take your time.</p>

        <ol className="mt-5 space-y-2">
          {order.map((id, i) => {
            const s = step(id);
            const ok = id === ORDER[i];
            return (
              <li key={id} className={`rounded-xl border p-3 ${checked ? (ok ? "border-sage bg-sage/15" : "border-brass-deep bg-sand") : "border-plum-800/15 bg-white"}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-plum-900 text-[0.9rem] font-medium text-bone" aria-hidden="true">{i + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="sr-only">Step {i + 1}: </span>
                    <span className="block font-medium text-plum-900">{s.label}</span>
                    <span className="block text-[0.84rem] text-plum-700">{s.note}</span>
                  </span>
                  {checked && ok && <span className="flex items-center gap-1 text-[0.8rem] font-medium text-plum-950"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> In place</span>}
                  {!solved && (
                    <span className="flex shrink-0 gap-1">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${s.label} up`} className="flex h-11 w-11 items-center justify-center rounded-full border border-plum-800/20 bg-white text-plum-900 hover:border-amethyst disabled:opacity-30">
                        <ArrowUp className="h-4 w-4" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === order.length - 1} aria-label={`Move ${s.label} down`} className="flex h-11 w-11 items-center justify-center rounded-full border border-plum-800/20 bg-white text-plum-900 hover:border-amethyst disabled:opacity-30">
                        <ArrowDown className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </span>
                  )}
                </div>
                {checked && !ok && (
                  <p className="mt-2 flex gap-2 text-[0.92rem] text-plum-950">
                    <Info className="mt-1 h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" />
                    <span><strong>Not here yet.</strong> {s.hint}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <p aria-live="polite" className="mt-3 min-h-6 text-[0.92rem] text-plum-800">{status}</p>
        {!solved && (
          <button type="button" onClick={check} className="mt-1 inline-flex min-h-12 w-full items-center justify-center rounded-pill bg-plum-900 px-7 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst sm:w-auto">
            Check my order
          </button>
        )}
      </section>

      {solved && (
        <section className="rounded-card border border-plum-800/10 bg-paper p-4 sm:p-6" aria-labelledby="wd-card-h">
          <h2 id="wd-card-h" className="wash-day-noprint font-display text-[1.6rem] leading-tight text-plum-900">Your routine card</h2>
          <div className="wash-day-noprint mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-[0.74rem] font-medium uppercase tracking-[0.14em] text-plum-800">
              My wash day
              <select value={day} onChange={(e) => setDay(e.target.value)} className="mt-1.5 block min-h-11 w-full rounded-xl border border-plum-800/20 bg-white px-3 text-[1rem] normal-case tracking-normal text-ink">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </label>
            <label className="block text-[0.74rem] font-medium uppercase tracking-[0.14em] text-plum-800">
              How often
              <select value={cadence} onChange={(e) => setCadence(e.target.value)} className="mt-1.5 block min-h-11 w-full rounded-xl border border-plum-800/20 bg-white px-3 text-[1rem] normal-case tracking-normal text-ink">
                {CADENCES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
          </div>

          <div id="wash-day-card" className="mt-5 rounded-card border-2 border-brass bg-bone p-6 sm:p-8">
            <p className="eyebrow text-amethyst">The H.A.I.R. Circle · Wash Day Blueprint</p>
            <p className="mt-2 font-display text-[2rem] leading-tight text-plum-900">{first}&apos;s Wash Day</p>
            <p className="mt-1 text-plum-800">{day}s · {cadence.toLowerCase()}</p>
            <ol className="mt-5 space-y-2.5">
              {ORDER.map((id, i) => (
                <li key={id} className="flex items-baseline gap-3 border-b border-plum-800/10 pb-2.5">
                  <span className="font-display text-[1.4rem] text-brass-deep">{i + 1}</span>
                  <span className="font-medium text-plum-900">{step(id).label}</span>
                  <span className="text-[0.88rem] text-plum-700">{step(id).note}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 italic-accent text-[1.2rem] text-plum-900">Clean scalp first. Fewer products, used on purpose. Rhythm beats perfection.</p>
            <p className="mt-3 text-[0.78rem] text-plum-700">Education only, not medical advice. I.C. Beauty · icbeautyinyou.com</p>
          </div>

          <button type="button" onClick={() => window.print()} className="wash-day-noprint mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill bg-plum-900 px-7 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst sm:w-auto">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print my routine card
          </button>
        </section>
      )}
    </div>
  );
}
