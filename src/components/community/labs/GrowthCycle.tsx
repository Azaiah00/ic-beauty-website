"use client";

/**
 * LAB: The Hair Growth Cycle. Drag the timeline (or use the phase buttons / arrow keys) and the follicle
 * drawing changes with it. Education only. Facts credited to the American Academy of Dermatology.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ExternalLink, Info } from "lucide-react";
import type { LabProps } from "./types";

const AAD = "https://www.aad.org/public/diseases/hair-loss/insider/shedding";

const PHASES = [
  { key: "anagen", name: "Anagen", plain: "Growth", lasts: "Years", from: 0, to: 55, text: "The follicle sits deep in the scalp and the hair is actively growing. Most of the hair on your head is in this phase at any one time, and it can last for years." },
  { key: "catagen", name: "Catagen", plain: "Transition", lasts: "Weeks", from: 55, to: 68, text: "Growth slows and stops. The follicle shrinks and the base of the hair lets go of its blood supply. This short phase lasts a few weeks." },
  { key: "telogen", name: "Telogen", plain: "Rest", lasts: "Months", from: 68, to: 88, text: "The hair rests in place for a few months while the follicle is quiet. Underneath, a new hair is getting ready to grow." },
  { key: "exogen", name: "Exogen", plain: "Shedding", lasts: "Days", from: 88, to: 100, text: "The resting hair is released and sheds, often with a tiny white bulb at the root end. A new hair is already growing in behind it." },
] as const;

const QUIZ = [
  { q: "Which phase lasts the longest?", options: ["Anagen (growth)", "Catagen (transition)", "Exogen (shedding)"], answer: 0, why: "Anagen, the growth phase, can last for years. That's where most of your hair is right now." },
  { q: "How much daily shedding is considered normal?", options: ["None at all", "About 50 to 100 hairs", "About 500 hairs"], answer: 1, why: "Shedding 50 to 100 hairs a day is normal (American Academy of Dermatology)." },
  { q: "After a stressful event, when does extra shedding often show up?", options: ["The same day", "A few months later", "Never"], answer: 1, why: "Stress-related shedding often shows up a few months after the event. Hair keeps time on a delay." },
];

const lerp = (a: number, b: number, t: number) => a + (b - a) * Math.max(0, Math.min(1, t));

export default function GrowthCycle({ onComplete }: LabProps) {
  const [value, setValue] = useState(10);
  const [answers, setAnswers] = useState<(number | null)[]>(QUIZ.map(() => null));
  const done = useRef(false);

  const phaseIndex = Math.max(0, PHASES.findIndex((p) => value >= p.from && (value < p.to || p.to === 100)));
  const phase = PHASES[phaseIndex];
  const t = (value - phase.from) / (phase.to - phase.from);

  // Drawing numbers. Skin line sits at y = 110.
  const g = useMemo(() => {
    const k = phase.key;
    const depth = k === "anagen" ? 150 : k === "catagen" ? lerp(150, 105, t) : 105; // how deep the follicle reaches
    const bulb = k === "anagen" ? 15 : k === "catagen" ? lerp(15, 8, t) : 8; // round bulb → narrow club
    const length = k === "anagen" ? lerp(18, 96, t) : 96; // hair above the skin
    const lift = k === "exogen" ? lerp(0, 70, t) : 0; // the old hair leaving
    const fade = k === "exogen" ? lerp(1, 0.25, t) : 1;
    const fresh = k === "telogen" ? lerp(0, 14, t) : k === "exogen" ? lerp(14, 46, t) : 0; // the new hair underneath
    const supply = k === "anagen" ? 1 : k === "catagen" ? lerp(1, 0, t) : k === "exogen" ? lerp(0.3, 1, t) : 0.15;
    return { depth, bulb, length, lift, fade, fresh, supply };
  }, [phase.key, t]);

  const score = answers.filter((a, i) => a === QUIZ[i].answer).length;
  const finished = answers.every((a) => a !== null);
  useEffect(() => {
    if (finished && !done.current) {
      done.current = true;
      onComplete(Math.round((score / QUIZ.length) * 100));
    }
  }, [finished, score, onComplete]);

  const baseY = 110 + g.depth;

  return (
    <div className="space-y-6">
      <section className="rounded-card border border-plum-800/10 bg-paper p-4 sm:p-6" aria-labelledby="gc-h">
        <h2 id="gc-h" className="font-display text-[1.6rem] leading-tight text-plum-900">Move through the cycle</h2>
        <p className="text-plum-700">Drag the slider, or tap a phase. Every hair on your head is somewhere on this line right now.</p>

        <div className="mt-5 grid gap-6 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:items-center">
          <svg viewBox="0 0 240 300" role="img" aria-label={`Follicle drawing: ${phase.name}, ${phase.plain.toLowerCase()} phase`} className="mx-auto h-auto w-full max-w-[17rem] rounded-card bg-bone">
            {/* scalp */}
            <rect x="0" y="110" width="240" height="190" fill="var(--color-sand)" />
            <rect x="0" y="110" width="240" height="14" fill="var(--color-brass-soft)" opacity="0.7" />
            <line x1="0" y1="110" x2="240" y2="110" stroke="var(--color-brass-deep)" strokeWidth="1.5" />
            <text x="8" y="102" fontSize="10" fill="var(--color-plum-700)">Scalp surface</text>
            {/* follicle channel */}
            <path d={`M108 110 L108 ${baseY - 6} Q120 ${baseY + 14} 132 ${baseY - 6} L132 110 Z`} fill="var(--color-paper)" stroke="var(--color-orchid)" strokeWidth="2" />
            {/* blood supply (papilla) */}
            <ellipse cx="120" cy={baseY + 16} rx="13" ry="7" fill="var(--color-amethyst)" opacity={0.15 + g.supply * 0.75} />
            <text x="140" y={baseY + 20} fontSize="10" fill="var(--color-plum-700)">Blood supply</text>
            {/* new hair growing underneath */}
            {g.fresh > 0 && <line x1="120" y1={baseY + 2} x2="120" y2={baseY + 2 - g.fresh} stroke="var(--color-amethyst)" strokeWidth="4" strokeLinecap="round" />}
            {/* the hair */}
            <g opacity={g.fade} transform={`translate(0 ${-g.lift})`}>
              <line x1="120" y1={110 - g.length} x2="120" y2={baseY - g.bulb - (phase.key === "anagen" ? 0 : 16)} stroke="var(--color-plum-900)" strokeWidth="5" strokeLinecap="round" />
              <ellipse cx="120" cy={baseY - g.bulb - (phase.key === "anagen" ? 0 : 16) + g.bulb * 0.6} rx={g.bulb * 0.62} ry={g.bulb} fill={phase.key === "anagen" ? "var(--color-plum-800)" : "var(--color-paper)"} stroke="var(--color-plum-900)" strokeWidth="2" />
            </g>
          </svg>

          <div>
            <div aria-live="polite" className="min-h-[9.5rem]">
              <p className="eyebrow text-amethyst">{phase.plain} · lasts {phase.lasts.toLowerCase()}</p>
              <p className="mt-1 font-display text-[1.9rem] leading-tight text-plum-900">{phase.name}</p>
              <p className="mt-2 text-plum-800">{phase.text}</p>
            </div>

            <label htmlFor="gc-range" className="mt-4 block text-[0.74rem] font-medium uppercase tracking-[0.14em] text-plum-800">Timeline of one hair</label>
            <input
              id="gc-range"
              type="range"
              min={0}
              max={100}
              step={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              aria-valuetext={`${phase.name}, ${phase.plain.toLowerCase()} phase`}
              className="mt-2 h-11 w-full cursor-pointer accent-[var(--color-amethyst)]"
            />
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PHASES.map((p, i) => (
                <button key={p.key} type="button" aria-pressed={i === phaseIndex} onClick={() => setValue(Math.round((p.from + p.to) / 2))} className={`min-h-11 rounded-xl border px-2 text-[0.88rem] transition ${i === phaseIndex ? "border-plum-900 bg-plum-900 text-bone" : "border-plum-800/20 bg-white text-plum-900 hover:border-amethyst"}`}>
                  <span className="block font-medium">{p.plain}</span>
                  <span className={`block text-[0.72rem] ${i === phaseIndex ? "text-lilac" : "text-plum-700"}`}>{p.lasts}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {["Shedding 50–100 hairs a day is normal.", "Stress-related shedding often shows up a few months after the event."].map((fact) => (
            <li key={fact} className="flex gap-3 rounded-xl bg-mist p-4 text-plum-900">
              <Info className="mt-1 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
              <span>
                {fact}{" "}
                <a href={AAD} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 whitespace-nowrap text-[0.86rem] text-amethyst underline underline-offset-2 hover:text-plum-900">
                  Source: American Academy of Dermatology <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  <span className="sr-only">(opens in a new tab)</span>
                </a>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-card border border-plum-800/10 bg-paper p-4 sm:p-6" aria-labelledby="gc-quiz">
        <h2 id="gc-quiz" className="font-display text-[1.6rem] leading-tight text-plum-900">Quick check</h2>
        <p className="text-plum-700">Three questions. You&apos;ll see the answer right away.</p>
        <div className="mt-4 space-y-5">
          {QUIZ.map((item, qi) => {
            const picked = answers[qi];
            return (
              <fieldset key={item.q} className="rounded-xl border border-plum-800/10 p-4">
                <legend className="px-1 font-medium text-plum-900">{qi + 1}. {item.q}</legend>
                <div className="mt-2 grid gap-2">
                  {item.options.map((o, oi) => {
                    const right = picked !== null && oi === item.answer;
                    const wrong = picked === oi && oi !== item.answer;
                    return (
                      <label key={o} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 ${right ? "border-sage bg-sage/15" : wrong ? "border-brass-deep bg-sand" : "border-plum-800/15 bg-white"}`}>
                        <input type="radio" name={`gc-q${qi}`} checked={picked === oi} disabled={picked !== null} onChange={() => setAnswers((a) => a.map((x, i) => (i === qi ? oi : x)))} className="h-5 w-5 accent-[var(--color-amethyst)]" />
                        <span className="text-plum-900">{o}</span>
                        {right && <span className="ml-auto flex items-center gap-1 text-[0.8rem] font-medium text-plum-950"><CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Correct answer</span>}
                        {wrong && <span className="ml-auto text-[0.8rem] font-medium text-plum-950">Not quite</span>}
                      </label>
                    );
                  })}
                </div>
                <p aria-live="polite" className="mt-2 min-h-6 text-[0.92rem] text-plum-800">{picked !== null ? item.why : ""}</p>
              </fieldset>
            );
          })}
        </div>
        <p aria-live="polite" className="mt-4 font-display text-[1.4rem] text-plum-900">
          {finished ? `You got ${score} of ${QUIZ.length}. ${score === QUIZ.length ? "You know your cycle." : "Slide through the phases once more and it will stick."}` : ""}
        </p>
        {finished && (
          <button type="button" className="mt-2 inline-flex min-h-11 items-center rounded-pill border border-plum-900/25 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900 hover:border-plum-900" onClick={() => setAnswers(QUIZ.map(() => null))}>
            Try the questions again
          </button>
        )}
      </section>
    </div>
  );
}
