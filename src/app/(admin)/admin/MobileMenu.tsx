"use client";

/** Phone + tablet navigation for the owner dashboard: a hamburger button that drops down every section. */
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  LayoutDashboard, Sparkles, ClipboardCheck, Users, ScanSearch, MessageSquare, Mic, GraduationCap, ShoppingBag, Newspaper, CalendarCheck,
  Inbox, Menu, X, Globe, LogOut, ChevronDown, FolderOpen, Store,
} from "lucide-react";

const ICONS: Record<string, typeof Sparkles> = {
  "": LayoutDashboard,
  __files: FolderOpen,
  __shop: Store,
  "pilot-application": Sparkles,
  "hair-love-optin": ClipboardCheck,
  "circle-join": Users,
  "scalp-check": ScanSearch,
  "discovery-call": CalendarCheck,
  contact: MessageSquare,
  "speaking-inquiry": Mic,
  "class-waitlist": GraduationCap,
  "product-request": ShoppingBag,
  newsletter: Newspaper,
};

export type MenuItem = { form: string; label: string; count?: number; fresh?: number };

export function MobileMenu({ items, current }: { items: MenuItem[]; current: string }) {
  const [open, setOpen] = useState(false);
  const params = useSearchParams();
  const panel = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  // Close whenever she picks a section.
  useEffect(() => setOpen(false), [params]);

  // Close on Escape or a tap outside; lock page scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(false), btn.current?.focus());
    const onDown = (e: PointerEvent) => {
      if (!panel.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const currentItem = items.find((i) => i.form === current) ?? items[0];
  const CurIcon = ICONS[currentItem.form] ?? Inbox;

  return (
    <div className="lg:hidden">
      {open && <div className="fixed inset-0 bg-plum-950/45 backdrop-blur-[2px]" aria-hidden="true" />}
      <button
        ref={btn}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="admin-menu"
        className="relative flex min-h-12 w-full items-center gap-3 rounded-2xl bg-white/8 px-4 text-left text-bone transition hover:bg-white/12"
      >
        <CurIcon className="h-[18px] w-[18px] shrink-0 text-brass-soft" strokeWidth={1.6} aria-hidden="true" />
        <span className="flex-1 truncate text-[0.95rem]">{currentItem.label}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-bone/60 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
        <span className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8a55a6,#6E3F86)]">
          {open ? <X className="h-[18px] w-[18px]" aria-hidden="true" /> : <Menu className="h-[18px] w-[18px]" aria-hidden="true" />}
        </span>
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
      </button>

      <div
        ref={panel}
        id="admin-menu"
        hidden={!open}
        className="absolute inset-x-0 top-full mt-2 max-h-[calc(100dvh-7.5rem)] overflow-y-auto rounded-[1.4rem] bg-plum-950 p-2 text-bone shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 sm:left-auto sm:right-4 sm:w-80"
      >
        <nav aria-label="Dashboard sections">
          <ul className="space-y-0.5">
            {items.map((i, idx) => {
              const Icon = ICONS[i.form] ?? Inbox;
              const active = i.form === current;
              return (
                <li key={i.form || "overview"}>
                  {idx === 2 && <p className="px-3 pb-1 pt-3 text-[0.62rem] uppercase tracking-[0.22em] text-bone/40">Your people</p>}
                  <Link
                    href={i.form === "__files" ? "/admin?view=files" : i.form === "__shop" ? "/admin?view=shop" : i.form ? `/admin?form=${i.form}` : "/admin"}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-[0.95rem] transition ${active ? "bg-amethyst text-bone" : "text-bone/85 hover:bg-white/8"}`}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
                    <span className="flex-1 truncate">{i.label}</span>
                    {i.fresh ? <span className="rounded-full bg-brass-soft px-2 text-[0.7rem] font-medium text-plum-950">{i.fresh} new</span> : null}
                    {i.count ? <span className={`rounded-full px-2 text-[0.72rem] tabular-nums ${active ? "bg-bone/25" : "bg-white/10"}`}>{i.count}</span> : null}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-2 space-y-0.5 border-t border-white/10 pt-2">
            <a href="/" target="_blank" rel="noopener" className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-[0.95rem] text-bone/85 hover:bg-white/8">
              <Globe className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" /> View website
            </a>
            <form method="post" action="/api/admin/logout">
              <button className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-[0.95rem] text-[#e8a4a0] hover:bg-white/8">
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </nav>
      </div>
    </div>
  );
}
