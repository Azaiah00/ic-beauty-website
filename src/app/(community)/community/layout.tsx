import type { Metadata } from "next";
import Link from "next/link";
import { Bell, MessageCircle, Search } from "lucide-react";
import { ICMark } from "@/components/brand/ICMark";
import { ToastProvider } from "@/components/community/client";
import { MobileTabBar, NavTabs, type Tab } from "@/components/community/nav";
import { DemoBar } from "@/components/community/Shell";
import { MemberAvatar, btn, btnGhost } from "@/components/community/ui";
import { DEMO, GRACE_DAYS } from "@/lib/community/config";
import { can, effectivePlan, isAdmin, isLive } from "@/lib/community/permissions";
import { ensureNudge, fmtDate } from "@/lib/server/community/core";
import { getSettings, inboxCounts } from "@/lib/server/community/queries";
import { getActor } from "@/lib/server/community/session";

export const metadata: Metadata = {
  title: { default: "The H.A.I.R. Circle Community", template: "%s | The H.A.I.R. Circle Community" },
  robots: { index: false, follow: false },
};

/**
 * Community shell: demo bar, top bar (logo, search, bell, messages, avatar menu), section tabs, and the
 * bottom tab bar on phones. Guests, pending and paused people get a quiet header with no navigation.
 * Every page below still checks the policy module itself; the shell only decides what to show.
 */
