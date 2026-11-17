/**
 * Shared, server-safe building blocks for every community screen (no client JS in this file).
 * Brand tokens only. Big targets (44px+), plain words, one primary action per card.
 */
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { EDUCATION_NOTE, initials, levelFor } from "@/lib/community/config";
import type { Member, PlanKey } from "@/lib/community/types";
import { Needs } from "@/components/ui/Needs";

export const card = "rounded-card border border-plum-800/10 bg-paper";
export const btn = "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-linear-to-b from-plum-800 to-plum-950 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-bone transition hover:from-amethyst hover:to-plum-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-2px_0_rgba(0,0,0,0.22),0_10px_22px_-12px_rgba(36,19,42,0.75)] ring-1 ring-inset ring-brass-soft/30 active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50";
export const btnBrass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-linear-to-b from-amethyst to-plum-800 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-bone transition hover:from-plum-800 hover:to-plum-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-2px_0_rgba(0,0,0,0.22),0_10px_22px_-12px_rgba(36,19,42,0.75)] ring-1 ring-inset ring-brass-soft/30 active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2)] disabled:cursor-not-allowed disabled:opacity-50";
export const btnGhost = "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-plum-900/25 bg-linear-to-b from-white to-bone px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_6px_14px_-10px_rgba(36,19,42,0.5)] transition hover:border-plum-900 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50";
export const chip = "inline-flex min-h-11 items-center gap-2 rounded-pill border border-plum-800/15 bg-white px-4 text-[0.88rem] text-plum-900 transition hover:border-amethyst hover:text-amethyst";
export const chipOn = "inline-flex min-h-11 items-center gap-2 rounded-pill border border-plum-900 bg-plum-900 px-4 text-[0.88rem] text-bone";
export const input = "block min-h-11 w-full rounded-xl border border-plum-800/20 bg-white px-3.5 py-2 text-[1rem] text-ink outline-none focus:border-amethyst focus:ring-2 focus:ring-amethyst/20";
export const label = "block text-[0.74rem] font-medium uppercase tracking-[0.14em] text-plum-800";

export type IconName = "calendar" | "check" | "circle" | "classroom" | "comb" | "community" | "crown" | "gift" | "heart" | "inbox" | "journey" | "key" | "labs" | "leaderboards" | "lock" | "megaphone" | "members" | "messages" | "question" | "seedling" | "sparkle" | "waterdrop";

/**
 * A 3D icon from the I.C. Beauty set (amethyst glass and brass, generated with scripts/generate-icons.mjs).
 * Decorative: the words next to it carry the meaning, so it is hidden from screen readers.
 */
export function Icon3D({ name, size = 40, className = "" }: { name: IconName; size?: number; className?: string }) {
  return <Image src={`/images/icons/${name}.webp`} alt="" aria-hidden="true" width={size} height={size} unoptimized className={`shrink-0 select-none drop-shadow-[0_6px_8px_rgba(36,19,42,0.22)] ${className}`} style={{ width: size, height: size }} />;
}

const TONES = ["bg-plum-900 text-bone", "bg-amethyst text-bone", "bg-brass-soft text-plum-900", "bg-lilac text-plum-900", "bg-plum-800 text-bone", "bg-sage text-bone"];
function tone(seed: string) {
  let h = 0;
  for (const c of seed) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return TONES[h % TONES.length];
}

type AvatarMember = Pick<Member, "id" | "name" | "points" | "role"> & { photo?: string };

/** Initials on a brand-color circle (never an AI face), with the level badge on the corner. */
export function MemberAvatar({ m, size = 44, level = true }: { m: AvatarMember; size?: number; level?: boolean }) {
  const lv = levelFor(m.points).level;
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      {m.photo ? (
        <span className="relative block h-full w-full overflow-hidden rounded-full bg-sand">
          <Image src={m.photo} alt="" fill sizes={`${size}px`} className="object-cover" style={{ objectPosition: "70% 20%" }} unoptimized={m.photo.startsWith("/api/")} />
        </span>
      ) : (
        <span aria-hidden="true" className={`flex h-full w-full items-center justify-center rounded-full font-medium tracking-wide ${tone(m.id)}`} style={{ fontSize: size * 0.36 }}>
          {initials(m.name)}
        </span>
      )}
      {level && m.role === "member" && (
        <span className="absolute -bottom-1 -right-1 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full bg-brass px-1 text-[0.62rem] font-semibold leading-none text-plum-950 ring-2 ring-paper" title={`Level ${lv}`}>
          <span className="sr-only">Level </span>
          {lv}
        </span>
      )}
    </span>
  );
}

const PILL: Record<PlanKey, string> = {
  free: "bg-mist text-plum-800",
  circle: "bg-lilac/50 text-plum-900",
  inner: "bg-brass-soft/60 text-plum-950",
};
export function PlanPill({ plan, name }: { plan: PlanKey; name: string }) {
  return <span className={`inline-flex items-center rounded-pill px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.1em] ${PILL[plan]}`}>{name.replace(" Member", "")}</span>;
}

