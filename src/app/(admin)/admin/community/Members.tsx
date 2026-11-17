/** Members (6.2): find anyone, see where they stand, and change it with plain-language buttons. */
import Link from "next/link";
import { ArrowRight, Eye, Search } from "lucide-react";
import { MemberAvatar, MemberName, PlanPill } from "@/components/community/ui";
import { PLAN_ORDER, firstName, levelFor } from "@/lib/community/config";
import { effectivePlan, isLive, isOwner } from "@/lib/community/permissions";
import type { Member, PlanKey, Settings } from "@/lib/community/types";
import { isQuiet } from "@/lib/server/community/admin";
import { db } from "@/lib/server/community/store";
import { NotesBox } from "./NotesBox";
import { Act, EmptyNote, StatePill, Tip, box, btn, btnGhost, btnRed, card, check, day, field, lbl, panel, sum, sumRed, when } from "./shared";

const FILTERS: [string, string][] = [
  ["all", "All"],
  ["pending", "Waiting for approval"],
  ["free", "Free"],
  ["circle", "Circle"],
  ["inner", "Inner Circle"],
  ["paused", "Paused"],
  ["team", "Admins & team"],
  ["quiet", "Quiet 14+ days"],
  ["pastdue", "Payment failed"],
  ["removed", "Removed"],
];

function statePill(m: Member, now: Date) {
  if (m.state === "pending") return <StatePill tone="new">Waiting for approval</StatePill>;
  if (m.state === "paused") return <StatePill tone="warn">Access off</StatePill>;
  if (m.state === "removed") return <StatePill tone="bad">Removed</StatePill>;
  if (m.state === "past_due") return <StatePill tone="bad">Payment failed</StatePill>;
  if (m.state === "canceled") return <StatePill tone="warn">Canceled{m.periodEndsAt ? `, access until ${day(m.periodEndsAt)}` : ""}</StatePill>;
  if (m.trialEndsAt && +new Date(m.trialEndsAt) > +now) return <StatePill tone="good">Free trial until {day(m.trialEndsAt)}</StatePill>;
  return <StatePill tone="good">Active</StatePill>;
}

const planExplain = (first: string, s: Settings): Record<PlanKey, string> => ({
  free: `${first} keeps the community feed, the free classroom and the monthly Community Live. The weekly lessons and My Journey are turned off.`,
  circle: `${first} will get the 12-week lessons, My Journey, posting in Ask Iisha, the Live Q&A and the full download library.`,
  inner: `${first} will get everything in ${s.plans.circle.name}, plus the coaching calls, the 1:1 review, the ${s.plans.inner.name} Lounge and the replay vault.`,
});

