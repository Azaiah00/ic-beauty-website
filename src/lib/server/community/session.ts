/**
 * Who is looking at the community right now. Server-only.
 *  - getActor(): the signed-in member (demo: the persona picked on /community/login), or null for a guest.
 *  - requireMember(): for pages. Sends guests to sign in, pending people to the waiting page, paused people
 *    to the paused page.
 *  - getDashboardActor(): for the owner dashboard, the team member chosen in "Who's using the dashboard".
 */
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isAdmin as hasDashboardPassword } from "@/lib/server/auth";
import { isLive, type Actor } from "@/lib/community/permissions";
import type { Member } from "@/lib/community/types";
import { db } from "./store";
import { COMM_COOKIE, WHO_COOKIE, readMember } from "./token";

export const getActor = cache(async (): Promise<Actor> => {
  const id = readMember((await cookies()).get(COMM_COOKIE)?.value);
  if (!id) return null;
  return db.member(id);
});

export async function requireMember(): Promise<Member> {
  const a = await getActor();
  if (!a || a.state === "removed") redirect("/community/login");
  if (a.state === "pending") redirect("/community/pending");
  if (a.state === "paused") redirect("/community/paused");
  if (!isLive(a)) redirect("/community/login");
  return a;
}

/**
 * The team member acting in the owner dashboard. The dashboard still uses one shared password, so the
 * "Who's using the dashboard" choice is what attributes each change in the activity log.
 * // TODO: individual team logins with roles when Auth goes live.
 */
export const getDashboardActor = cache(async (): Promise<Actor> => {
  if (!(await hasDashboardPassword())) return null;
  const who = (await cookies()).get(WHO_COOKIE)?.value;
  const m = who ? await db.member(who) : null;
  return m && (m.role === "owner" || m.role === "admin") && isLive(m) ? m : null;
});
