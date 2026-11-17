/**
 * The owner dashboard's Community section (inside /admin, ?view=community…). One entry point:
 * it shows the "Who's using the dashboard" chooser first, then the message banner (with Undo), then the view.
 */
import { isAdmin } from "@/lib/community/permissions";
import { getDashboardActor } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";
import { CommunityCalendar } from "./Calendar";
import { CommunityClassroom } from "./Classroom";
import { CommunityHome } from "./Home";
import { CommunityLog } from "./Log";
import { CommunityMembers } from "./Members";
import { CommunityPlans } from "./Plans";
import { CommunityPosts } from "./Posts";
import { CommunitySettings } from "./Settings";
import { Banner, WhoBar, WhoChooser, card, h2 } from "./shared";

export const COMMUNITY_VIEWS = [
  { view: "community", label: "Community home", title: "Community", sub: "What needs you today, and how your community is doing" },
  { view: "community-members", label: "Members", title: "Members", sub: "Approve people, change plans, and turn access on or off" },
  { view: "community-posts", label: "Posts & reports", title: "Posts & reports", sub: "Reported posts, every post, and your feed's categories" },
  { view: "community-classroom", label: "Classroom", title: "Classroom", sub: "Courses, who can see them, and the lessons inside" },
  { view: "community-calendar", label: "Calendar", title: "Calendar", sub: "Lives, Q&As and coaching calls" },
  { view: "community-plans", label: "Plans & prices", title: "Plans & prices", sub: "What each plan costs and includes" },
  { view: "community-settings", label: "Settings", title: "Community settings", sub: "Name, questions, welcome message, points and rituals" },
  { view: "community-log", label: "Activity log", title: "Activity log", sub: "Every change, with Undo" },
] as const;

export const isCommunityView = (v: string | undefined): v is (typeof COMMUNITY_VIEWS)[number]["view"] => COMMUNITY_VIEWS.some((x) => x.view === v);

export type CommunityParams = { msg?: string; err?: string; undo?: string; filter?: string; q?: string; cat?: string };

export async function CommunityView({ view, sp }: { view: string; sp: CommunityParams }) {
  const [actor, members] = await Promise.all([getDashboardActor(), db.members()]);
  const team = members.filter((m) => isAdmin(m)).sort((a, b) => (a.role === "owner" ? -1 : b.role === "owner" ? 1 : 0));
  const here = `/admin?${new URLSearchParams({ view, ...(sp.filter ? { filter: sp.filter } : {}), ...(sp.q ? { q: sp.q } : {}), ...(sp.cat ? { cat: sp.cat } : {}) })}`;

  if (!actor) {
    return (
      <>
        <Banner msg={sp.msg} err={sp.err} back={here} />
        <section className={`${card} mt-6 p-5 sm:p-7`} aria-labelledby="who-h">
          <h2 id="who-h" className={h2}>Who&apos;s using the dashboard?</h2>
          <p className="mt-1 max-w-2xl text-plum-700">Tap your name. This puts the right name on every change in the activity log, so you can always see who did what. You can switch any time.</p>
          <div className="mt-5">
            <WhoChooser team={team} back={here} />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <WhoBar actor={actor} team={team} back={here} />
      <Banner msg={sp.msg} err={sp.err} undo={sp.undo} back={here} />
      {view === "community-members" ? (
        <CommunityMembers actor={actor} filter={sp.filter} q={sp.q} />
      ) : view === "community-posts" ? (
        <CommunityPosts actor={actor} cat={sp.cat} />
      ) : view === "community-classroom" ? (
        <CommunityClassroom actor={actor} />
      ) : view === "community-calendar" ? (
        <CommunityCalendar actor={actor} />
      ) : view === "community-plans" ? (
        <CommunityPlans actor={actor} />
      ) : view === "community-settings" ? (
        <CommunitySettings actor={actor} />
      ) : view === "community-log" ? (
        <CommunityLog actor={actor} />
      ) : (
        <CommunityHome actor={actor} />
      )}
    </>
  );
}
