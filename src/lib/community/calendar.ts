/** Calendar helpers: recurring events are generated from a rule, never stored one by one. */
import type { CommunityEvent } from "./types";

/** Start times of an event from `from` onward (a call that began in the last 2 hours still counts). */
export function occurrences(e: CommunityEvent, from: Date, count: number, until?: Date): Date[] {
  if (!e.start) return [];
  const out: Date[] = [];
  const first = new Date(e.start);
  const floor = +from - 2 * 36e5;
  // "Monthly" repeats every 4 weeks, so it always lands on the same weekday and time.
  const step = e.repeat === "weekly" ? 7 : e.repeat === "monthly" ? 28 : 0;
  for (let i = 0; out.length < count && i < 400; i++) {
    const d = new Date(+first + i * step * 864e5);
    if (until && +d > +until) break;
    if (+d >= floor) out.push(d);
    if (!step) break;
  }
  return out;
}

export function googleCalendarUrl(e: CommunityEvent, start: Date, details: string) {
  const f = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const end = new Date(+start + (e.minutes || 30) * 6e4);
  return `https://calendar.google.com/calendar/render?${new URLSearchParams({ action: "TEMPLATE", text: e.title, dates: `${f(start)}/${f(end)}`, details })}`;
}
