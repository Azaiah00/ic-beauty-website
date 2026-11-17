/**
 * Shared pieces for the owner dashboard's Community section. Everything here is server-rendered: each button
 * is a plain form posting to /api/community/<action> as the team member using the dashboard (_as=dashboard).
 */
import { AlertTriangle, CheckCircle2, HelpCircle, UserRound } from "lucide-react";
import { MemberAvatar, MemberName } from "@/components/community/ui";
import { TZ } from "@/lib/community/config";
import type { Member } from "@/lib/community/types";
import { shortName } from "@/lib/server/community/core";

export const card = "rounded-[1.4rem] bg-white shadow-[0_1px_2px_rgba(36,19,42,0.05),0_18px_40px_-28px_rgba(36,19,42,0.35)]";
const base = "inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-[0.74rem] font-medium uppercase tracking-[0.12em] transition disabled:cursor-not-allowed disabled:opacity-45";
export const btn = `${base} bg-linear-to-b from-plum-800 to-plum-950 text-bone hover:from-amethyst hover:to-plum-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-2px_0_rgba(0,0,0,0.22),0_10px_22px_-12px_rgba(36,19,42,0.75)] ring-1 ring-inset ring-brass-soft/30 active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2)]`;
export const btnGhost = `${base} border border-plum-800/20 bg-white text-plum-900 hover:border-amethyst hover:text-amethyst`;
export const btnRed = `${base} bg-[#8a3a26] text-white hover:bg-[#6f2d1d]`;
/** A <summary> that looks like a button. */
export const sum = `${btnGhost} cursor-pointer list-none [&::-webkit-details-marker]:hidden`;
export const sumRed = `${base} cursor-pointer list-none border border-[#b4533c]/50 bg-white text-[#8a3a26] hover:bg-[#f8e6e1] [&::-webkit-details-marker]:hidden`;
export const lbl = "block text-[0.72rem] font-medium uppercase tracking-[0.14em] text-plum-700";
export const field = "mt-1.5 block min-h-11 w-full rounded-xl border border-plum-800/15 bg-white px-3 py-2 text-[0.95rem] normal-case tracking-normal text-ink focus:border-amethyst focus:outline-none";
export const check = "flex min-h-11 items-center gap-3 text-[0.95rem] text-plum-900";
export const box = "h-5 w-5 shrink-0 accent-[#6e3f86]";
export const panel = "mt-3 rounded-2xl bg-bone/70 p-4";
export const h2 = "font-display text-[1.45rem] leading-tight text-plum-900";

export const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).replace(" AM", " am").replace(" PM", " pm");
export const day = (iso: string) => new Date(iso).toLocaleDateString("en-US", { timeZone: TZ, month: "short", day: "numeric", year: "numeric" });

/** One change = one plain form. Works without JavaScript; the API redirects back with a message and an Undo. */
export function Act({ action, back, children, className, target, id }: { action: string; back: string; children: React.ReactNode; className?: string; target?: string; id?: string }) {
  return (
    <form method="post" action={`/api/community/${action}`} className={className} target={target} id={id}>
      <input type="hidden" name="_as" value="dashboard" />
      <input type="hidden" name="back" value={back} />
      {children}
    </form>
  );
}

export function Hidden({ values }: { values: Record<string, string> }) {
  return (
    <>
      {Object.entries(values).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}
    </>
  );
}

/** The one-line "What is this?" at the top of every section. */
export function Tip({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-5 flex items-start gap-2.5 rounded-2xl bg-white/70 px-4 py-3 text-[0.9rem] text-plum-800">
      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
      <span>
        <strong className="font-medium text-plum-900">What is this? </strong>
        {children}
      </span>
    </p>
  );
}

/** What just happened, in plain English, with Undo right there. */
export function Banner({ msg, err, undo, back }: { msg?: string; err?: string; undo?: string; back: string }) {
  if (!msg && !err) return null;
  return err ? (
    <p role="alert" aria-live="assertive" className="mt-5 flex items-start gap-2 rounded-2xl bg-[#f8e6e1] px-4 py-3 text-[0.92rem] text-[#8a3a26]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {err}
    </p>
  ) : (
    <div role="status" aria-live="polite" className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl bg-[#e3efe8] px-4 py-3 text-[0.92rem] text-[#24603f]">
      <p className="flex min-w-0 flex-1 items-start gap-2">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        {msg}
      </p>
      {undo && (
        <Act action="audit.undo" back={back}>
          <input type="hidden" name="id" value={undo} />
          <button className={`${btn} !min-h-10`}>Undo</button>
        </Act>
      )}
    </div>
  );
}

/**
 * "Who's using the dashboard": the dashboard has one shared password, so this choice is what puts the
 * right name on every change in the activity log.
 * // TODO: individual team logins with roles when Auth goes live
 */
export function WhoChooser({ team, back, current }: { team: Member[]; back: string; current?: string }) {
  return (
    <ul className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
      {team.map((m) => (
        <li key={m.id}>
          <Act action="who" back={back}>
            <input type="hidden" name="id" value={m.id} />
            <button className={`flex min-h-[4.5rem] w-full items-center gap-4 rounded-2xl border px-4 text-left transition hover:border-amethyst ${current === m.id ? "border-amethyst bg-mist" : "border-plum-800/15 bg-white"}`}>
              <MemberAvatar m={m} level={false} />
              <span className="min-w-0 flex-1">
                <span className="block font-medium text-plum-900">
                  <MemberName m={m} />
                </span>
                <span className="block text-[0.84rem] text-plum-700">{m.role === "owner" ? "Owner: can do everything" : "Admin: everything except choosing the team"}</span>
              </span>
              {current === m.id && <span className="text-[0.72rem] font-medium uppercase tracking-[0.1em] text-amethyst">You</span>}
            </button>
          </Act>
        </li>
      ))}
    </ul>
  );
}

export function WhoBar({ actor, team, back }: { actor: Member; team: Member[]; back: string }) {
  return (
    <details className="mt-4 rounded-2xl bg-white/70 px-4 py-2 text-[0.9rem] text-plum-800">
      <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 [&::-webkit-details-marker]:hidden">
        <UserRound className="h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
        <span>
          Using the dashboard as <strong className="font-medium text-plum-900">{shortName(actor)}</strong>
        </span>
        <span className="font-medium text-amethyst underline underline-offset-2">Switch</span>
      </summary>
      <div className="pb-3 pt-2">
        <p className="mb-3 text-plum-700">Choose who is using the dashboard right now, so every change shows the right name in the activity log.</p>
        <WhoChooser team={team} back={back} current={actor.id} />
      </div>
    </details>
  );
}

export function StatePill({ children, tone = "plain" }: { children: React.ReactNode; tone?: "plain" | "good" | "warn" | "bad" | "new" }) {
  const cls = { plain: "bg-plum-800/10 text-plum-800", good: "bg-[#e3efe8] text-[#24603f]", warn: "bg-brass-soft/40 text-plum-900", bad: "bg-[#f8e6e1] text-[#8a3a26]", new: "bg-amethyst text-bone" }[tone];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.68rem] font-medium uppercase tracking-[0.1em] ${cls}`}>{children}</span>;
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return <p className={`${card} mt-3 p-6 text-plum-700`}>{children}</p>;
}
