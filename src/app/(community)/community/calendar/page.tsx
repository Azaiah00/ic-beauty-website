import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EventCard, dayKey, safeTz } from "@/components/community/calendar/EventCard";
import { TimeZoneSync } from "@/components/community/calendar/TimeZoneSync";
import { Empty, PageHead, card, chip, chipOn } from "@/components/community/ui";
import { occurrences } from "@/lib/community/calendar";
import { getSettings } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Calendar" };
export const dynamic = "force-dynamic";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const pad = (n: number) => String(n).padStart(2, "0");

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ view?: string; month?: string }> }) {
  const actor = await requireMember();
  const { view, month: rawMonth } = await searchParams;
  const [s, events] = await Promise.all([getSettings(), db.events()]);
  const now = new Date();
  const tz = safeTz(actor.timeZone);
  const monthView = view === "month";
  const undated = events.filter((e) => !e.start);

  // List: everything in the next 6 weeks.
  const upcoming = events
    .flatMap((e) => occurrences(e, now, 12, new Date(+now + 42 * 864e5)).map((d) => ({ e, d })))
    .sort((a, b) => +a.d - +b.d);

  // Month grid.
  const today = dayKey(now, tz);
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth ?? "") ? rawMonth! : today.slice(0, 7);
  const [y, mo] = month.split("-").map(Number);
  const startUtc = Date.UTC(y, mo - 1, 1);
  const daysIn = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  const lead = new Date(startUtc).getUTCDay();
  const inMonth = events
    .flatMap((e) => occurrences(e, new Date(startUtc - 864e5 + 2 * 36e5), 80, new Date(Date.UTC(y, mo, 1) + 864e5)).map((d) => ({ e, d })))
    .filter((x) => dayKey(x.d, tz).startsWith(month))
    .sort((a, b) => +a.d - +b.d);
  const byDay = new Map<string, typeof inMonth>();
  for (const x of inMonth) byDay.set(dayKey(x.d, tz), [...(byDay.get(dayKey(x.d, tz)) ?? []), x]);
  const shift = (n: number) => {
    const d = new Date(Date.UTC(y, mo - 1 + n, 1));
    return `/community/calendar?view=month&month=${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
  };
  const monthName = new Date(startUtc).toLocaleDateString("en-US", { timeZone: "UTC", month: "long", year: "numeric" });
  const shown = monthView ? inMonth : upcoming;

  return (
    <div className="mx-auto max-w-4xl">
      <TimeZoneSync saved={actor.timeZone} />
      <PageHead icon="calendar" eyebrow="Calendar" title="What's coming up" lede={<>Times are shown in your time zone ({tz.replace(/_/g, " ")}). <Link href="/community/settings" className="text-amethyst underline underline-offset-2">Change it</Link></>}>
        <Link href="/community/calendar" aria-current={!monthView ? "page" : undefined} className={!monthView ? chipOn : chip}>List</Link>
        <Link href="/community/calendar?view=month" aria-current={monthView ? "page" : undefined} className={monthView ? chipOn : chip}>Month</Link>
      </PageHead>

      {monthView && (
        <section className={`${card} mb-6 p-3 sm:p-5`} aria-label={monthName}>
          <div className="mb-3 flex items-center justify-between gap-2">
            <Link href={shift(-1)} aria-label="Previous month" className="flex h-11 w-11 items-center justify-center rounded-full text-plum-800 hover:bg-mist"><ChevronLeft className="h-5 w-5" aria-hidden="true" /></Link>
            <h2 className="font-display text-[1.5rem] text-plum-900">{monthName}</h2>
            <Link href={shift(1)} aria-label="Next month" className="flex h-11 w-11 items-center justify-center rounded-full text-plum-800 hover:bg-mist"><ChevronRight className="h-5 w-5" aria-hidden="true" /></Link>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] uppercase tracking-[0.1em] text-plum-700" aria-hidden="true">
            {WEEKDAYS.map((w) => <span key={w}>{w}</span>)}
          </div>
          <ol className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: lead }, (_, i) => <li key={`b${i}`} aria-hidden="true" />)}
            {Array.from({ length: daysIn }, (_, i) => {
              const key = `${month}-${pad(i + 1)}`;
              const items = byDay.get(key) ?? [];
              return (
                <li key={key} className={`min-h-14 rounded-lg p-1 sm:min-h-24 sm:p-1.5 ${key === today ? "bg-lilac/40 ring-1 ring-amethyst" : "bg-mist/60"}`}>
                  <span className={`block text-[0.8rem] tabular-nums ${key === today ? "font-medium text-plum-900" : "text-plum-700"}`}>
                    {i + 1}
                    {key === today && <span className="sr-only"> (today)</span>}
                  </span>
                  {items.map(({ e, d }) => (
                    <a key={e.id + +d} href={`#e-${e.id}-${+d}`} className="mt-1 block rounded bg-plum-900 px-1 py-0.5 text-left text-[0.68rem] leading-tight text-bone hover:bg-amethyst">
                      <span className="hidden truncate sm:block">{e.title}</span>
                      <span className="block h-1.5 sm:hidden" />
                      <span className="sr-only sm:hidden">{e.title}</span>
                    </a>
                  ))}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {shown.length === 0 && undated.length === 0 ? (
        <Empty title="Nothing on the calendar yet">Iisha adds Lives and coaching calls here. Check back soon.</Empty>
      ) : (
        <div className="space-y-4">
          {shown.length === 0 && <p className={`${card} p-5 text-plum-700`}>{monthView ? "No events this month. Try the next one." : "Nothing in the next six weeks yet."}</p>}
          {shown.map(({ e, d }) => (
            <div key={e.id + +d} id={`e-${e.id}-${+d}`} className="scroll-mt-36">
              <EventCard e={e} when={d} actor={actor} s={s} tz={tz} />
            </div>
          ))}
          {undated.map((e) => <EventCard key={e.id} e={e} when={null} actor={actor} s={s} tz={tz} />)}
        </div>
      )}
      {shown.some((x) => x.e.sample) && <p className="mt-5 text-[0.84rem] text-plum-700">Dates marked “Sample” are placeholders for the demo. Real dates come from Iisha.</p>}
    </div>
  );
}
