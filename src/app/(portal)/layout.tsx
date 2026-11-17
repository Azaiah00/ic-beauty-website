import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { ICMark } from "@/components/brand/ICMark";
import { roleLabel } from "@/components/community/Shell";
import { LockNote } from "@/components/community/ui";
import { PortalProvider } from "@/components/portal/PortalState";
import { PortalSidebar, PortalTabBar } from "@/components/portal/PortalNav";
import { MemberNameProvider } from "@/components/portal/useMemberName";
import { firstName } from "@/lib/community/config";
import { check, hasAccess } from "@/lib/community/permissions";
import { membership } from "@/lib/portal/data";
import { getSettings } from "@/lib/server/community/queries";
import { getActor } from "@/lib/server/community/session";

export const metadata: Metadata = {
  title: { default: "My Journey", template: `%s | ${membership.name}` },
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

/**
 * My Journey: the personal side of the community (lessons, progress, habits, care notes, downloads).
 * It reads the signed-in member from the community session and is included with Circle Member and up.
 * The numbers inside are still sample data held in memory. // TODO: Supabase — per-member progress, habits, photos.
 */
export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor || actor.state === "removed") redirect("/community/login?next=/portal");
  if (actor.state === "pending") redirect("/community/pending");
  if (actor.state === "paused") redirect("/community/paused");
  if (!hasAccess(actor)) redirect("/community/login?next=/portal");
  const s = await getSettings();
  const gate = check(actor, "journey.view");

  if (!gate.ok) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bone px-4 py-16">
        <div className="w-full max-w-xl">
          <p className="eyebrow text-amethyst">My Journey</p>
          <h1 className="mt-2 font-display text-[2.4rem] leading-tight text-plum-900">Your own progress, in one place.</h1>
          <p className="mt-2 text-plum-700">Weekly lessons, habit tracking, check-ins and photo progress, plus your care notes from Iisha.</p>
          <div className="mt-6">
            <LockNote>{gate.message}</LockNote>
          </div>
          <Link href="/community" className="mt-5 inline-flex min-h-11 items-center gap-2 text-plum-700 hover:text-plum-900">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MemberNameProvider name={firstName(actor.name)}>
      <PortalProvider>
        <div className="flex min-h-dvh bg-bone">
          <PortalSidebar plan={roleLabel(actor, s)} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-center gap-2 bg-plum-900 px-4 py-2 text-center text-[0.75rem] text-lilac">
              <Info className="h-3.5 w-3.5 shrink-0 text-brass-soft" aria-hidden="true" />
              Demo preview with sample progress data. Nothing here is saved after you refresh.
            </div>
            <header className="flex items-center justify-between gap-3 border-b border-plum-800/10 bg-paper px-4 py-2 lg:hidden">
              <Link href="/portal" className="flex min-w-0 items-center gap-2.5">
                <ICMark className="h-8 w-auto shrink-0 text-amethyst" title="" />
                <span className="truncate font-display text-[1.15rem] text-plum-900">My Journey</span>
              </Link>
              <Link href="/community" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[0.86rem] text-plum-800">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Community
              </Link>
            </header>
            <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-8 lg:pb-16 lg:pt-12">
              {children}
            </main>
          </div>
        </div>
        <PortalTabBar />
      </PortalProvider>
    </MemberNameProvider>
  );
}
