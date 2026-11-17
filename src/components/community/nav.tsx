"use client";

/** Community navigation: tabs under the top bar, and the bottom tab bar on phones. */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Link2, Check } from "lucide-react";
import { Icon3D, type IconName } from "./ui";

export type Tab = { href: string; label: string; icon?: IconName };

const on = (path: string, href: string) => (href === "/community" ? path === "/community" || path.startsWith("/community/post") : path.startsWith(href));

export function NavTabs({ tabs }: { tabs: Tab[] }) {
  const path = usePathname();
  return (
    <nav aria-label="Community sections" className="-mb-px overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <ul className="mx-auto flex w-full max-w-[76rem] gap-1 px-2 sm:px-4">
        {tabs.map((t) => {
          const active = on(path, t.href);
          return (
            <li key={t.href} className="shrink-0">
              <Link href={t.href} aria-current={active ? "page" : undefined} className={`group flex min-h-12 items-center gap-2 whitespace-nowrap border-b-2 px-3 text-[0.92rem] transition ${active ? "border-amethyst font-medium text-plum-900" : "border-transparent text-plum-700 hover:text-plum-900"}`}>
                {t.icon && <Icon3D name={t.icon} size={26} className={`transition-transform duration-300 group-hover:-translate-y-0.5 ${active ? "" : "opacity-80"}`} />}
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function MobileTabBar({ inbox }: { inbox: number }) {
  const path = usePathname();
  const items = [
    { href: "/community", label: "Feed", icon: "community" as IconName },
    { href: "/community/classroom", label: "Classroom", icon: "classroom" as IconName },
    { href: "/community/calendar", label: "Calendar", icon: "calendar" as IconName },
    { href: "/community/notifications", label: "Inbox", icon: "inbox" as IconName, badge: inbox },
    { href: "/community/settings", label: "Me", icon: "key" as IconName },
  ];
  return (
    <nav aria-label="Community" className="fixed inset-x-0 bottom-0 z-40 border-t border-plum-800/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon, badge }) => {
          const active = href === "/community/notifications" ? path.startsWith(href) || path.startsWith("/community/messages") : on(path, href);
          return (
            <li key={href}>
              <Link href={href} aria-current={active ? "page" : undefined} className={`relative flex min-h-[3.75rem] flex-col items-center justify-center gap-0.5 text-[0.68rem] font-medium tracking-wide ${active ? "text-amethyst" : "text-plum-700"}`}>
                <span className="relative">
                  <Icon3D name={icon} size={28} className={active ? "" : "opacity-75"} />
                  {badge ? <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amethyst px-1 text-[0.6rem] font-semibold text-bone">{badge > 9 ? "9+" : badge}</span> : null}
                </span>
                {label}
                {badge ? <span className="sr-only">, {badge} new</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** "Invite a friend": copies the public About page link. */
export function CopyLink({ url, label = "Invite a friend", className }: { url: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setDone(true);
          setTimeout(() => setDone(false), 2500);
        } catch {
          window.prompt("Copy this link", url);
        }
      }}
    >
      {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Link2 className="h-4 w-4" aria-hidden="true" />}
      <span aria-live="polite">{done ? "Link copied" : label}</span>
    </button>
  );
}