export default async function CommunityLayout({ children, modal }: { children: React.ReactNode; modal: React.ReactNode }) {
  const [actor, s] = await Promise.all([getActor(), getSettings()]);
  const live = isLive(actor);
  const counts = live ? await inboxCounts(actor.id) : { notifications: 0, messages: 0 };
  if (live) await ensureNudge(actor);

  const tabs: Tab[] = [
    { href: "/community", label: "Community", icon: "community" },
    { href: "/community/classroom", label: "Classroom", icon: "classroom" },
    { href: "/community/calendar", label: "Calendar", icon: "calendar" },
    { href: "/community/members", label: "Members", icon: "members" },
    { href: "/community/leaderboards", label: "Leaderboards", icon: "leaderboards" },
    { href: "/community/labs", label: "Labs", icon: "labs" },
    ...(can(actor, "journey.view") ? [{ href: "/portal", label: "My Journey", icon: "journey" as const }] : []),
    { href: "/community/about", label: "About", icon: "heart" },
  ];
  const iconBtn = "relative flex h-11 w-11 items-center justify-center rounded-full text-plum-800 hover:bg-mist";
  const dot = "absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amethyst px-1 text-[0.6rem] font-semibold text-bone";

  return (
    <ToastProvider>
      <div className="min-h-dvh bg-bone">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[80] focus:rounded-pill focus:bg-plum-900 focus:px-4 focus:py-2 focus:text-bone">Skip to content</a>
        {DEMO && <DemoBar actor={actor} s={s} />}
        <header className="sticky top-0 z-40 border-b border-plum-800/10 bg-paper/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 w-full max-w-[76rem] items-center gap-3 px-4 sm:px-6">
            <Link href={live ? "/community" : "/community/about"} className="flex min-w-0 items-center gap-2.5">
              <ICMark className="h-8 w-auto shrink-0 text-amethyst" title="" />
              <span className="truncate font-display text-[1.2rem] leading-none text-plum-900 sm:text-[1.35rem]">{s.name}</span>
            </Link>
            {live ? (
              <>
                <form action="/community" role="search" className="ml-auto hidden min-w-0 max-w-xs flex-1 items-center gap-2 rounded-pill border border-plum-800/15 bg-white px-4 md:flex">
                  <Search className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />
                  <input name="q" placeholder="Search posts" aria-label="Search posts" className="min-h-10 w-full bg-transparent text-[0.95rem] outline-none" />
                </form>
                <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0">
                  <Link href="/community?search=1" className={`${iconBtn} md:hidden`} aria-label="Search posts">
                    <Search className="h-5 w-5" aria-hidden="true" strokeWidth={1.6} />
                  </Link>
                  <Link href="/community/notifications" className={iconBtn} aria-label={`Notifications${counts.notifications ? `, ${counts.notifications} new` : ""}`}>
                    <Bell className="h-5 w-5" aria-hidden="true" strokeWidth={1.6} />
                    {counts.notifications > 0 && <span className={dot} aria-hidden="true">{counts.notifications > 9 ? "9+" : counts.notifications}</span>}
                  </Link>
                  <Link href="/community/messages" className={iconBtn} aria-label={`Messages${counts.messages ? `, ${counts.messages} new` : ""}`}>
                    <MessageCircle className="h-5 w-5" aria-hidden="true" strokeWidth={1.6} />
                    {counts.messages > 0 && <span className={dot} aria-hidden="true">{counts.messages > 9 ? "9+" : counts.messages}</span>}
                  </Link>
                  <details className="relative ml-1">
                    <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full [&::-webkit-details-marker]:hidden" aria-label="Your menu">
                      <MemberAvatar m={actor} size={36} level={false} />
                    </summary>
                    <div className="absolute right-0 top-full z-50 mt-2 w-60 rounded-card border border-plum-800/10 bg-paper p-2 shadow-2xl">
                      <p className="truncate px-3 pb-1 pt-2 text-[0.8rem] text-plum-700">{actor.name.split(" (")[0]}</p>
                      {[
                        { href: `/community/members/${actor.id}`, label: "My profile" },
                        { href: "/community/settings", label: "Settings & plan" },
                        ...(actor.role === "member" && effectivePlan(actor) !== "inner" ? [{ href: "/community/upgrade", label: "Upgrade" }] : []),
                        ...(isAdmin(actor) ? [{ href: "/admin?view=community", label: "Owner dashboard" }] : []),
                      ].map((l) => (
                        <Link key={l.href} href={l.href} className="flex min-h-11 items-center rounded-xl px-3 text-plum-900 hover:bg-mist">{l.label}</Link>
                      ))}
                      <form method="post" action="/api/community/logout">
                        <button className="flex min-h-11 w-full items-center rounded-xl px-3 text-left text-plum-900 hover:bg-mist">Sign out</button>
                      </form>
                    </div>
                  </details>
                </div>
              </>
            ) : (
              <div className="ml-auto flex shrink-0 items-center gap-2">
                <Link href="/community/login" className={`${btnGhost} hidden !px-5 sm:inline-flex`}>Sign in</Link>
                {!actor && <Link href="/community/join" className={`${btn} !px-5`}>Join free</Link>}
              </div>
            )}
          </div>
          {live && <NavTabs tabs={tabs} />}
        </header>
        {live && actor.role === "member" && actor.state === "past_due" && actor.pastDueSince && (
          <StateBanner text={`Your last payment didn't go through. Your access stays on until ${fmtDate(new Date(+new Date(actor.pastDueSince) + GRACE_DAYS * 864e5).toISOString(), { month: "long", day: "numeric" })}.`} href="/community/settings#plan" cta="Update payment" />
        )}
        {live && actor.role === "member" && actor.state === "canceled" && actor.periodEndsAt && +new Date(actor.periodEndsAt) > Date.now() && (
          <StateBanner text={`Your membership is canceled. You keep ${s.plans[actor.plan].name} access until ${fmtDate(actor.periodEndsAt, { month: "long", day: "numeric" })}.`} href="/community/settings#plan" cta="Keep my membership" />
        )}
        <main id="main" className="mx-auto w-full max-w-[76rem] px-4 pb-28 pt-6 sm:px-6 lg:pb-16 lg:pt-8">{children}</main>
        {modal}
        {live && <MobileTabBar inbox={counts.notifications + counts.messages} />}
      </div>
    </ToastProvider>
  );
}

function StateBanner({ text, href, cta }: { text: string; href: string; cta: string }) {
  return (
    <div role="status" className="border-b border-brass-deep/30 bg-sand">
      <div className="mx-auto flex w-full max-w-[76rem] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 text-[0.95rem] text-plum-950 sm:px-6">
        <p>{text}</p>
        <Link href={href} className="inline-flex min-h-11 items-center rounded-pill bg-plum-900 px-5 text-[0.74rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst">{cta}</Link>
      </div>
    </div>
  );
}
