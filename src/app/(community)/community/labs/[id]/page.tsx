import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { LabHost } from "@/components/community/labs/LabHost";
import { EducationNote, Empty, LockNote, PageHead } from "@/components/community/ui";
import { lab as findLab, labGate } from "@/lib/community/labs";
import { can, isStaff, reason } from "@/lib/community/permissions";
import { requireMember } from "@/lib/server/community/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  return { title: findLab((await params).id)?.title ?? "Lab" };
}

export default async function LabPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireMember();
  const l = findLab((await params).id);
  if (!l) notFound();
  if (l.teamOnly && !isStaff(actor)) notFound();
  const open = !l.teamOnly && can(actor, "lab.view", labGate(l));

  return (
    <div className="mx-auto max-w-[52rem]">
      <Link href="/community/labs" className="mb-3 inline-flex min-h-11 items-center gap-2 text-[0.8rem] font-medium uppercase tracking-[0.12em] text-amethyst hover:text-plum-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All Labs
      </Link>
      <PageHead eyebrow="Lab" title={l.title} lede={<span className="flex flex-wrap items-center gap-x-3 gap-y-1">{l.promise}<span className="inline-flex items-center gap-1.5 text-[0.86rem]"><Clock className="h-3.5 w-3.5" aria-hidden="true" /> About {l.minutes} minutes</span></span>} />
      {l.teamOnly ? (
        <Empty title="Coming soon">This Lab hasn&apos;t been built yet. Only Iisha&apos;s team can see this page. When it&apos;s ready it will open here for members.</Empty>
      ) : open ? (
        <LabHost id={l.id} actor={{ id: actor.id, name: actor.name }} />
      ) : (
        <LockNote>{reason(actor, "lab.view", labGate(l))}</LockNote>
      )}
      <EducationNote className="mt-8" />
    </div>
  );
}
