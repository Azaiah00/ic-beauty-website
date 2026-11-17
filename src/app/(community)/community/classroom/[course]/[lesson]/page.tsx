import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Clock, Footprints, Lock, MessageCircle } from "lucide-react";
import { CompleteButton, DownloadLink, NoteBox } from "@/components/community/classroom/LessonTools";
import { EDUCATION_COURSES, dripInfo, listed, lockInfo } from "@/components/community/classroom/shared";
import { EducationNote, LockNote, btnGhost, card } from "@/components/community/ui";
import { Needs } from "@/components/ui/Needs";
import { embedUrl, flatLessons, hydrate } from "@/lib/community/courses";
import { funnel } from "@/lib/funnel";
import { img } from "@/lib/images";
import { getSettings } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Lesson" };
export const dynamic = "force-dynamic";

export default async function LessonPage({ params }: { params: Promise<{ course: string; lesson: string }> }) {
  const actor = await requireMember();
  const { course: courseId, lesson: lessonId } = await params;
  const now = new Date();
  const [stored, s, progress] = await Promise.all([db.course(courseId), getSettings(), db.progress(actor.id)]);
  if (!stored || !listed(actor, stored)) notFound();
  const c = hydrate(stored);
  if (c.apply) redirect(`/community/classroom/${c.id}`);
  const all = flatLessons(c);
  const i = all.findIndex((l) => l.id === lessonId);
  if (i < 0) notFound();
  const lesson = all[i];
  const back = (
    <Link href={`/community/classroom/${c.id}`} className="inline-flex min-h-11 items-center gap-2 text-[0.88rem] text-plum-700 hover:text-plum-900">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {c.title}
    </Link>
  );

  // The door is checked here on the server. A locked lesson never renders its content.
  const lock = lockInfo(actor, c, s, now);
  const drip = dripInfo(actor, c, now);
  if (lock || i + 1 > drip.open) {
    return (
      <div className="mx-auto max-w-[46rem]">
        {back}
        <div className={`${card} mt-2 p-6 sm:p-8`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-bone text-brass-deep ring-1 ring-brass/40"><Lock className="h-5 w-5" aria-hidden="true" /></span>
          <h1 className="mt-4 font-display text-[2rem] leading-tight text-plum-900">{lesson.title}</h1>
          {lock ? (
            <div className="mt-5"><LockNote href={lock.href} cta={lock.cta}>{lock.why}</LockNote></div>
          ) : (
            <>
              <p className="mt-3 text-plum-800">This lesson opens on {drip.opensOn(i + 1)}. One week at a time, so each lesson has room to become a habit.</p>
              <Link href={`/community/classroom/${c.id}`} className={`${btnGhost} mt-5`}>Back to the course</Link>
            </>
          )}
        </div>
      </div>
    );
  }

  const key = `${c.id}/${lesson.id}`;
  const done = !!progress.lessons[key]?.doneAt;
  const video = embedUrl(lesson.video);
  const poster = img(lesson.poster ?? c.cover);
  const prev = all[i - 1];
  const next = all[i + 1];
  const nextOpen = next && i + 2 <= drip.open;
  const discuss = `/community?compose=1&category=${c.discussIn ?? "general"}&title=${encodeURIComponent("Lesson: " + lesson.title)}`;

  return (
    <article className="mx-auto max-w-[46rem]">
      {back}
      <header className="mt-1">
        <p className="eyebrow text-amethyst">Lesson {i + 1} of {all.length}</p>
        <h1 className="mt-1 font-display text-[2rem] leading-tight text-plum-900 sm:text-[2.5rem]">{lesson.title}</h1>
        {lesson.minutes ? <p className="mt-1 flex items-center gap-1.5 text-[0.88rem] text-plum-700"><Clock className="h-4 w-4" aria-hidden="true" /> {lesson.minutes} minutes</p> : null}
      </header>

      <div className="relative mt-5 aspect-video overflow-hidden rounded-card bg-plum-900">
        {video ? (
          <iframe src={video} title={`Video: ${lesson.title}`} loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
        ) : (
          <>
            {poster && <Image src={poster} alt="" fill priority sizes="(min-width: 736px) 46rem, 100vw" className="object-cover opacity-70" />}
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-plum-950/80 to-transparent p-4">
              <Needs tone="light">Video coming from Iisha</Needs>
            </div>
          </>
        )}
      </div>

      <section className="mt-6 text-[1.05rem] leading-relaxed text-plum-900">
        <p>{lesson.summary}</p>
      </section>
      {EDUCATION_COURSES.has(c.id) && <EducationNote className="mt-5" />}

      {lesson.takeaways.length > 0 && (
        <section className={`${card} mt-6 p-5 sm:p-6`} aria-labelledby="takeaways-h">
          <h2 id="takeaways-h" className="font-display text-[1.4rem] text-plum-900">{lesson.takeaways.length === 3 ? "3 takeaways" : "Takeaways"}</h2>
          <ul className="mt-3 space-y-2.5">
            {lesson.takeaways.map((t) => (
              <li key={t} className="flex items-start gap-3 text-plum-900">
                <Check className="mt-1 h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" strokeWidth={2.5} />
                {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {lesson.action && (
        <section className="mt-5 rounded-card bg-plum-900 p-5 text-bone sm:p-6" aria-labelledby="action-h">
          <h2 id="action-h" className="eyebrow flex items-center gap-2 text-brass-soft"><Footprints className="h-4 w-4" aria-hidden="true" /> Your action step</h2>
          <p className="mt-2 font-display text-[1.4rem] leading-snug">{lesson.action}</p>
        </section>
      )}

      <section className={`${card} mt-5 p-5 sm:p-6`}>
        <NoteBox course={c.id} lesson={lesson.id} done={done} initial={progress.lessons[key]?.note ?? ""} prompt={lesson.reflection || "Your private notes"} />
      </section>

      {(lesson.downloads.length > 0 || lesson.link) && (
        <section className="mt-5" aria-labelledby="resources-h">
          <h2 id="resources-h" className="font-display text-[1.4rem] text-plum-900">Resources</h2>
          <ul className="mt-3 space-y-2">
            {lesson.downloads.map((d) => (
              <li key={d.title}>
                {d.file ? (
                  <DownloadLink href={d.file} title={d.title} tick={d.file === funnel.leadMagnet.file} />
                ) : (
                  <p className="flex min-h-12 flex-wrap items-center gap-3 rounded-xl border border-dashed border-plum-800/20 px-4 py-2 text-plum-800">{d.title} <Needs>File from Iisha</Needs></p>
                )}
              </li>
            ))}
            {lesson.link && (
              <li>
                <Link href={lesson.link.href} className="flex min-h-12 items-center gap-3 rounded-xl border border-plum-800/15 bg-white px-4 text-plum-900 transition hover:border-amethyst hover:text-amethyst">
                  <ArrowRight className="h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" /> {lesson.link.label}
                </Link>
              </li>
            )}
          </ul>
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 border-t border-plum-800/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
        <CompleteButton course={c.id} lesson={lesson.id} done={done} />
        <Link href={discuss} className={btnGhost}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" /> Discuss this lesson
        </Link>
      </div>

      <nav aria-label="Lessons" className="mt-6 grid gap-3 sm:grid-cols-2">
        {prev ? (
          <Link href={`/community/classroom/${c.id}/${prev.id}`} className={`${card} flex min-h-16 items-center gap-3 p-4 transition hover:border-amethyst`}>
            <ArrowLeft className="h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
            <span className="min-w-0"><span className="block text-[0.74rem] uppercase tracking-[0.12em] text-plum-700">Previous</span><span className="block truncate text-plum-900">{prev.title}</span></span>
          </Link>
        ) : <span className="hidden sm:block" />}
        {next &&
          (nextOpen ? (
            <Link href={`/community/classroom/${c.id}/${next.id}`} className={`${card} flex min-h-16 items-center justify-end gap-3 p-4 text-right transition hover:border-amethyst`}>
              <span className="min-w-0"><span className="block text-[0.74rem] uppercase tracking-[0.12em] text-plum-700">Next</span><span className="block truncate text-plum-900">{next.title}</span></span>
              <ArrowRight className="h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
            </Link>
          ) : (
            <div className={`${card} flex min-h-16 items-center justify-end gap-3 p-4 text-right opacity-80`}>
              <span className="min-w-0"><span className="block text-[0.74rem] uppercase tracking-[0.12em] text-plum-700">Next · opens {drip.opensOn(i + 2)}</span><span className="block truncate text-plum-900">{next.title}</span></span>
              <Lock className="h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" />
            </div>
          ))}
      </nav>
    </article>
  );
}
