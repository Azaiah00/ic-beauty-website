import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, Lock } from "lucide-react";
import { Empty, PageHead, Pill, card } from "@/components/community/ui";
import { LABS, labGate } from "@/lib/community/labs";
import { can, isStaff, reason } from "@/lib/community/permissions";
import { img } from "@/lib/images";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Labs" };
export const dynamic = "force-dynamic";

/** Labs: hands-on learning. Locked cards stay visible and inviting; "Coming soon" cards are team-only. */
export default async function LabsPage() {
  const actor = await requireMember();
  const progress = await db.progress(actor.id);
  const staff = isStaff(actor);
  const labs = LABS.filter((l) => !l.teamOnly || staff);

  return (
    <>
      <PageHead icon="labs" eyebrow="Learn by doing" title="Labs" lede="Short, hands-on pieces you can finish in a few minutes. Slide, sort and build your way to understanding your hair." />
      {labs.length === 0 ? (
        <Empty title="Labs are on the way">The first hands-on pieces will appear here soon.</Empty>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map((l) => {
            const cover = img(l.cover);
            const open = !l.teamOnly && can(actor, "lab.view", labGate(l));
            const done = !!progress.labs[l.id];
            const body = (
              <>
                <div className="relative aspect-[16/10] bg-sand">
                  {cover && <Image src={cover} alt="" fill sizes="(min-width: 1024px) 24rem, (min-width: 640px) 50vw, 100vw" className={`object-cover ${open ? "" : "opacity-70"}`} />}
                  <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                    {l.teamOnly ? <Pill tone="dark">Coming soon · team only</Pill> : done ? <Pill tone="good"><CheckCircle2 className="h-3 w-3" aria-hidden="true" /> Done</Pill> : null}
                    {!open && !l.teamOnly && <Pill tone="brass"><Lock className="h-3 w-3" aria-hidden="true" /> Locked</Pill>}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="font-display text-[1.5rem] leading-tight text-plum-900">{l.title}</h2>
                  <p className="mt-1.5 flex-1 text-plum-700">{l.promise}</p>
                  <p className="mt-3 flex items-center gap-1.5 text-[0.84rem] text-plum-700"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> About {l.minutes} minutes</p>
                  {l.teamOnly ? (
                    <p className="mt-3 text-[0.88rem] text-plum-700">Members don&apos;t see this card yet. It opens when the Lab is built.</p>
                  ) : open ? (
                    <span className="mt-4 inline-flex min-h-11 items-center gap-2 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-amethyst">{done ? "Play again" : "Open the Lab"} <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                  ) : (
                    <>
                      <p className="mt-3 text-[0.9rem] text-plum-900">{reason(actor, "lab.view", labGate(l))}</p>
                      <span className="mt-2 inline-flex min-h-11 items-center gap-2 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-amethyst">See plans <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
                    </>
                  )}
                </div>
              </>
            );
            return (
              <li key={l.id}>
                {l.teamOnly ? (
                  <div className={`${card} flex h-full flex-col overflow-hidden border-dashed`}>{body}</div>
                ) : (
                  <Link href={open ? `/community/labs/${l.id}` : "/community/upgrade"} className={`${card} flex h-full flex-col overflow-hidden transition hover:border-amethyst`}>{body}</Link>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
