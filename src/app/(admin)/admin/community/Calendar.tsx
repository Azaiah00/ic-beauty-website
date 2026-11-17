/** Calendar (6.5): add and edit events. Times are typed in Eastern; members see them in their own time zone. */
import { occurrences } from "@/lib/community/calendar";
import { PLAN_ORDER, TZ } from "@/lib/community/config";
import type { CommunityEvent, Member } from "@/lib/community/types";
import { db } from "@/lib/server/community/store";
import { Act, EmptyNote, StatePill, Tip, box, btn, btnGhost, btnRed, card, check, field, h2, lbl, panel, sum, sumRed } from "./shared";

const easternDate = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { timeZone: TZ });
const easternTime = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const nice = (d: Date) => d.toLocaleString("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });

export async function CommunityCalendar(_: { actor: Member }) {
  const now = new Date();
  const [events, s] = await Promise.all([db.events(), db.settings()]);
  const back = "/admin?view=community-calendar";
  const next = (e: CommunityEvent) => occurrences(e, now, 1)[0];
  const sorted = [...events].sort((a, b) => (+(next(a) ?? Infinity)) - (+(next(b) ?? Infinity)));

  const Form = ({ e }: { e?: CommunityEvent }) => {
    // The masterclass card has no date on purpose (Iisha's request): its form has no date or time at all.
    const dateless = !!e && !e.start && !!e.link;
    const plans = e?.plans ?? PLAN_ORDER;
    return (
      <Act action="event.save" back={e ? `${back}#event-${e.id}` : back} className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
        {e && <input type="hidden" name="id" value={e.id} />}
        <label className={lbl}>Event name<input name="title" defaultValue={e?.title} required className={field} /></label>
        <label className={lbl}>Host<input name="host" defaultValue={e?.host ?? "Iisha C. Silver"} className={field} /></label>
        {dateless ? (
          <p className="rounded-xl bg-white p-3 text-[0.9rem] text-plum-900 sm:col-span-2">This card shows no date or time on purpose. It sends people to the registration page, which carries the details.</p>
        ) : (
          <>
            <label className={lbl}>Date<input type="date" name="date" defaultValue={e?.start ? easternDate(e.start) : ""} required className={field} /></label>
            <label className={lbl}>Start time (Eastern)<input type="time" name="time" defaultValue={e?.start ? easternTime(e.start) : "19:00"} required className={field} /></label>
            <label className={lbl}>Length in minutes<input type="number" name="minutes" min={0} max={600} defaultValue={e?.minutes ?? 60} className={field} /></label>
            <label className={lbl}>
              Repeats
              <select name="repeat" defaultValue={e?.repeat ?? ""} className={field}>
                <option value="">Just once</option>
                <option value="weekly">Every week, same day and time</option>
                <option value="monthly">Every 4 weeks, same day and time</option>
              </select>
            </label>
          </>
        )}
        <fieldset className="sm:col-span-2">
          <legend className={lbl}>Who is it for? (only these plans see the join link)</legend>
          <div className="flex flex-wrap gap-x-6">
            {PLAN_ORDER.map((p) => (
              <label key={p} className={check}><input type="checkbox" name="plans" value={p} defaultChecked={plans.includes(p)} className={box} /> {s.plans[p].name}</label>
            ))}
          </div>
        </fieldset>
        <label className={lbl}>Zoom link<input type="url" name="zoom" defaultValue={e?.zoom} placeholder="https://zoom.us/j/…" className={field} /></label>
        <label className={lbl}>Replay link (add after the call)<input name="replay" defaultValue={e?.replay} placeholder="/community/classroom/…" className={field} /></label>
        <label className={`${lbl} sm:col-span-2`}>Description<textarea name="description" defaultValue={e?.description} rows={2} className={field} /></label>
        <div className="sm:col-span-2"><button className={btn}>{e ? "Save event" : "Add to the calendar"}</button></div>
      </Act>
    );
  };

  return (
    <>
      <Tip>Your calendar. Add Lives, Q&amp;As and coaching calls here. Type times in Eastern; each member sees them in their own time zone.</Tip>

      <section id="new" className={`${card} mt-5 scroll-mt-28 p-4 sm:p-5`} aria-labelledby="new-h">
        <h2 id="new-h" className={h2}>Add an event</h2>
        <div className="mt-3"><Form /></div>
      </section>

      <h2 className={`${h2} mt-8`}>On the calendar</h2>
      {sorted.length === 0 ? (
        <EmptyNote>Nothing on the calendar yet. Add your first event above: a name, a date and a time are all you need.</EmptyNote>
      ) : (
        <ul className="mt-3 space-y-3">
          {sorted.map((e) => {
            const d = next(e);
            return (
              <li key={e.id} id={`event-${e.id}`} className={`scroll-mt-28 ${card} p-4 sm:p-5`}>
                <p className="flex flex-wrap items-center gap-1.5">
                  {e.sample && <StatePill tone="warn">Sample</StatePill>}
                  {e.repeat && <StatePill>{e.repeat === "weekly" ? "Every week" : "Every 4 weeks"}</StatePill>}
                  {e.async && <StatePill>Thread, not a call</StatePill>}
                  {e.plans.map((p) => <StatePill key={p} tone="good">{s.plans[p].name}</StatePill>)}
                </p>
                <p className="mt-1.5 text-[1.05rem] font-medium text-plum-900">{e.title}</p>
                <p className="text-[0.88rem] text-plum-700">{!e.start ? "No date shown, on purpose. Links to the registration page." : d ? `Next: ${nice(d)} Eastern` : `Was ${nice(new Date(e.start))} Eastern`}{e.start && e.minutes ? ` · ${e.minutes} minutes` : ""}</p>
                <div className="mt-3 flex flex-wrap items-start gap-2">
                  <details className="open:w-full">
                    <summary className={sum}>Edit</summary>
                    <div className={panel}><Form e={e} /></div>
                  </details>
                  <Act action="event.email" back={`${back}#event-${e.id}`}>
                    <input type="hidden" name="id" value={e.id} />
                    <button className={btnGhost} title="Demo: nothing is sent yet, it is only written to the activity log">Email members about this</button>
                  </Act>
                  <details className="open:w-full">
                    <summary className={sumRed}>Remove</summary>
                    <Act action="event.delete" back={back} className={panel}>
                      <input type="hidden" name="id" value={e.id} />
                      <p className="text-[0.92rem] text-plum-900">This takes “{e.title}” off the calendar for everyone{e.repeat ? ", including every repeat" : ""}. You can undo it for 24 hours.</p>
                      <button className={`${btnRed} mt-3`}>Yes, remove this event</button>
                    </Act>
                  </details>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
