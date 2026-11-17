import type { Metadata } from "next";
import Link from "next/link";
import { CheckCheck } from "lucide-react";
import { WithRail } from "@/components/community/Shell";
import { Empty, Icon3D, PageHead, btnGhost, card, timeAgo, type IconName } from "@/components/community/ui";
import type { Notification } from "@/lib/community/types";
import { InboxTabs } from "@/components/community/InboxTabs";
import { inboxCounts } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

const ICON: Record<Notification["kind"], IconName> = { reply: "community", mention: "question", like: "heart", approval: "check", plan: "crown", lesson: "classroom", event: "calendar", level: "leaderboards", message: "messages", nudge: "sparkle", team: "megaphone" };

export default async function NotificationsPage() {
  const actor = await requireMember();
  const [list, counts] = await Promise.all([db.notifications(actor.id), inboxCounts(actor.id)]);
  const now = new Date();
  const sorted = [...list].sort((a, b) => b.at.localeCompare(a.at));
  return (
    <WithRail actor={actor}>
      <PageHead icon="inbox" title="Notifications">
        {counts.notifications > 0 && (
          <form method="post" action="/api/community/notif.read">
            <input type="hidden" name="back" value="/community/notifications" />
            <button className={btnGhost}><CheckCheck className="h-4 w-4" aria-hidden="true" /> Mark all read</button>
          </form>
        )}
      </PageHead>
      <InboxTabs on="notifications" {...counts} />
      {sorted.length === 0 ? (
        <Empty title="Nothing new yet">
          <p>When someone replies, likes your post or Iisha answers your question, you&apos;ll see it here.</p>
        </Empty>
      ) : (
        <ul className="space-y-2">
          {sorted.map((n) => {
            const icon = ICON[n.kind] ?? "inbox";
            return (
              <li key={n.id}>
                <Link href={n.href} className={`${card} flex min-h-16 items-center gap-4 p-4 transition hover:border-amethyst ${n.read ? "" : "border-amethyst/50 bg-white"}`}>
                  <Icon3D name={icon} size={44} className={n.read ? "opacity-60" : ""} />
                  <span className="min-w-0 flex-1">
                    <span className={`block ${n.read ? "text-plum-800" : "font-medium text-plum-900"}`}>{n.text}</span>
                    <span className="block text-[0.82rem] text-plum-700">{timeAgo(n.at, now)}{n.read ? "" : " · New"}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </WithRail>
  );
}