export async function CommunityMembers({ actor, filter: rawFilter, q: rawQ }: { actor: Member; filter?: string; q?: string }) {
  const now = new Date();
  const filter = FILTERS.some(([k]) => k === rawFilter) ? rawFilter! : "all";
  const q = (rawQ ?? "").trim().toLowerCase();
  const [members, s, allProgress, purchases, posts, comments, auditLog, courses] = await Promise.all([db.members(), db.settings(), db.allProgress(), db.purchases(), db.posts(), db.comments(), db.audit(), db.courses()]);
  const back = `/admin?${new URLSearchParams({ view: "community-members", ...(filter !== "all" ? { filter } : {}), ...(q ? { q } : {}) })}`;
  const owner = isOwner(actor);
  const lessonsDone = new Map(allProgress.map((p) => [p.memberId, Object.values(p.lessons).filter((l) => l.doneAt).length]));

  const match = (m: Member, f: string) => {
    const plan = effectivePlan(m, now);
    const regular = m.role === "member" && isLive(m);
    switch (f) {
      case "pending": return m.state === "pending";
      case "free": case "circle": case "inner": return regular && plan === f;
      case "paused": return m.state === "paused";
      case "team": return m.role !== "member";
      case "quiet": return isQuiet(m, now);
      case "pastdue": return m.state === "past_due";
      case "removed": return m.state === "removed";
      default: return m.state !== "removed";
    }
  };
  const count = (f: string) => members.filter((m) => match(m, f)).length;
  let rows = members.filter((m) => match(m, filter));
  if (q) rows = rows.filter((m) => `${m.name} ${m.email} ${m.city ?? ""}`.toLowerCase().includes(q));
  const order = { pending: 0, past_due: 1, active: 2, canceled: 2, paused: 3, removed: 4 } as const;
  rows.sort((a, b) => order[a.state] - order[b.state] || (a.role === "member" ? 1 : 0) - (b.role === "member" ? 1 : 0) || b.joinedAt.localeCompare(a.joinedAt));

  return (
    <>
      <Tip>Everyone in your community. Find a person, then use the buttons under their name. Every change shows an Undo right after.</Tip>

      <form className={`mt-5 flex items-center gap-2 rounded-full bg-white px-4 ${card}`} role="search">
        <input type="hidden" name="view" value="community-members" />
        {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
        <Search className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />
        <input name="q" defaultValue={rawQ} placeholder="Find a member by name or email" aria-label="Find a member by name or email" className="min-h-12 w-full bg-transparent text-[1rem] outline-none" />
        <button className="min-h-11 shrink-0 px-2 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-amethyst">Search</button>
      </form>

      <nav aria-label="Filter members" className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map(([k, t]) => {
          const n = count(k);
          const on = k === filter;
          return (
            <Link key={k} href={`/admin?view=community-members${k !== "all" ? `&filter=${k}` : ""}`} aria-current={on ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.86rem] transition ${on ? "bg-plum-900 text-bone" : "border border-plum-800/15 bg-white text-plum-900 hover:border-amethyst"}`}>
              {t} <span className={`rounded-full px-1.5 text-[0.72rem] tabular-nums ${on ? "bg-bone/25" : "bg-plum-800/10"}`}>{n}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bulk actions: the checkboxes on each row belong to this form. */}
      <details className={`${card} mt-4 p-4`}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 font-medium text-plum-900 [&::-webkit-details-marker]:hidden">
          <ArrowRight className="h-4 w-4 text-amethyst" aria-hidden="true" /> Do one thing for several people at once
        </summary>
        <Act action="member.bulk" back={back} id="bulk" className="mt-2">
          <p className="text-[0.88rem] text-plum-700">First tick the box next to each person below. Then choose what to do.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button name="op" value="approve" className={btn}>Approve selected</button>
            {PLAN_ORDER.map((p) => (
              <button key={p} name="op" value={`plan:${p}`} className={btnGhost}>Move selected to {s.plans[p].name}</button>
            ))}
          </div>
          <label className={`${lbl} mt-4`}>
            Or write one message to everyone you ticked
            <textarea name="body" rows={2} className={field} placeholder="Hi! Just checking in…" />
          </label>
          <button name="op" value="message" className={`${btnGhost} mt-2`}>Message selected</button>
        </Act>
      </details>

      {rows.length === 0 ? (
        <EmptyNote>{q ? "No one matches that search. Try a first name or part of an email." : filter === "pending" ? "No one is waiting. When someone asks to join, they show up here with Approve and Decline buttons." : "No one here yet. Members appear as soon as they join."}</EmptyNote>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((m) => {
            const first = firstName(m.name);
            const plan = effectivePlan(m, now);
            const lv = levelFor(m.points);
            const team = m.role !== "member";
            const explain = planExplain(first, s);
            const mine = { posts: posts.filter((p) => p.authorId === m.id), comments: comments.filter((c) => c.authorId === m.id).length, purchases: purchases.filter((p) => p.memberId === m.id), log: auditLog.filter((a) => a.targetId === m.id).slice(0, 8) };
            return (
              <li key={m.id} id={m.id} className={`scroll-mt-28 ${card} p-4 sm:p-5`}>
                <div className="flex items-start gap-3">
                  <label className="-ml-2 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center"><input type="checkbox" name="ids" value={m.id} form="bulk" aria-label={`Select ${m.name}`} className={box} /></label>
                  <MemberAvatar m={m} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[1.05rem] font-medium text-plum-900"><MemberName m={m} /></p>
                    <p className="break-all text-[0.86rem] text-plum-700">{m.email}</p>
                    <p className="mt-2 flex flex-wrap gap-1.5">
                      {team ? <StatePill tone="new">{m.role === "owner" ? "Owner" : m.role === "admin" ? "Admin" : "Moderator"}</StatePill> : <PlanPill plan={plan} name={s.plans[plan].name} />}
                      {statePill(m, now)}
                      {m.gift && +new Date(m.gift.until) > +now && <StatePill tone="warn">Gift: {s.plans[m.gift.plan].name} until {day(m.gift.until)}</StatePill>}
                      {m.isClient && <StatePill>Client of Iisha</StatePill>}
                    </p>
                    <p className="mt-2 text-[0.84rem] text-plum-700">
                      {!team && <>Level {lv.level} ({s.levelNames[lv.level - 1]}) · </>}
                      Joined {day(m.joinedAt)} · Last visit {when(m.lastSeenAt)} · {lessonsDone.get(m.id) ?? 0} lessons completed
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-start gap-2">
                  {m.state === "pending" && (
                    <>
                      <Act action="member.approve" back={back}><input type="hidden" name="id" value={m.id} /><button className={btn}>Approve</button></Act>
                      <details className="open:w-full">
                        <summary className={sum}>Decline</summary>
                        <Act action="member.decline" back={back} className={panel}>
                          <input type="hidden" name="id" value={m.id} />
                          <p className="text-[0.92rem] text-plum-900">{first} won&apos;t be let in, and can&apos;t ask again with the same email unless you restore them. You can undo this for 24 hours.</p>
                          <button className={`${btnRed} mt-3`}>Yes, decline {first}</button>
                        </Act>
                      </details>
                    </>
                  )}

                  {!team && m.state !== "pending" && m.state !== "removed" && (
                    <details className="open:w-full">
                      <summary className={sum}>Change plan</summary>
                      <Act action="member.plan" back={back} className={panel}>
                        <input type="hidden" name="id" value={m.id} />
                        <fieldset>
                          <legend className="font-medium text-plum-900">Which plan should {first} have?</legend>
                          <div className="mt-2 space-y-2">
                            {PLAN_ORDER.map((p) => (
                              <label key={p} className="flex cursor-pointer items-start gap-3 rounded-xl border border-plum-800/15 bg-white p-3 has-[:checked]:border-amethyst has-[:checked]:bg-mist">
                                <input type="radio" name="plan" value={p} defaultChecked={p === m.plan} required className={`${box} mt-0.5`} />
                                <span>
                                  <span className="block font-medium text-plum-900">{s.plans[p].name}{p === m.plan ? " (now)" : ""}</span>
                                  <span className="block text-[0.88rem] text-plum-700">{explain[p]}</span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </fieldset>
                        <label className={`${lbl} mt-4`}>
                          Gift it for free until… (optional)
                          <input type="date" name="giftUntil" className={`${field} sm:max-w-xs`} />
                        </label>
                        <p className="mt-1 text-[0.82rem] text-plum-700">Leave the date empty to change their plan for good. Pick a date to lend them the plan as a gift until that day.</p>
                        <button className={`${btn} mt-3`}>Save {first}&apos;s plan</button>
                      </Act>
                    </details>
                  )}

                  {m.role !== "owner" && isLive(m) && (
                    <details className="open:w-full">
                      <summary className={sum}>Turn access off</summary>
                      <Act action="member.pause" back={back} className={panel}>
                        <input type="hidden" name="id" value={m.id} />
                        <p className="text-[0.92rem] text-plum-900">{first} won&apos;t be able to see anything in the community. They&apos;ll see a friendly “Your access is paused” page until you turn it back on. Nothing is deleted.</p>
                        <button className={`${btn} mt-3`}>Yes, turn {first}&apos;s access off</button>
                      </Act>
                    </details>
                  )}
                  {(m.state === "paused" || m.state === "removed") && (
                    <Act action="member.restore" back={back}><input type="hidden" name="id" value={m.id} /><button className={btn}>{m.state === "removed" ? `Restore ${first}` : "Turn access back on"}</button></Act>
                  )}

                  {!team && isLive(m) && (
                    <details className="open:w-full">
                      <summary className={sum}>Give a course</summary>
                      <Act action="member.grant" back={back} className={panel}>
                        <input type="hidden" name="id" value={m.id} />
                        <label className={lbl}>
                          Which course should {first} get for free?
                          <select name="course" required className={field} defaultValue="">
                            <option value="" disabled>Choose a course</option>
                            {courses.map((c) => <option key={c.id} value={c.id}>{c.title}{m.grantedCourses.includes(c.id) ? " (already has it)" : ""}</option>)}
                          </select>
                        </label>
                        <button className={`${btn} mt-3`}>Give it to {first}</button>
                      </Act>
                    </details>
                  )}

                  {m.state !== "removed" && m.state !== "pending" && m.id !== actor.id && (
                    <details className="open:w-full">
                      <summary className={sum}>Message</summary>
                      <Act action="message.send" back={back} className={panel}>
                        <input type="hidden" name="thread" value={`team:${m.id}`} />
                        <input type="hidden" name="_log" value="1" />
                        <label className={lbl}>
                          Your message to {first}
                          <textarea name="body" rows={3} required className={field} placeholder={`Hi ${first}, …`} />
                        </label>
                        <button className={`${btn} mt-3`}>Send to {first}</button>
                      </Act>
                    </details>
                  )}

                  <form method="post" action="/api/community/view-as" target="_blank">
                    <input type="hidden" name="id" value={m.id} />
                    <button className={btnGhost}><Eye className="h-4 w-4" aria-hidden="true" /> View as this member</button>
                  </form>

                  {m.role !== "owner" && m.state !== "removed" && m.state !== "pending" && (
                    <details className="open:w-full">
                      <summary className={sum}>Team role</summary>
                      <div className={panel}>
                        {!owner && <p className="mb-3 text-[0.9rem] font-medium text-plum-900">Only Iisha can do this.</p>}
                        <p className="text-[0.88rem] text-plum-700">Admins can do everything except choose the team. Moderators can approve people and tidy up posts.</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(["admin", "moderator", "member"] as const).filter((r) => r !== m.role).map((r) => (
                            <Act key={r} action="member.role" back={back}>
                              <input type="hidden" name="id" value={m.id} />
                              <input type="hidden" name="role" value={r} />
                              <button disabled={!owner} title={owner ? undefined : "Only Iisha can do this"} className={r === "member" ? btnGhost : btn}>{r === "admin" ? "Make admin" : r === "moderator" ? "Make moderator" : "Remove from team"}</button>
                            </Act>
                          ))}
                        </div>
                      </div>
                    </details>
                  )}

                  <details className="open:w-full">
                    <summary className={sum}>See everything about {first}</summary>
                    <div className={`${panel} grid grid-cols-[minmax(0,1fr)] gap-5 md:grid-cols-2`}>
                      <div>
                        <h3 className="font-medium text-plum-900">Profile</h3>
                        <dl className="mt-2 space-y-1 text-[0.9rem]">
                          {[["City", m.city], ["Hair goal", m.hairGoal], ["About", m.bio], ["Billing", m.billing], ["Renews or ends", m.periodEndsAt ? day(m.periodEndsAt) : ""]].filter(([, v]) => v).map(([k, v]) => (
                            <div key={k} className="flex gap-2"><dt className="shrink-0 text-plum-700">{k}:</dt><dd className="min-w-0 break-words text-ink">{v}</dd></div>
                          ))}
                        </dl>
                        <h3 className="mt-4 font-medium text-plum-900">Answers when they joined</h3>
                        {m.answers && Object.values(m.answers).some(Boolean) ? (
                          <dl className="mt-2 space-y-2 text-[0.9rem]">
                            {s.questions.map((qu) => (
                              <div key={qu.id}><dt className="text-plum-700">{qu.label}</dt><dd className="text-ink">{m.answers?.[qu.id] || "No answer"}</dd></div>
                            ))}
                          </dl>
                        ) : <p className="mt-2 text-[0.88rem] text-plum-700">No answers on file.</p>}
                        {m.exitSurvey && (
                          <>
                            <h3 className="mt-4 font-medium text-plum-900">Why they canceled</h3>
                            <dl className="mt-2 space-y-1 text-[0.9rem]">
                              <div><dt className="text-plum-700">Why they joined</dt><dd>{m.exitSurvey.joined || "No answer"}</dd></div>
                              <div><dt className="text-plum-700">Why they&apos;re leaving</dt><dd>{m.exitSurvey.leaving || "No answer"}</dd></div>
                              <div><dt className="text-plum-700">What would have kept them</dt><dd>{m.exitSurvey.kept || "No answer"}</dd></div>
                            </dl>
                          </>
                        )}
                        <div className="mt-4"><NotesBox id={m.id} initial={m.teamNotes ?? ""} /></div>
                      </div>
                      <div>
                        <h3 className="font-medium text-plum-900">Plan history</h3>
                        <ul className="mt-2 space-y-1 text-[0.88rem] text-plum-800">
                          {m.planHistory.map((h, i) => <li key={i}>{day(h.at)}: {s.plans[h.plan].name} ({h.by}{h.note ? `, ${h.note}` : ""})</li>)}
                        </ul>
                        <h3 className="mt-4 font-medium text-plum-900">Purchases</h3>
                        {mine.purchases.length ? (
                          <ul className="mt-2 space-y-1 text-[0.88rem] text-plum-800">
                            {mine.purchases.map((p) => <li key={p.id}>{day(p.at)}: {p.label}{p.amount ? `, ${p.amount}` : ""}{p.demo ? " (demo)" : ""}</li>)}
                          </ul>
                        ) : <p className="mt-2 text-[0.88rem] text-plum-700">Nothing bought yet.</p>}
                        <h3 className="mt-4 font-medium text-plum-900">Activity</h3>
                        <p className="mt-2 text-[0.88rem] text-plum-800">{mine.posts.length} posts · {mine.comments} comments · {lessonsDone.get(m.id) ?? 0} lessons completed · {m.points} points</p>
                        {mine.posts.length > 0 && (
                          <ul className="mt-1 space-y-1 text-[0.88rem]">
                            {mine.posts.slice(-4).reverse().map((p) => <li key={p.id}><a href={`/community/post/${p.id}`} target="_blank" rel="noopener" className="text-amethyst underline underline-offset-2">{p.title}</a></li>)}
                          </ul>
                        )}
                        <h3 className="mt-4 font-medium text-plum-900">Changes the team made</h3>
                        {mine.log.length ? (
                          <ul className="mt-2 space-y-1 text-[0.88rem] text-plum-800">
                            {mine.log.map((a) => <li key={a.id}>{a.text} · {when(a.at)}{a.undoneAt ? " (undone)" : ""}</li>)}
                          </ul>
                        ) : <p className="mt-2 text-[0.88rem] text-plum-700">No changes yet.</p>}
                      </div>
                    </div>
                  </details>

                  {m.role !== "owner" && m.state !== "removed" && m.state !== "pending" && (
                    <details className="open:w-full">
                      <summary className={sum}>More</summary>
                      <div className={`${panel} space-y-4`}>
                        {m.state === "past_due" && (
                          <Act action="member.payment" back={back}>
                            <input type="hidden" name="id" value={m.id} />
                            <p className="text-[0.9rem] text-plum-900">{first}&apos;s last payment didn&apos;t go through. If they&apos;ve paid you another way, mark it fixed.</p>
                            <button className={`${btn} mt-2`}>Mark payment as fixed</button>
                          </Act>
                        )}
                        {!team && (
                          <Act action="member.client" back={back}>
                            <input type="hidden" name="id" value={m.id} />
                            <button className={btnGhost}>{m.isClient ? "Remove the “Client of Iisha” badge" : "Add the “Client of Iisha” badge"}</button>
                          </Act>
                        )}
                        {!team && plan !== "free" && (
                          <Act action="member.drip" back={back} className="flex flex-wrap items-end gap-2">
                            <input type="hidden" name="id" value={m.id} />
                            <label className={lbl}>
                              Open the weekly lessons through week
                              <input type="number" name="week" min={1} max={12} defaultValue={3} className={`${field} w-28`} />
                            </label>
                            <button className={btnGhost}>Open those weeks</button>
                          </Act>
                        )}
                        <details>
                          <summary className={sumRed}>Remove from community</summary>
                          <Act action="member.remove" back={back} className="mt-3 rounded-2xl border border-[#b4533c]/40 bg-white p-4">
                            <input type="hidden" name="id" value={m.id} />
                            <p className="text-[0.92rem] text-plum-900">This removes {m.name} from the community. They can&apos;t rejoin with the same email unless you restore them. If you only want a break, use “Turn access off” instead.</p>
                            <label className={`${lbl} mt-3`}>
                              To confirm, type their first name: {first}
                              <input name="confirm" required autoComplete="off" className={`${field} sm:max-w-xs`} />
                            </label>
                            <button className={`${btnRed} mt-3`}>Remove {first} from the community</button>
                          </Act>
                        </details>
                      </div>
                    </details>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className={`${check} mt-4 !min-h-0 text-[0.84rem] text-plum-700`}>Tip: “View as this member” opens the community in a new tab so you can see exactly what they see.</p>
    </>
  );
}
