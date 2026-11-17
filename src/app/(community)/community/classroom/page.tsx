import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { LockedCourse } from "@/components/community/classroom/LessonTools";
import { AccessChip, Bar, courseProgress, listed, lockInfo } from "@/components/community/classroom/shared";
import { Empty, PageHead, card } from "@/components/community/ui";
import { Needs } from "@/components/ui/Needs";
import { hydrate } from "@/lib/community/courses";
import { img } from "@/lib/images";
import { getSettings } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Classroom" };
export const dynamic = "force-dynamic";

export default async function ClassroomPage() {
  const actor = await requireMember();
  const now = new Date();
  const [all, s, progress] = await Promise.all([db.courses(), getSettings(), db.progress(actor.id)]);
  const courses = all.filter((c) => listed(actor, c)).map(hydrate);

  return (
    <>
      <PageHead icon="classroom" eyebrow="Classroom" title="Learn at your own pace" lede="Short lessons, one small action at a time. Locked courses show you exactly how to open them." />
      {courses.length === 0 ? (
        <Empty title="The Classroom is being set up">Iisha is getting the first lessons ready. Check back soon.</Empty>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => {
            const lock = lockInfo(actor, c, s, now);
            const pr = courseProgress(c, progress);
            const cover = img(c.cover);
            const inner = (
              <article className={`${card} flex h-full flex-col overflow-hidden transition group-hover:border-amethyst`}>
                <div className="relative aspect-[16/9] bg-sand">
                  {cover && <Image src={cover} alt="" fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw" className={`object-cover ${lock ? "opacity-80" : ""}`} />}
                  {lock && (
                    <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-paper/95 text-brass-deep shadow">
                      <Lock className="h-4 w-4" aria-hidden="true" />
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div><AccessChip c={c} s={s} locked={!!lock} /></div>
                  <h2 className="mt-3 font-display text-[1.45rem] leading-tight text-plum-900">
                    {c.title}
                    {c.titleNeeds && <> <Needs>{c.titleNeeds}</Needs></>}
                  </h2>
                  {c.promise && <p className="mt-1.5 text-[0.95rem] text-plum-700">{c.promise}</p>}
                  <div className="mt-auto pt-5">
                    {lock ? (
                      <p className="flex items-center justify-between gap-3 text-[0.88rem] text-plum-900">
                        <span>{lock.line}</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
                      </p>
                    ) : c.apply ? (
                      <p className="flex items-center justify-between gap-3 text-[0.88rem] text-plum-900">
                        <span>See the four weeks</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-amethyst" aria-hidden="true" />
                      </p>
                    ) : (
                      <>
                        <Bar percent={pr.percent} label={`${pr.percent}% complete`} />
                        <p className="mt-2 text-[0.82rem] text-plum-700">
                          {pr.total === 0 ? "Lessons coming soon" : pr.done === 0 ? `${pr.total} ${pr.total === 1 ? "lesson" : "lessons"} · Start here` : `${pr.done} of ${pr.total} done · ${pr.percent}%`}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
            return (
              <li key={c.id}>
                {lock ? (
                  <LockedCourse title={c.title} why={lock.why} href={lock.href} cta={lock.cta}>{inner}</LockedCourse>
                ) : (
                  <Link href={`/community/classroom/${c.id}`} className="group block h-full rounded-card">{inner}</Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
