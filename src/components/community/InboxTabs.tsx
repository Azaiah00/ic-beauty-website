/** Notifications | Messages switch at the top of the inbox pages. */
import Link from "next/link";

export function InboxTabs({ on, messages, notifications }: { on: "notifications" | "messages"; messages: number; notifications: number }) {
  const tab = (active: boolean) => `inline-flex min-h-11 items-center gap-2 rounded-pill px-5 text-[0.92rem] ${active ? "bg-plum-900 text-bone" : "text-plum-900 hover:bg-mist"}`;
  const n = (v: number) => (v ? <span className="rounded-full bg-amethyst px-1.5 text-[0.7rem] font-semibold text-bone">{v}</span> : null);
  return (
    <div className="mb-5 inline-flex rounded-pill border border-plum-800/15 bg-white p-1" role="group" aria-label="Inbox">
      <Link href="/community/notifications" aria-current={on === "notifications" ? "page" : undefined} className={tab(on === "notifications")}>Notifications {n(notifications)}</Link>
      <Link href="/community/messages" aria-current={on === "messages" ? "page" : undefined} className={tab(on === "messages")}>Messages {n(messages)}</Link>
    </div>
  );
}
