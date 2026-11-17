/** Directory card + the small pills shared with the profile page. */
import Link from "next/link";
import { MapPin } from "lucide-react";
import { MemberAvatar, MemberName, Pill, PlanPill, card } from "@/components/community/ui";
import { levelFor } from "@/lib/community/config";
import { effectivePlan } from "@/lib/community/permissions";
import type { Member, Settings } from "@/lib/community/types";

const ROLE = { owner: "Owner", admin: "Admin", moderator: "Moderator" } as const;
export const joined = (iso: string) => new Date(iso).toLocaleDateString("en-US", { timeZone: "America/New_York", month: "short", year: "numeric" });

/** Plan pills are private unless the member shows theirs, or the viewer is on the team. */
export function MemberPills({ m, s, staffView, online }: { m: Member; s: Settings; staffView: boolean; online: boolean }) {
  const plan = effectivePlan(m);
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {m.role !== "member" ? <Pill tone="dark">{ROLE[m.role]}</Pill> : (m.showPlan || staffView) && <PlanPill plan={plan} name={s.plans[plan].name} />}
      {m.isClient && <Pill tone="brass">Client of Iisha</Pill>}
      {online && <Pill tone="good">Online now</Pill>}
      {staffView && m.state !== "active" && <Pill tone="warn">{m.state.replace("_", " ")}</Pill>}
    </span>
  );
}

export function MemberCard({ m, s, staffView, online }: { m: Member; s: Settings; staffView: boolean; online: boolean }) {
  const lv = levelFor(m.points).level;
  return (
    <li>
      <Link href={`/community/members/${m.id}`} className={`${card} flex h-full min-h-28 gap-4 p-4 transition hover:border-amethyst sm:p-5`}>
        <MemberAvatar m={m} size={52} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[1.05rem] font-medium text-plum-900"><MemberName m={m} /></span>
          <span className="block text-[0.84rem] text-plum-700">
            {m.role === "member" ? `Level ${lv} · ${s.levelNames[lv - 1]} · ` : ""}Joined {joined(m.joinedAt)}
          </span>
          {m.city && (
            <span className="mt-0.5 flex items-center gap-1 text-[0.84rem] text-plum-700">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> {m.city}
            </span>
          )}
          {m.bio && <span className="mt-1.5 line-clamp-2 block text-[0.92rem] text-plum-800">{m.bio}</span>}
          <span className="mt-2 block"><MemberPills m={m} s={s} staffView={staffView} online={online} /></span>
        </span>
      </Link>
    </li>
  );
}
