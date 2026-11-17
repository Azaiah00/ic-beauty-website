import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { InboxTabs } from "@/components/community/InboxTabs";
import { AutoRefresh, MessageBox } from "@/components/community/inbox";
import { Empty, LockNote, MemberAvatar, PageHead, RichText, card, timeAgo } from "@/components/community/ui";
import { firstName } from "@/lib/community/config";
import { check, isStaff } from "@/lib/community/permissions";
import { ACTIONS } from "@/lib/server/community/actions";
import { inboxCounts, memberMap, threadsFor } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Messages" };
export const dynamic = "force-dynamic";

/** Simple 1:1 messages. No real-time: the page refreshes itself every 30 seconds while it is open. */
export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ thread?: string }> }) {
  const actor = await requireMember();
  const sp = await searchParams;
  const now = new Date();
  const [members, threads] = await Promise.all([memberMap(), threadsFor(actor.id)]);
  const staff = isStaff(actor);
  const own = `team:${actor.id}`;

  // Which conversation is open (a dm id is always written with the two ids in order).
  let open = sp.thread ?? "";
  if (open.startsWith("dm:")) open = `dm:${open.split(":").slice(1).sort().join(":")}`;
  const mine = open === own || (open.startsWith("team:") && staff) || (open.startsWith("dm:") && open.split(":").includes(actor.id));
  if (open && !mine) open = "";

  const otherId = open.startsWith("team:") ? open.slice(5) : open.split(":").slice(1).find((x) => x !== actor.id) ?? "";
  const other = members.get(otherId);
  const toTeam = open === own;
  const title = toTeam ? "Iisha's team" : other?.name ?? "";
  const canSend = open ? await ACTIONS["message.send"].allow({ actor, args: { thread: open }, now, authed: false }) : null;
  if (open) await ACTIONS["message.read"].run({ actor, args: { thread: open }, now, authed: false });
  const msgs = open ? (await db.messages(open)).sort((a, b) => a.at.localeCompare(b.at)) : [];
  const counts = await inboxCounts(actor.id);
  const teamGate = check(actor, "message.team");
  const hasOwn = threads.some((t) => t.id === own);

  return (
    <div className="mx-auto max-w-[62rem]">
      <AutoRefresh />
      <PageHead icon="messages" title="Messages" lede={staff ? "Every conversation between members and the team. Anyone on the team can reply." : "A private line to Iisha's team."} />
      <InboxTabs on="messages" messages={open ? 0 : counts.messages} notifications={counts.notifications} />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-[19rem_minmax(0,1fr)]">
        <nav aria-label="Conversations" className={`${open ? "hidden md:block" : ""}`}>
          <ul className="space-y-2">
            {!staff && !hasOwn && teamGate.ok && (
              <li>
                <Link href={`/community/messages?thread=${own}`} className={`${card} flex min-h-16 items-center gap-3 p-3 hover:border-amethyst`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum-900 text-bone"><Users className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="font-medium text-plum-900">Message Iisha&apos;s team</span>
                </Link>
              </li>
            )}
            {threads.map((t) => (
              <li key={t.id}>
                <Link href={`/community/messages?thread=${encodeURIComponent(t.id)}`} aria-current={t.id === open ? "page" : undefined} className={`${card} flex min-h-16 items-center gap-3 p-3 hover:border-amethyst ${t.id === open ? "border-amethyst bg-white" : ""}`}>
                  {t.other ? <MemberAvatar m={t.other} level={false} /> : <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum-900 text-bone"><Users className="h-5 w-5" aria-hidden="true" /></span>}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate ${t.unread ? "font-medium text-plum-900" : "text-plum-900"}`}>{t.title}</span>
                      {t.unread > 0 && <span className="shrink-0 rounded-full bg-amethyst px-1.5 text-[0.7rem] font-semibold text-bone">{t.unread}<span className="sr-only"> new</span></span>}
                    </span>
                    <span className="block truncate text-[0.84rem] text-plum-700">{t.last.fromId === actor.id ? "You: " : ""}{t.last.body}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {threads.length === 0 && !teamGate.ok && <LockNote>{teamGate.message}</LockNote>}
          {threads.length === 0 && teamGate.ok && staff && <Empty title="No messages yet"><p>When a member writes to the team, it shows up here.</p></Empty>}
          {!staff && !teamGate.ok && threads.length > 0 && <p className="mt-3 rounded-xl bg-mist px-4 py-3 text-[0.9rem] text-plum-900">{teamGate.message} <Link href="/community/upgrade" className="font-medium text-amethyst underline underline-offset-2">See plans</Link></p>}
        </nav>

        <section aria-label={open ? `Conversation with ${title}` : "Conversation"} className={`${open ? "" : "hidden md:block"}`}>
          {!open ? (
            <Empty title="Choose a conversation"><p>Pick one on the left to read it.</p></Empty>
          ) : (
            <div className={`${card} flex flex-col`}>
              <header className="flex items-center gap-3 border-b border-plum-800/10 p-3 sm:p-4">
                <Link href="/community/messages" aria-label="Back to all conversations" className="flex h-11 w-11 items-center justify-center rounded-full text-plum-800 hover:bg-mist md:hidden"><ArrowLeft className="h-5 w-5" aria-hidden="true" /></Link>
                <h2 className="font-display text-[1.4rem] text-plum-900">{title || "Conversation"}</h2>
                {!toTeam && other && <Link href={`/community/members/${other.id}`} className="ml-auto inline-flex min-h-11 items-center text-[0.86rem] text-amethyst hover:underline">View profile</Link>}
              </header>
              <ol className="max-h-[55dvh] min-h-48 space-y-3 overflow-y-auto p-3 sm:p-5" data-lenis-prevent>
                {msgs.length === 0 && <li className="py-8 text-center text-plum-700">{toTeam ? "Say hello. Iisha's team usually replies within a day." : `This is the start of your conversation with ${firstName(title || "them")}.`}</li>}
                {msgs.map((m) => {
                  const from = members.get(m.fromId);
                  const me = m.fromId === actor.id;
                  return (
                    <li key={m.id} className={`flex ${me ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${me ? "bg-plum-900 text-bone" : from?.role === "owner" ? "border border-brass/60 bg-bone text-plum-950" : "bg-mist text-plum-950"}`}>
                        <p className={`text-[0.76rem] ${me ? "text-lilac" : "text-plum-700"}`}>{me ? "You" : from?.name.split(" (")[0] ?? "Member"} · {timeAgo(m.at, now)}</p>
                        <RichText text={m.body} className={me ? "[&_a]:text-brass-soft" : ""} />
                      </div>
                    </li>
                  );
                })}
              </ol>
              <footer className="border-t border-plum-800/10 p-3 sm:p-4">
                {canSend?.ok ? <MessageBox thread={open} to={toTeam ? "Iisha's team" : firstName(title || "them")} /> : <LockNote>{canSend && !canSend.ok ? canSend.message : "You can read this conversation, but not reply."}</LockNote>}
              </footer>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
