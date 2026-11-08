/** Small server-rendered UI pieces for the owner dashboard (no client JS needed). */
import type { Submission } from "@/lib/server/store";

export const TZ = "America/New_York";

export function initials(s: Submission) {
  const n = (s.name || s.email).trim();
  const parts = n.split(/[\s@._-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

const AVATAR = ["bg-plum-900 text-bone", "bg-amethyst text-bone", "bg-brass-soft text-plum-900", "bg-lilac/60 text-plum-900", "bg-orchid/70 text-bone"];
export function avatarTone(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return AVATAR[h % AVATAR.length];
}

export function Avatar({ s, size = "h-11 w-11 text-[0.85rem]" }: { s: Submission; size?: string }) {
  return <span className={`flex shrink-0 items-center justify-center rounded-full font-medium tracking-wide ${size} ${avatarTone(s.email || s.name)}`}>{initials(s)}</span>;
}

/** Progress ring with a gradient stroke and soft glow. value 0–1. */
export function Ring({ id, value, size = 64, stroke = 7, label, track = "rgba(248,244,238,0.18)", from = "#F8F4EE", to = "#DCC394", text = "text-bone", glow = false }: { id: string; value: number; size?: number; stroke?: number; label: string; track?: string; from?: string; to?: string; text?: string; glow?: boolean }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value || 0));
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90" style={glow ? { filter: `drop-shadow(0 0 ${size / 14}px ${from}88)` } : undefined}>
        <defs>
          <linearGradient id={`ring-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        {v > 0 && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#ring-${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${Math.max(c * v, 0.01)} ${c}`} />}
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[0.72rem] font-medium tabular-nums ${text}`}>{label}</span>
    </span>
  );
}

/** Ten-dot meter, like a rating. */
export function DotBar({ value, tone = "bg-amethyst" }: { value: number; tone?: string }) {
  const on = Math.round(Math.max(0, Math.min(1, value)) * 10);
  return (
    <span className="flex gap-1" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < on ? `${tone} shadow-[0_0_8px_rgba(110,63,134,0.45)]` : "bg-plum-800/10"}`} />
      ))}
    </span>
  );
}

/** Vertical gradient bars (e.g. sign-ups by weekday). */
export function Bars({ items }: { items: { label: string; n: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.n));
  const top = items.reduce((a, b) => (b.n > a.n ? b : a), items[0]);
  return (
    <div className="flex h-44 items-end gap-2 sm:gap-3" role="img" aria-label={`Busiest day: ${top.label}`}>
      {items.map((i) => {
        const best = i === top && i.n > 0;
        return (
          <div key={i.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className={`text-[0.72rem] tabular-nums ${best ? "rounded-full bg-plum-900 px-2 py-0.5 text-bone" : "text-plum-700"}`}>{i.n}</span>
            <span
              className={`w-full max-w-10 rounded-t-xl ${best ? "bg-[linear-gradient(180deg,#9b72b0,#6E3F86_55%,#3a1d45)] shadow-[0_10px_24px_-8px_rgba(110,63,134,0.8)]" : "bg-[linear-gradient(180deg,#cdb8dc,#9b72b0)] opacity-70"}`}
              style={{ height: `${Math.max(6, (i.n / max) * 100)}%` }}
            />
            <span className={`text-[0.7rem] uppercase tracking-[0.08em] ${best ? "font-medium text-plum-900" : "text-plum-700"}`}>{i.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Smooth area chart of daily counts. */
export function AreaChart({ days, compact = false }: { days: { label: string; full: string; n: number }[]; compact?: boolean }) {
  const W = compact ? 340 : 640;
  const H = compact ? 220 : 260;
  const fs = compact ? 12 : 11;
  const pad = { l: 26, r: 18, t: 30, b: 30 };
  const max = Math.max(4, ...days.map((d) => d.n));
  const step = (W - pad.l - pad.r) / Math.max(1, days.length - 1);
  const pts = days.map((d, i) => [pad.l + i * step, pad.t + (H - pad.t - pad.b) * (1 - d.n / max)] as const);
  const path = pts.reduce((acc, [x, y], i) => {
    if (i === 0) return `M${x},${y}`;
    const [px, py] = pts[i - 1];
    const cx = (px + x) / 2;
    return `${acc} C${cx},${py} ${cx},${y} ${x},${y}`;
  }, "");
  const area = `${path} L${pts[pts.length - 1][0]},${H - pad.b} L${pts[0][0]},${H - pad.b} Z`;
  const ticks = [0, Math.round(max / 2), max];
  const last = pts[pts.length - 1];
  const total = days.reduce((a, d) => a + d.n, 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`${total} sign-ups in the last ${days.length} days`}>
      <defs>
        <linearGradient id={`icb-line${compact ? "-c" : ""}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#9b72b0" />
          <stop offset="100%" stopColor="#6E3F86" />
        </linearGradient>
        <filter id={`icb-glow${compact ? "-c" : ""}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id={`icb-area${compact ? "-c" : ""}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#6E3F86" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#6E3F86" stopOpacity="0" />
        </linearGradient>
      </defs>
      {ticks.map((t) => {
        const y = pad.t + (H - pad.t - pad.b) * (1 - t / max);
        return (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#24132a" strokeOpacity="0.07" />
            <text x={pad.l - 10} y={y + 4} textAnchor="end" fontSize={fs} fill="#6b5d6e">{t}</text>
          </g>
        );
      })}
      <path d={area} fill={`url(#icb-area${compact ? "-c" : ""})`} />
      <path d={path} fill="none" stroke={`url(#icb-line${compact ? "-c" : ""})`} strokeWidth="3" strokeLinecap="round" filter={`url(#icb-glow${compact ? "-c" : ""})`} />
      {pts.map(([x, y], i) => (days[i].n > 0 && i < pts.length - 1 ? <circle key={i} cx={x} cy={y} r="4.5" fill="#F8F4EE" stroke="#9b72b0" strokeWidth="2.5" /> : null))}
      {days.map((d, i) =>
        compact || i % 2 === days.length % 2 || i === days.length - 1 ? (
          <text key={d.full} x={pts[i][0]} y={H - 8} textAnchor="middle" fontSize={fs} fill="#6b5d6e">{d.label}</text>
        ) : null,
      )}
      <circle cx={last[0]} cy={last[1]} r="7" fill="#F8F4EE" stroke="#6E3F86" strokeWidth="3" />
      <g transform={`translate(${Math.min(last[0], W - 60)},${Math.max(last[1] - 30, 14)})`}>
        <rect x="-34" y="-14" width="68" height="24" rx="12" fill="#24132a" />
        <text x="0" y="3" textAnchor="middle" fontSize={fs} fill="#F8F4EE">{days[days.length - 1].n} today</text>
      </g>
    </svg>
  );
}
