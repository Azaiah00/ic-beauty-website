/** Classroom (6.4): who can see each course, publishing, order, and the lessons inside. */
import { ArrowDown, ArrowUp } from "lucide-react";
import { Needs } from "@/components/ui/Needs";
import { ACCESS_CHOICES, accessChip, accessChoice, flatLessons, hydrate } from "@/lib/community/courses";
import type { Lesson, Member } from "@/lib/community/types";
import { db } from "@/lib/server/community/store";
import { Act, StatePill, Tip, box, btn, btnGhost, card, check, field, h2, lbl, panel, sum } from "./shared";

const ACCESS_LABELS: Record<string, string> = {
  open: "Everyone can see it",
  level: "Free after reaching Level __ (set the level below)",
  circle: "Circle members",
  inner: "Inner Circle members",
  buy: "Sell it for $__ (set the price below)",
  drip: "New lesson every __ days (set the days below)",
  private: "Hidden (only team)",
};

export async function CommunityClassroom(_: { actor: Member }) {
  const [courses, s, allProgress] = await Promise.all([db.courses(), db.settings(), db.allProgress()]);
  const back = "/admin?view=community-classroom";
  const finished = (key: string) => allProgress.filter((p) => p.lessons[key]?.doneAt).length;

  const LessonForm = ({ courseId, l, sourced }: { courseId: string; l?: Lesson; sourced: boolean }) => (
    <Act action="lesson.save" back={`${back}#course-${courseId}`} className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
      <input type="hidden" name="course" value={courseId} />
      <input type="hidden" name="lesson" value={l?.id ?? ""} />
      <label className={lbl}>Lesson title<input name="title" defaultValue={l?.title} required className={field} /></label>
      <label className={lbl}>Video link (YouTube or Vimeo)<input name="video" type="url" defaultValue={l?.video} placeholder="https://youtu.be/…" className={field} /></label>
      <label className={`${lbl} sm:col-span-2`}>Summary<textarea name="summary" defaultValue={l?.summary} rows={2} className={field} /></label>
      <label className={lbl}>Takeaways (one per line)<textarea name="takeaways" defaultValue={l?.takeaways.join("\n")} rows={3} className={field} /></label>
      <label className={lbl}>Downloads (one per line: Title | /downloads/file.pdf)<textarea name="downloads" defaultValue={l?.downloads.map((d) => (d.file ? `${d.title} | ${d.file}` : d.title)).join("\n")} rows={3} className={field} /></label>
      <label className={lbl}>Action step<input name="action" defaultValue={l?.action} className={field} /></label>
      <label className={lbl}>Reflection question<input name="reflection" defaultValue={l?.reflection} className={field} /></label>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <button className={btn}>{l ? "Save lesson" : "Add lesson"}</button>
        {l && !sourced && <button name="remove" value="1" className={btnGhost} title="Takes this lesson out of the course. You can undo it for 24 hours.">Remove lesson</button>}
      </div>
    </Act>
  );

  return (
    <>
      <Tip>Your courses. For each one, choose who can see it, then publish it. Locked courses still show to members as an invitation, never hidden.</Tip>
      <ul className="mt-5 space-y-4">
        {courses.map((raw, i) => {
          const c = hydrate(raw);
          const choice = accessChoice(c);
          const chip = accessChip(c, s);
          const priceKey = c.access.kind === "buy" ? c.access.priceKey : c.id;
          const included = c.access.kind === "buy" ? c.access.includedIn ?? [] : [];
          const lessons = flatLessons(c);
          const readOnly = c.source === "pilot-weeks";
          return (
            <li key={c.id} id={`course-${c.id}`} className={`scroll-mt-28 ${card} p-4 sm:p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className={h2}>{c.title} {c.titleNeeds && <Needs>{c.titleNeeds}</Needs>}</h2>
                  <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <StatePill tone={c.published ? "good" : "warn"}>{c.published ? "Published" : "Not published"}</StatePill>
                    <StatePill>{chip.text}</StatePill>
                    {chip.needs && <Needs>{chip.needs}</Needs>}
                    <span className="text-[0.84rem] text-plum-700">{lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {i > 0 && <Act action="course.save" back={back}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="move" value="up" /><button className={`${btnGhost} !px-4`} aria-label={`Move ${c.title} up`}><ArrowUp className="h-4 w-4" aria-hidden="true" /> Up</button></Act>}
                  {i < courses.length - 1 && <Act action="course.save" back={back}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="move" value="down" /><button className={`${btnGhost} !px-4`} aria-label={`Move ${c.title} down`}><ArrowDown className="h-4 w-4" aria-hidden="true" /> Down</button></Act>}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-start gap-2">
                <details className="open:w-full">
                  <summary className={sum}>Who can see it, name &amp; publish</summary>
                  <Act action="course.save" back={`${back}#course-${c.id}`} className={`${panel} grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2`}>
                    <input type="hidden" name="id" value={c.id} />
                    <input type="hidden" name="_publish" value="1" />
                    <label className={lbl}>Course name<input name="title" defaultValue={c.titleNeeds ? "" : c.title} placeholder={c.titleNeeds ? "Type the program's name" : undefined} required={!c.titleNeeds} className={field} /></label>
                    <label className={lbl}>One-line promise<input name="promise" defaultValue={c.promise} className={field} /></label>
                    <label className={`${lbl} sm:col-span-2`}>
                      Who can see this course?
                      <select name="access" defaultValue={choice} className={field}>
                        {ACCESS_CHOICES.map((a) => <option key={a.value} value={a.value}>{ACCESS_LABELS[a.value] ?? a.label}</option>)}
                      </select>
                    </label>
                    <label className={lbl}>Level needed (only for “Free after reaching Level”)<input type="number" name="level" min={2} max={9} defaultValue={c.access.kind === "level" ? c.access.level : 3} className={field} /></label>
                    <label className={lbl}>Days between lessons (only for “New lesson every”)<input type="number" name="everyDays" min={1} max={60} defaultValue={c.access.kind === "drip" ? c.access.everyDays : 7} className={field} /></label>
                    <label className={lbl}>
                      <span className="flex flex-wrap items-center gap-2">Price (only for “Sell it”) {!s.prices[priceKey] && <Needs>Price</Needs>}</span>
                      <input name="price" defaultValue={s.prices[priceKey] ?? ""} placeholder="$0.00" className={field} />
                    </label>
                    <label className={lbl}>
                      <span className="flex flex-wrap items-center gap-2">Inner Circle member price (optional) {choice === "buy" && !s.prices[`${priceKey}-member`] && <Needs>Member price</Needs>}</span>
                      <input name="memberPrice" defaultValue={s.prices[`${priceKey}-member`] ?? ""} placeholder="$0.00" className={field} />
                    </label>
                    <fieldset className="sm:col-span-2">
                      <legend className={lbl}>When it&apos;s for sale, include it free with these plans</legend>
                      <div className="flex flex-wrap gap-x-6">
                        <label className={check}><input type="checkbox" name="includedIn" value="circle" defaultChecked={included.includes("circle")} className={box} /> {s.plans.circle.name}</label>
                        <label className={check}><input type="checkbox" name="includedIn" value="inner" defaultChecked={included.includes("inner")} className={box} /> {s.plans.inner.name}</label>
                      </div>
                    </fieldset>
                    <label className={`${check} sm:col-span-2`}><input type="checkbox" name="published" defaultChecked={c.published} className={box} /> Published: members can see this course in the Classroom</label>
                    <div className="sm:col-span-2"><button className={btn}>Save course</button></div>
                  </Act>
                </details>

                <details className="open:w-full">
                  <summary className={sum}>Lessons ({lessons.length})</summary>
                  <div className={panel}>
                    {readOnly && <p className="mb-3 rounded-xl bg-white p-3 text-[0.9rem] text-plum-900">These four weeks are Iisha&apos;s own wording and are kept exactly as she wrote them. To change them, talk with Iisha and Couture House.</p>}
                    {c.source === "portal-lessons" && <p className="mb-3 text-[0.88rem] text-plum-700">These are the 12 weekly lessons. You can edit each one (add the video link when it&apos;s ready), but they can&apos;t be removed.</p>}
                    {lessons.length === 0 && <p className="mb-3 text-[0.9rem] text-plum-700">No lessons yet. Add the first one below: a title is enough to start, the video can come later.</p>}
                    <ul className="space-y-2">
                      {lessons.map((l) => {
                        const n = finished(`${c.id}/${l.id}`);
                        return (
                          <li key={l.id} className="rounded-xl bg-white p-3">
                            {readOnly ? (
                              <>
                                <p className="font-medium text-plum-900">{l.title}</p>
                                <p className="mt-1 text-[0.88rem] text-plum-700">{l.summary}</p>
                              </>
                            ) : (
                              <details>
                                <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 [&::-webkit-details-marker]:hidden">
                                  <span className="min-w-0 flex-1 font-medium text-plum-900">{l.title}</span>
                                  {!l.video && <Needs>Video from Iisha</Needs>}
                                  <span className="text-[0.82rem] text-plum-700">{n} {n === 1 ? "member" : "members"} finished</span>
                                  <span className="text-[0.74rem] font-medium uppercase tracking-[0.1em] text-amethyst">Edit</span>
                                </summary>
                                <div className="mt-3"><LessonForm courseId={c.id} l={l} sourced={!!c.source} /></div>
                              </details>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                    {!c.source && (
                      <details className="mt-3">
                        <summary className={sum}>Add a lesson</summary>
                        <div className="mt-3 rounded-xl bg-white p-3"><LessonForm courseId={c.id} sourced={false} /></div>
                      </details>
                    )}
                  </div>
                </details>
                <a href={`/community/classroom/${c.id}`} target="_blank" rel="noopener" className={btnGhost}>See it in the Classroom</a>
              </div>
            </li>
          );
        })}
      </ul>

      <Act action="course.save" back={back} className={`${card} mt-4 flex flex-wrap items-end gap-2 p-4 sm:p-5`}>
        <label className={`${lbl} min-w-0 flex-1`}>Add a course<input name="title" required placeholder="Name of the new course" className={field} /></label>
        <button className={btn}>Add course</button>
        <p className="w-full text-[0.84rem] text-plum-700">New courses start hidden, so you can add lessons first and publish when you&apos;re ready.</p>
      </Act>
    </>
  );
}
