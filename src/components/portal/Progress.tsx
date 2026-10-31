"use client";

import Image from "next/image";
import { Camera, Check, TrendingDown } from "lucide-react";
import { usePortal } from "./PortalState";
import { checkIns, metrics, habits, days, todayIndex, photoCheckIns, demoMember } from "@/lib/portal/data";

const COLORS = ["#6e3f86", "#b8955a", "#7d8c6a", "#3a1d45"];

function TrendChart({ series }: { series: { label: string; values: number[] }[] }) {
  const W = 640, H = 240, P = { l: 34, r: 16, t: 16, b: 34 };
  const n = series[0].values.length;
  const x = (i: number) => P.l + (i * (W - P.l - P.r)) / (n - 1);
  const y = (v: number) => P.t + ((10 - v) * (H - P.t - P.b)) / 9;
  const labels = [...checkIns.map((c) => c.label), "This week"].slice(0, n);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Weekly self-ratings trend">
      {[2, 4, 6, 8, 10].map((g) => (
        <g key={g}>
          <line x1={P.l} x2={W - P.r} y1={y(g)} y2={y(g)} stroke="#ece4d8" />
          <text x={P.l - 10} y={y(g)} textAnchor="end" dominantBaseline="central" fontSize="11" fill="#5c4d60">{g}</text>
        </g>
      ))}
      {labels.map((l, i) => (
        <text key={l} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill="#5c4d60">{l}</text>
      ))}
      {series.map((s, si) => (
        <g key={s.label}>
          <polyline fill="none" stroke={COLORS[si]} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={s.values.map((v, i) => `${x(i)},${y(v)}`).join(" ")} />
          {s.values.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="4" fill="#fdfbf8" stroke={COLORS[si]} strokeWidth="2" />)}
        </g>
      ))}
    </svg>
  );
}

export function Progress() {
  const { thisWeek, setRating, saveCheckIn, checkInSaved, habitGrid, toggleHabit } = usePortal();
  const series = metrics.map((m) => ({ label: m.label, values: [...checkIns.map((c) => c[m.key]), thisWeek[m.key]] }));
  const first = checkIns[0].score, latest = checkIns[checkIns.length - 1].score;

  return (
    <div className="grid min-w-0 grid-cols-1 gap-6 [&>*]:min-w-0">
      <div>
        <p className="eyebrow text-amethyst">My progress</p>
        <h1 className="mt-2 font-display text-[clamp(2.1rem,1.6rem+2vw,3.2rem)] leading-tight text-plum-900">See how far <span className="italic-accent text-amethyst">you&apos;ve come.</span></h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <section className="rounded-card border border-plum-800/10 bg-paper p-6 lg:col-span-2">
          <h2 className="font-display text-[1.6rem] text-plum-900">Weekly check-in</h2>
          <p className="mt-1 text-[0.9rem] text-plum-700">Week {demoMember.currentWeek + 1} · rate how you feel right now (10 = best)</p>
          <div className="mt-5 grid gap-5">
            {metrics.map((m, i) => (
              <div key={m.key}>
                <label htmlFor={`r-${m.key}`} className="flex items-center justify-between text-[0.92rem] text-plum-900">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />{m.label}</span>
                  <span className="font-display text-[1.3rem] text-amethyst">{thisWeek[m.key]}</span>
                </label>
                <input id={`r-${m.key}`} type="range" min={1} max={10} value={thisWeek[m.key]} onChange={(e) => setRating(m.key, Number(e.target.value))} className="mt-2 w-full accent-amethyst" />
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-4">
            <button type="button" onClick={saveCheckIn} className="rounded-pill bg-plum-900 px-5 py-2.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst">Save check-in</button>
            <span aria-live="polite" className="text-[0.85rem] text-sage">{checkInSaved ? "Saved. Iisha can see it too." : ""}</span>
          </div>
        </section>

        <section className="rounded-card border border-plum-800/10 bg-paper p-6 lg:col-span-3">
          <h2 className="font-display text-[1.6rem] text-plum-900">Your trend</h2>
          <div className="mt-4"><TrendChart series={series} /></div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.8rem] text-plum-700">
            {metrics.map((m, i) => <li key={m.key} className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />{m.label}</li>)}
          </ul>
          <p className="mt-5 flex items-center gap-2 rounded-xl bg-sand/60 px-4 py-3 text-[0.92rem] text-plum-900">
            <TrendingDown className="h-4 w-4 text-sage" aria-hidden="true" />
            Red flags checklist score: <strong>{first} → {latest}</strong> since your baseline.
          </p>
        </section>
      </div>

      <section className="rounded-card border border-plum-800/10 bg-paper p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[1.6rem] text-plum-900">Habit tracker · this week</h2>
          <span className="text-[0.8rem] text-plum-700">Tap a circle to check it off</span>
        </div>
        <div className="mt-5 overflow-x-auto" data-scroll-inner>
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <thead>
              <tr>
                <th className="pb-3 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-plum-700">Habit</th>
                {days.map((d, i) => <th key={d} className={`pb-3 text-center text-[0.75rem] font-medium uppercase tracking-[0.14em] ${i === todayIndex ? "text-amethyst" : "text-plum-700"}`}>{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {habits.map((h) => (
                <tr key={h.key} className="border-t border-plum-800/8">
                  <td className="py-2.5 pr-4 text-[0.93rem] text-plum-900">{h.label}</td>
                  {days.map((d, i) => {
                    const on = habitGrid[h.key][i];
                    return (
                      <td key={d} className="py-2.5 text-center">
                        <button type="button" onClick={() => toggleHabit(h.key, i)} aria-pressed={on} aria-label={`${h.label}, ${d}`} className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition ${on ? "border-amethyst bg-amethyst text-bone" : i > todayIndex ? "border-plum-800/10 text-transparent" : "border-plum-800/25 hover:border-amethyst"}`}>
                          {on && <Check className="h-4 w-4" aria-hidden="true" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-card border border-plum-800/10 bg-paper p-6">
        <h2 className="font-display text-[1.6rem] text-plum-900">Photo check-ins</h2>
        <p className="mt-1 text-[0.9rem] text-plum-700">Same light, same angles, every few weeks. Your photos are private to you and Iisha.</p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {photoCheckIns.map((p) => (
            <figure key={p.label}>
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand">
                {p.image ? (
                  <Image src={`/images/${p.image}.jpg`} alt={`${p.label} check-in photo`} fill sizes="(min-width: 640px) 22vw, 45vw" className="object-cover" />
                ) : (
                  <button type="button" className="flex h-full w-full flex-col items-center justify-center gap-2 border-2 border-dashed border-plum-800/20 text-plum-700 hover:border-amethyst hover:text-amethyst" title="Demo: uploads connect to secure storage at launch">
                    <Camera className="h-6 w-6" aria-hidden="true" /><span className="text-[0.8rem]">Add photo</span>
                  </button>
                )}
              </div>
              <figcaption className="mt-2 text-[0.82rem] text-plum-700"><strong className="text-plum-900">{p.label}</strong> · {p.date}</figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
