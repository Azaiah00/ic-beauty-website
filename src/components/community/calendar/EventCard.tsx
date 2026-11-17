/** One event on the calendar. The join link only renders for plans the policy module allows. */
import Link from "next/link";
import { ArrowRight, CalendarPlus, Clock, Download, Lock, MessagesSquare, PlayCircle, UserRound, Video } from "lucide-react";
import { Pill, PlanPill, btn, btnBrass, card, chip } from "@/components/community/ui";
import { PLAN_ORDER, TZ } from "@/lib/community/config";
import { googleCalendarUrl } from "@/lib/community/calendar";
import { can, reason } from "@/lib/community/permissions";
import type { CommunityEvent, Member, Settings } from "@/lib/community/types";

/** A time zone the browser sent us is only used if this server understands it. */
export function safeTz(tz: string | undefined) {
  if (!tz) return TZ;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return TZ;
  }
}
export const dayKey = (d: Date, tz: string) => d.toLocaleDateString("en-CA", { timeZone: tz });
export const length = (minutes: number) => (minutes >= 60 ? `${minutes % 60 ? (minutes / 60).toFixed(1) : minutes / 60} hour${minutes === 60 ? "" : "s"}` : `${minutes} min`);

export function EventCard({ e, when, actor, s, tz }: { e: CommunityEvent; when: Date | null; actor: Member; s: Settings; tz: string }) {
  const allowed = can(actor, "event.join", e);
  const everyone = PLAN_ORDER.every((p) => e.plans.includes(p));
  const details = `${e.description}${allowed && e.zoom && !e.async ? `\n\nJoin: ${e.zoom}` : ""}`;
  return (
    <article className={`${card} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {when && (
          <div className="flex shrink-0 items-center gap-3 sm:w-20 sm:flex-col sm:gap-0 sm:rounded-xl sm:bg-mist sm:py-3 sm:text-center" aria-hidden="true">
            <span className="eyebrow text-amethyst">{when.toLocaleDateString("en-US", { timeZone: tz, month: "short" })}</span>
            <span className="font-display text-[1.9rem] leading-none text-plum-900">{when.toLocaleDateString("en-US", { timeZone: tz, day: "numeric" })}</span>
            <span className="text-[0.8rem] text-plum-700">{when.toLocaleDateString("en-US", { timeZone: tz, weekday: "short" })}</span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {everyone ? <Pill>All members</Pill> : PLAN_ORDER.filter((p) => e.plans.includes(p)).map((p) => <PlanPill key={p} plan={p} name={s.plans[p].name} />)}
            {e.repeat && <Pill>{e.repeat === "weekly" ? "Every week" : "Every month"}</Pill>}
            {e.sample && <Pill tone="warn">Sample</Pill>}
          </div>
          <h3 className="mt-2 font-display text-[1.55rem] leading-tight text-plum-900">{when ? e.title : `${e.title} · details & registration`}</h3>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.9rem] text-plum-700">
            {when && (
              <li className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amethyst" aria-hidden="true" />
                <time dateTime={when.toISOString()}>{when.toLocaleString("en-US", { timeZone: tz, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" })}</time>
                {e.minutes > 0 && <span>· {length(e.minutes)}</span>}
              </li>
            )}
            <li className="flex items-center gap-1.5">
              <UserRound className="h-4 w-4 text-amethyst" aria-hidden="true" /> Hosted by {e.host}
            </li>
          </ul>
          <p className="mt-3 text-plum-800">{e.description}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {!when && e.link ? (
              <Link href={e.link.href} className={btn}>{e.link.label} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            ) : !allowed ? (
              <div className="flex w-full flex-col gap-3 rounded-xl border border-brass/40 bg-bone p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-2.5 text-plum-900">
                  <Lock className="mt-1 h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" />
                  {reason(actor, "event.join", e)}
                </p>
                <Link href="/community/upgrade" className={`${btnBrass} shrink-0`}>See plans</Link>
              </div>
            ) : e.async ? (
              e.link && <Link href={e.link.href} className={btn}><MessagesSquare className="h-4 w-4" aria-hidden="true" /> {e.link.label}</Link>
            ) : e.zoom ? (
              <a href={e.zoom} target="_blank" rel="noopener noreferrer" className={btn}>
                <Video className="h-4 w-4" aria-hidden="true" /> Join the call<span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <p className="text-[0.9rem] text-plum-700">The join link appears here before the call.</p>
            )}
            {when && (
              <>
                <a href={googleCalendarUrl(e, when, details)} target="_blank" rel="noopener noreferrer" className={chip}>
                  <CalendarPlus className="h-4 w-4" aria-hidden="true" /> Add to Google Calendar<span className="sr-only"> (opens in a new tab)</span>
                </a>
                <a href={`/api/community/ics?id=${encodeURIComponent(e.id)}`} className={chip}>
                  <Download className="h-4 w-4" aria-hidden="true" /> Calendar file (.ics)
                </a>
              </>
            )}
            {allowed && e.replay && (
              <Link href={e.replay} className={chip}><PlayCircle className="h-4 w-4" aria-hidden="true" /> Replays</Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
