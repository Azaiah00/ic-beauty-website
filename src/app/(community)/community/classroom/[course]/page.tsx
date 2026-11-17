import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Circle, Clock, Lock } from "lucide-react";
import { AccessChip, Bar, EDUCATION_COURSES, courseProgress, dripInfo, listed, lockInfo } from "@/components/community/classroom/shared";
import { EducationNote, LockNote, Price, btn, btnBrass, card } from "@/components/community/ui";
import { Needs } from "@/components/ui/Needs";
import { flatLessons, hydrate } from "@/lib/community/courses";
import { img } from "@/lib/images";
import { getSettings } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Course" };
export const dynamic = "force-dynamic";

export default async function CoursePage({ params, searchParams }: { params: Promise<{ course: string }>; searchParams: Promise<{ bought?: string }> }) {
  const actor = await requireMember();
  const [{ course: id }, { bought }] = await Promise.all([params, searchParams]);
  const now = new Date();
  const [stored, s, progress] = await Promise.all([db.course(id), getSettings(), db.progress(actor.id)]);
  if (!stored || !listed(actor, stored)) notFound();
  const c = hydrate(stored);
  const lock = lockInfo(actor, c, s, now);
  const pr = courseProgress(c, progress);
  const drip = dripInfo(actor, c, now);
  const all = flatLessons(c);
  const isDone = (lessonId: string) => !!progress.lessons[`${c.id}/${lessonId}`]?.doneAt;
  const next = lock || c.apply ? undefined : all.find((l, i) => !isDone(l.id) && i + 1 <= drip.open) ?? undefined;
  const cover = img(c.cover);

  return (
    <div className="mx-auto max-w-[52rem]">
      <Link href="/community/classroom" className="inline-flex min-h-11 items-center gap-2 text-[0.88rem] text-plum-700 hover:text-plum-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All courses
      </Link>

      <header className={`${card} mt-2 overflow-hidden`}>
        <div className="relative aspect-[21/9] bg-sand">{cover && <Image src={cover} alt="" fill priority sizes="(min-width: 832px) 52rem, 100vw" className="object-cover" />}</div>
        <div className="p-5 sm:p-7">
          <AccessChip c={c} s={s} locked={!!lock} />
          <h1 className="mt-3 font-display text-[2rem] leading-tight text-plum-900 sm:text-[2.5rem]">
            {c.title}
            {c.titleNeeds && <> <Needs>{c.titleNeeds}</Needs></>}
          </h1>
          {c.promise && <p className="mt-2 text-plum-700">{c.promise}</p>}

          {c.apply ? (
            <div className="mt-5">
              <dl className="flex flex-wrap gap-x-8 gap-y-2 text-plum-900">
                <div className="flex items-center gap-2"><dt className="text-plum-700">Core</dt><dd><Price value={s.prices["love-story-core"]} needs="Core price" /></dd></div>
                <div className="flex items-center gap-2"><dt className="text-plum-700">VIP</dt><dd><Price value={s.prices["love-story-vip"]} needs="VIP price" /></dd></div>
              </dl>
              <Link href={c.apply.href} className={`${btnBrass} mt-5 w-full sm:w-auto`}>
                Apply for a founding seat <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            !lock && (
              <div className="mt-5">
                <Bar percent={pr.percent} label={`${pr.percent}% complete`} />
                <p className="mt-2 text-[0.88rem] text-plum-700">{pr.total === 0 ? "Lessons are coming soon." : `${pr.done} of ${pr.total} lessons done · ${pr.percent}% complete`}</p>
                {next && (
                  <Link href={`/community/classroom/${c.id}/${next.id}`} className={`${btn} mt-4 w-full sm:w-auto`}>
                    {pr.done === 0 ? "Start the first lesson" : "Continue where you left off"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
                {!next && pr.total > 0 && pr.done === pr.total && <p className="mt-3 flex items-center gap-2 text-plum-900"><CheckCircle2 className="h-5 w-5 text-brass-deep" aria-hidden="true" /> You finished every lesson here. Beautiful work.</p>}
                {!next && pr.total > 0 && pr.done < pr.total && <p className="mt-3 text-plum-900">You&apos;re all caught up. Your next lesson opens on {drip.opensOn(Math.min(all.length, drip.open + 1))}.</p>}
              </div>
            )
          )}
        </div>
      </header>

      {bought && <p role="status" className="mt-4 flex items-center gap-2 rounded-card border border-brass/40 bg-bone px-5 py-4 text-plum-900"><CheckCircle2 className="h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" /> It&apos;s yours. Start whenever you&apos;re ready.</p>}
      {lock && <div className="mt-4"><LockNote href={lock.href} cta={lock.cta}>{lock.why}</LockNote></div>}
      {EDUCATION_COURSES.has(c.id) && <EducationNote className="mt-5" />}

      <div className="mt-6 space-y-4">
        {c.modules.map((m) => {
          return (
            <details key={m.id} open className={`${card} group`}>
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 [&::-webkit-details-marker]:hidden">
                <h2 className="font-display text-[1.35rem] leading-tight text-plum-900">{m.title}</h2>
                <span className="flex shrink-0 items-center gap-3 text-[0.82rem] text-plum-700">
                  {!c.apply && `${m.lessons.filter((l) => isDone(l.id)).length}/${m.lessons.length}`}
                  <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                </span>
              </summary>
              {m.lessons.length === 0 ? (
                <p className="border-t border-plum-800/10 px-5 py-4 text-plum-700">No lessons here yet.</p>
              ) : (
                <ol className="border-t border-plum-800/10">
                  {m.lessons.map((l) => {
                    const n = all.indexOf(l) + 1;
                    const done = isDone(l.id);
                    const waiting = !lock && n > drip.open;
                    if (c.apply)
                      return (
                        <li key={l.id} className="border-b border-plum-800/10 px-5 py-5 last:border-b-0">
                          {l.takeaways[0] && <p className="eyebrow text-amethyst">{l.takeaways[0]}</p>}
                          <h3 className="mt-1 font-display text-[1.25rem] leading-snug text-plum-900">{l.title}</h3>
                          <p className="mt-2 text-plum-700">{l.summary}</p>
                        </li>
                      );
                    const row = (
                      <>
                        {lock || waiting ? <Lock className="h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" /> : done ? <CheckCircle2 className="h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" /> : <Circle className="h-5 w-5 shrink-0 text-plum-700" aria-hidden="true" />}
                        <span className="min-w-0 flex-1">
                          <span className="block text-plum-900">{l.title}</span>
                          {waiting && <span className="block text-[0.82rem] text-plum-700">Opens on a Monday soon · {drip.opensOn(n)}</span>}
                          {done && !waiting && <span className="sr-only">(completed)</span>}
                        </span>
                        {l.minutes ? <span className="flex shrink-0 items-center gap-1 text-[0.8rem] text-plum-700"><Clock className="h-3.5 w-3.5" aria-hidden="true" />{l.minutes} min</span> : null}
                      </>
                    );
                    return (
                      <li key={l.id} className="border-b border-plum-800/10 last:border-b-0">
                        {lock || waiting ? (
                          <div className="flex min-h-14 items-center gap-3 px-5 py-3 opacity-80">{row}</div>
                        ) : (
                          <Link href={`/community/classroom/${c.id}/${l.id}`} className="flex min-h-14 items-center gap-3 px-5 py-3 transition hover:bg-mist/60">{row}</Link>
                        )}
                      </li>
                    );
                  })}
                </ol>
              )}
            </details>
          );
        })}
      </div>

      {c.apply && (
        <div className="mt-6 text-center">
          <Link href={c.apply.href} className={`${btnBrass} w-full sm:w-auto`}>
            {c.apply.label}: see the program <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
