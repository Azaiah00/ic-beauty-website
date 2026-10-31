"use client";

import { useMemberName } from "./useMemberName";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PlayCircle, LineChart, Stethoscope, Download, LogOut } from "lucide-react";
import { ICMark } from "@/components/brand/ICMark";
import { demoMember, membership } from "@/lib/portal/data";

const items = [
  { href: "/portal", label: "Home", Icon: Home },
  { href: "/portal/lessons", label: "Lessons", Icon: PlayCircle },
  { href: "/portal/progress", label: "Progress", Icon: LineChart },
  { href: "/portal/treatments", label: "My care", Icon: Stethoscope },
  { href: "/portal/downloads", label: "Downloads", Icon: Download },
];

function active(path: string, href: string) {
  return href === "/portal" ? path === "/portal" : path.startsWith(href);
}

export function PortalSidebar() {
  const memberName = useMemberName();
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-plum-800/10 bg-plum-950 px-5 py-7 text-lilac lg:flex">
      <Link href="/portal" className="flex items-center gap-3 px-2">
        <ICMark className="h-9 w-auto text-brass-soft" title="" />
        <span className="leading-tight">
          <span className="block font-display text-[1.25rem] text-bone">{membership.name}</span>
          <span className="eyebrow text-[0.6rem] text-lilac/70">Member portal</span>
        </span>
      </Link>
      <nav aria-label="Portal" className="mt-10">
        <ul className="grid gap-1">
          {items.map(({ href, label, Icon }) => {
            const on = active(path, href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={on ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] transition ${on ? "bg-plum-800 text-bone" : "text-lilac hover:bg-plum-900 hover:text-bone"}`}
                >
                  <Icon className={`h-[18px] w-[18px] ${on ? "text-brass-soft" : ""}`} aria-hidden="true" strokeWidth={1.6} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto rounded-xl border border-plum-800 p-4">
        <p className="text-[0.85rem] text-bone">{memberName}</p>
        <p className="text-[0.75rem] text-lilac/70">{demoMember.plan} member · Week {demoMember.currentWeek}</p>
        <Link href="/circle" className="mt-3 inline-flex items-center gap-2 text-[0.75rem] text-lilac hover:text-bone">
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" /> Exit demo
        </Link>
      </div>
    </aside>
  );
}

export function PortalTabBar() {
  const path = usePathname();
  return (
    <nav aria-label="Portal" className="fixed inset-x-0 bottom-0 z-40 border-t border-plum-800/10 bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, Icon }) => {
          const on = active(path, href);
          return (
            <li key={href}>
              <Link href={href} aria-current={on ? "page" : undefined} className={`flex flex-col items-center gap-1 py-2.5 text-[0.66rem] font-medium tracking-wide ${on ? "text-amethyst" : "text-plum-700"}`}>
                <Icon className="h-5 w-5" aria-hidden="true" strokeWidth={on ? 2 : 1.6} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
