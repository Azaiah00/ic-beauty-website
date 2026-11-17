/** Community settings (6.7): the basics, the rules, level names, weekly rituals, and the demo reset. */
import { DEMO, LEVEL_POINTS } from "@/lib/community/config";
import type { Member } from "@/lib/community/types";
import { db } from "@/lib/server/community/store";
import { Act, Tip, box, btn, btnGhost, btnRed, card, check, field, h2, lbl, panel, sumRed } from "./shared";

const COVERS: [string, string][] = [["funnel-community", "Women together"], ["classroom", "Classroom"], ["studio", "The studio"], ["consultation", "Consultation"], ["funnel-hero-woman", "Portrait"], ["iisha-portrait", "Iisha"]];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function CommunitySettings(_: { actor: Member }) {
  const s = await db.settings();
  const back = "/admin?view=community-settings";
  return (
    <>
      <Tip>How your community looks and behaves. Each box below saves on its own, so change one thing at a time.</Tip>

      <Act action="settings.save" back={`${back}#basics`} id="basics" className={`${card} mt-5 scroll-mt-28 p-4 sm:p-5`}>
        <input type="hidden" name="section" value="basics" />
        <h2 className={h2}>The basics</h2>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
          <label className={lbl}>Community name<input name="name" defaultValue={s.name} required className={field} /></label>
          <label className={lbl}>
            Cover photo
            <select name="cover" defaultValue={s.cover} className={field}>
              {COVERS.map(([k, t]) => <option key={k} value={k}>{t}</option>)}
            </select>
          </label>
          <label className={`${lbl} sm:col-span-2`}>One-line promise<input name="promise" defaultValue={s.promise} className={field} /></label>
          {s.questions.map((q, i) => (
            <label key={q.id} className={`${lbl} sm:col-span-2`}>Question {i + 1} people answer when they join<input name={`q-${q.id}`} defaultValue={q.label} className={field} /></label>
          ))}
          <label className={`${lbl} sm:col-span-2`}>Community guidelines (one per line)<textarea name="guidelines" defaultValue={s.guidelines} rows={5} className={field} /></label>
          <label className={`${lbl} sm:col-span-2`}>
            Welcome message from Iisha (sent automatically when someone is let in)
            <textarea name="welcomeMessage" defaultValue={s.welcomeMessage} rows={4} className={field} />
          </label>
          <p className="text-[0.82rem] text-plum-700 sm:col-span-2">Write {"{first}"} where the person&apos;s first name should go. Example: “Welcome, {"{first}"}” becomes “Welcome, Tasha”.</p>
        </div>
        <button className={`${btn} mt-4`}>Save the basics</button>
      </Act>

      <Act action="settings.save" back={`${back}#rules`} id="rules" className={`${card} mt-4 scroll-mt-28 p-4 sm:p-5`}>
        <input type="hidden" name="section" value="rules" />
        <h2 className={h2}>Joining &amp; points</h2>
        <div className="mt-2">
          <label className={check}><input type="checkbox" name="autoFree" defaultChecked={s.autoApprove.free} className={box} /> Let free members in right away (turn off to approve each one yourself)</label>
          <label className={check}><input type="checkbox" name="autoPaid" defaultChecked={s.autoApprove.paid} className={box} /> Let paying members in right away</label>
          <label className={check}><input type="checkbox" name="pointsLesson" defaultChecked={s.points.lesson} className={box} /> Give 2 points for each finished lesson</label>
          <label className={check}><input type="checkbox" name="pointsCheckin" defaultChecked={s.points.checkin} className={box} /> Give 1 point for each weekly check-in</label>
          <label className={check}><input type="checkbox" name="pointsLab" defaultChecked={s.points.lab} className={box} /> Give 2 points for each finished Lab</label>
          <label className={check}><input type="checkbox" name="digest" defaultChecked={s.digest} className={box} /> Send a weekly email digest to quiet members (demo: nothing is sent yet)</label>
        </div>
        <p className="mt-1 text-[0.82rem] text-plum-700">Every like a member receives is always worth 1 point. That one can&apos;t be turned off.</p>
        <button className={`${btn} mt-4`}>Save these rules</button>
      </Act>

      <Act action="settings.save" back={`${back}#levels`} id="levels" className={`${card} mt-4 scroll-mt-28 p-4 sm:p-5`}>
        <input type="hidden" name="section" value="levels" />
        <h2 className={h2}>Level names</h2>
        <p className="text-[0.88rem] text-plum-700">Members climb levels as they earn points. The points needed stay the same; the names are yours.</p>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {s.levelNames.map((n, i) => (
            <label key={i} className={lbl}>Level {i + 1} ({LEVEL_POINTS[i].toLocaleString("en-US")} points)<input name={`level-${i + 1}`} defaultValue={n} className={field} /></label>
          ))}
        </div>
        <button className={`${btn} mt-4`}>Save level names</button>
      </Act>

      <Act action="settings.save" back={`${back}#rituals`} id="rituals" className={`${card} mt-4 scroll-mt-28 p-4 sm:p-5`}>
        <input type="hidden" name="section" value="rituals" />
        <h2 className={h2}>Weekly rituals</h2>
        <p className="text-[0.88rem] text-plum-700">Posts that go up by themselves, as Iisha, on the same day each week. Predictable rituals keep members coming back.</p>
        <div className="mt-3 space-y-4">
          {s.rituals.map((r) => (
            <fieldset key={r.id} className="rounded-2xl bg-bone/70 p-4">
              <legend className="sr-only">{r.title}</legend>
              <label className={check}><input type="checkbox" name={`${r.id}-on`} defaultChecked={r.enabled} className={box} /> <span>Post this {r.monthlyDay ? `on day ${r.monthlyDay} of each month` : `every ${WEEKDAYS[r.weekday ?? 1]}`}</span></label>
              <label className={`${lbl} mt-2`}>Post title<input name={`${r.id}-title`} defaultValue={r.title} className={field} /></label>
              <label className={`${lbl} mt-3`}>Post text<textarea name={`${r.id}-body`} defaultValue={r.body} rows={3} className={field} /></label>
            </fieldset>
          ))}
        </div>
        <button className={`${btn} mt-4`}>Save rituals</button>
      </Act>

      <section className={`${card} mt-4 p-4 sm:p-5`} aria-labelledby="digest-h">
        <h2 id="digest-h" className={h2}>Email digest to quiet members</h2>
        <p className="text-[0.88rem] text-plum-700">Sends a short “we miss you” summary to members who haven&apos;t visited in 14 days or more. Demo: nothing is sent yet, it is only written to the activity log.</p>
        <Act action="digest.send" back={back}><button className={`${btnGhost} mt-3`}>Send the digest now</button></Act>
      </section>

      {DEMO && (
        <section className={`${card} mt-4 p-4 sm:p-5`} aria-labelledby="reset-h">
          <h2 id="reset-h" className={h2}>Reset demo data</h2>
          <p className="text-[0.88rem] text-plum-700">While the community is in demo mode, you can put everything back to the sample starting point and practice again.</p>
          <details className="mt-3">
            <summary className={sumRed}>Reset demo data</summary>
            <Act action="demo.reset" back="/admin?view=community" className={panel}>
              <p className="text-[0.92rem] text-plum-900">This puts every member, post, course, price and setting back to the sample starting point. Anything you practiced or typed in (including prices) will be cleared. This one can&apos;t be undone.</p>
              <button className={`${btnRed} mt-3`}>Yes, reset the demo</button>
            </Act>
          </details>
        </section>
      )}
    </>
  );
}
