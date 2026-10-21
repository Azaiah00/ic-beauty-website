"use client";

import { useState } from "react";

const PHASES = [
  {
    id: "anagen",
    name: "Anagen",
    label: "Growing",
    time: "about 3–5 years",
    text: "The active growth phase. The bulb sits deep in the skin and the strand grows steadily. A healthy scalp keeps most of its hair here, which is why protecting this phase matters so much.",
    bulbY: 0,
    shaft: 1,
  },
  {
    id: "catagen",
    name: "Catagen",
    label: "Transition",
    time: "brief",
    text: "A short transition. Growth stops and the follicle shrinks and moves up toward the surface.",
    bulbY: -38,
    shaft: 0.92,
  },
  {
    id: "telogen",
    name: "Telogen",
    label: "Resting",
    time: "about 2–4 months",
    text: "The resting phase. The hair stays in place while a new one begins to form underneath. Stress, illness, or childbirth can push more hairs into this phase at once, and the extra shedding shows up months later.",
    bulbY: -60,
    shaft: 0.88,
  },
  {
    id: "exogen",
    name: "Exogen",
    label: "Shedding",
    time: "the release",
    text: "The old hair is released and falls out, and a new anagen hair takes its place. Losing 50–100 hairs a day is normal.",
    bulbY: -70,
    shaft: 0.5,
  },
];

/** Interactive, accessible hair growth cycle explainer (educational; supports AEO). */
export function GrowthCycle() {
  const [i, setI] = useState(0);
  const p = PHASES[i];
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-card bg-plum-900">
        <svg viewBox="0 0 300 375" className="h-full w-full" role="img" aria-label={`Illustration of a hair follicle in the ${p.name} phase`}>
          <defs>
            <linearGradient id="skin" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#4e2a5c" />
              <stop offset="1" stopColor="#24132a" />
            </linearGradient>
          </defs>
          <rect x="0" y="120" width="300" height="255" fill="url(#skin)" />
          <path d="M0 120 C60 112 120 128 180 118 S260 112 300 120" fill="none" stroke="#9b72b0" strokeWidth="1.5" />
          {[170, 230, 300].map((y) => (
            <path key={y} d={`M0 ${y} C80 ${y - 6} 160 ${y + 6} 300 ${y}`} fill="none" stroke="#9b72b0" strokeOpacity="0.25" strokeDasharray="2 6" />
          ))}
          {/* follicle sheath */}
          <g style={{ transform: `translateY(${p.bulbY}px)`, transition: "transform 900ms cubic-bezier(.22,1,.36,1)" }}>
            <path d="M132 120 C130 200 128 260 124 300 C120 330 180 330 176 300 C172 260 170 200 168 120" fill="#3a1d45" stroke="#cdb8dc" strokeOpacity="0.6" />
            <ellipse cx="150" cy="305" rx="24" ry="20" fill="#c8a15a" fillOpacity={i === 0 ? 0.95 : 0.45} style={{ transition: "fill-opacity 600ms" }} />
            <ellipse cx="150" cy="310" rx="9" ry="8" fill="#8f6c2c" />
          </g>
          {/* shaft */}
          <g style={{ transformOrigin: "150px 300px", transform: `translateY(${p.bulbY}px) scaleY(${p.shaft})`, transition: "transform 900ms cubic-bezier(.22,1,.36,1)" }}>
            <path d="M150 300 C148 220 152 160 150 120 C147 80 160 50 150 20 C142 0 158 -20 150 -40" fill="none" stroke="#f7f2eb" strokeWidth="5" strokeLinecap="round" />
          </g>
          {i === 3 && <path d="M200 140 C215 120 205 100 222 80" fill="none" stroke="#f7f2eb" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />}
          <text x="16" y="108" fill="#cdb8dc" fontFamily="var(--font-mono)" fontSize="10" letterSpacing="2">SCALP SURFACE</text>
        </svg>
        <span className="eyebrow absolute left-4 top-4 rounded-full bg-plum-950/70 px-3 py-1.5 text-brass">{p.name} · {p.label}</span>
      </div>
      <div>
        <div role="tablist" aria-label="Hair growth phases" className="flex flex-wrap gap-2">
          {PHASES.map((ph, k) => (
            <button
              key={ph.id}
              role="tab"
              id={`tab-${ph.id}`}
              aria-selected={k === i}
              aria-controls={`panel-${ph.id}`}
              onClick={() => setI(k)}
              className={`rounded-pill border px-4 py-2 text-[0.92rem] transition ${k === i ? "border-plum-900 bg-plum-900 text-bone" : "border-plum-800/20 text-plum-800 hover:border-plum-800"}`}
            >
              {k + 1}. {ph.name}
            </button>
          ))}
        </div>
        <label className="mt-6 block">
          <span className="sr-only">Scrub through the growth cycle</span>
          <input type="range" min={0} max={3} step={1} value={i} onChange={(e) => setI(Number(e.target.value))} className="w-full accent-amethyst" />
        </label>
        {PHASES.map((ph, k) => (
          <div key={ph.id} id={`panel-${ph.id}`} role="tabpanel" aria-labelledby={`tab-${ph.id}`} hidden={k !== i} className="mt-6">
            <h3 className="font-display text-4xl text-plum-900">{ph.name} <span className="italic-accent text-amethyst">({ph.label.toLowerCase()})</span></h3>
            <p className="eyebrow mt-2 text-amethyst">Typical length: {ph.time}</p>
            <p className="mt-4 text-[1.05rem] text-plum-700">{ph.text}</p>
          </div>
        ))}
        <p className="mt-6 text-[0.8rem] text-plum-700/90">Sources: Wolfram LJ, J Am Acad Dermatol 2003; American Academy of Dermatology.</p>
      </div>
    </div>
  );
}