export function Pill({ children, tone: t = "plain" }: { children: React.ReactNode; tone?: "plain" | "brass" | "good" | "warn" | "dark" }) {
  const cls = { plain: "bg-mist text-plum-800", brass: "bg-brass-soft/60 text-plum-950", good: "bg-sage/20 text-plum-950", warn: "bg-sand text-plum-950 ring-1 ring-brass-deep/40", dark: "bg-plum-900 text-bone" }[t];
  return <span className={`inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.1em] ${cls}`}>{children}</span>;
}

/** A confirmed price, or the visible "needs client confirmation" marker. Never an invented number. */
export function Price({ value, needs = "Price", suffix }: { value: string | undefined; needs?: string; suffix?: string }) {
  return value ? (
    <span>
      {value}
      {suffix}
    </span>
  ) : (
    <Needs>{needs}</Needs>
  );
}

export function MemberName({ m }: { m: Pick<Member, "name" | "nameNeeds"> }) {
  return (
    <>
      {m.name}
      {m.nameNeeds && (
        <>
          {" "}
          <Needs>{m.nameNeeds}</Needs>
        </>
      )}
    </>
  );
}

/** A locked door that still feels like an invitation. */
export function LockNote({ children, href = "/community/upgrade", cta = "See plans" }: { children: React.ReactNode; href?: string; cta?: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-card border border-brass/40 bg-bone p-5 sm:flex-row sm:items-center sm:justify-between">
      <p className="flex items-center gap-3 text-plum-900">
        <Icon3D name="lock" size={44} />
        <span>{children}</span>
      </p>
      <Link href={href} className={`${btnBrass} shrink-0`}>
        {cta}
      </Link>
    </div>
  );
}

export function EducationNote({ className = "" }: { className?: string }) {
  return (
    <p className={`flex gap-3 border-l-2 border-brass py-1 pl-4 text-[0.86rem] leading-relaxed text-plum-700 ${className}`}>
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" strokeWidth={1.5} />
      <span>{EDUCATION_NOTE}</span>
    </p>
  );
}

export function PageHead({ eyebrow, title, lede, children, icon }: { eyebrow?: string; title: React.ReactNode; lede?: React.ReactNode; children?: React.ReactNode; icon?: IconName }) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
      {icon && <Icon3D name={icon} size={64} className="-mb-1 hidden sm:block" />}
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="eyebrow text-amethyst">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-[2.1rem] leading-tight text-plum-900 sm:text-[2.5rem]">{title}</h1>
        {lede && <p className="mt-1 max-w-2xl text-plum-700">{lede}</p>}
      </div>
      {children && <div className="flex shrink-0 flex-wrap gap-2">{children}</div>}
    </header>
  );
}

/** An empty state that teaches, in Iisha's voice. */
export function Empty({ title, children, icon = "sparkle" }: { title: string; children?: React.ReactNode; icon?: IconName }) {
  return (
    <div className={`${card} p-8 text-center`}>
      <Icon3D name={icon} size={64} className="mx-auto mb-3" />
      <p className="font-display text-[1.5rem] text-plum-900">{title}</p>
      {children && <div className="mx-auto mt-2 max-w-md text-plum-700">{children}</div>}
    </div>
  );
}

export function timeAgo(iso: string, now = new Date()) {
  const s = Math.max(0, (+now - +new Date(iso)) / 1000);
  if (s < 90) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.round(s / 86400)} d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" });
}

/* ───────────── Safe rich text: **bold**, *italic*, "- " lists, [links](https://…), bare links. No raw HTML. ───────────── */
const INLINE = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\((?:https?:\/\/|\/)[^\s)]+\)|https?:\/\/[^\s<]+[^\s<.,;:!?)])/g;
function inline(text: string, key: string): React.ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    const k = `${key}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={k}>{part.slice(1, -1)}</em>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    const href = link ? link[2] : /^https?:\/\//.test(part) ? part : "";
    if (href) {
      const ext = /^https?:\/\//.test(href);
      return (
        <a key={k} href={href} {...(ext ? { target: "_blank", rel: "noopener noreferrer nofollow" } : {})} className="text-amethyst underline underline-offset-2 hover:text-plum-900">
          {link ? link[1] : part}
        </a>
      );
    }
    return part;
  });
}
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks: React.ReactNode[] = [];
  let items: string[] = [];
  const flush = () => {
    if (!items.length) return;
    const k = `ul-${blocks.length}`;
    blocks.push(
      <ul key={k} className="list-disc space-y-1 pl-5">
        {items.map((it, i) => (
          <li key={i}>{inline(it, `${k}-${i}`)}</li>
        ))}
      </ul>,
    );
    items = [];
  };
  for (const line of text.split("\n")) {
    const li = /^\s*[-•]\s+(.*)$/.exec(line);
    if (li) items.push(li[1]);
    else {
      flush();
      if (line.trim()) blocks.push(<p key={`p-${blocks.length}`}>{inline(line, `p-${blocks.length}`)}</p>);
    }
  }
  flush();
  return <div className={`space-y-3 break-words ${className}`}>{blocks}</div>;
}
