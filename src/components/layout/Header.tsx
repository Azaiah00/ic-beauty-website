"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Phone } from "lucide-react";
import { nav, bookHref, business } from "@/lib/site";

export function Header({ mark }: { mark: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > 500 && y > last + 4);
      if (y < last - 4) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const lenis = window.__lenis;
    if (open) {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    } else {
      lenis?.start();
      document.body.style.overflow = "";
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-plum-900 focus:px-4 focus:py-2 focus:text-bone">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-plum-900 transition-[transform,background,box-shadow] duration-500 ease-[var(--ease-lens)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        } ${scrolled && !open ? "bg-bone/90 shadow-[0_1px_0_rgba(58,29,69,0.08)] backdrop-blur-md" : "bg-transparent"}`}
      >
        <div className="container-x flex h-[84px] items-center justify-between gap-6">
          <Link href="/" className="shrink-0" title="I.C. Beauty home">
            {mark}
          </Link>
          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-8">
              {nav.map((n) => {
                const active = pathname === n.href || pathname.startsWith(n.href + "/");
                return (
                  <li key={n.href}>
                    <Link
                      href={n.href}
                      aria-current={active ? "page" : undefined}
                      className={`link-underline py-1 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] transition-colors hover:text-amethyst ${active ? "text-amethyst" : "text-plum-900"}`}
                    >
                      {n.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="flex items-center gap-2">
            <a href={business.phoneHref} className="hidden h-11 w-11 items-center justify-center rounded-full border border-plum-900/20 transition hover:border-plum-900 sm:inline-flex" aria-label={`Call ${business.phone}`}>
              <Phone className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
            </a>
            <Link href={bookHref} className="hidden h-11 items-center rounded-pill min-[380px]:inline-flex bg-plum-900 px-5 font-sans text-[0.7rem] font-medium uppercase tracking-[0.16em] text-bone transition hover:bg-amethyst">
              Book<span className="hidden sm:inline">&nbsp;a consultation</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-plum-900/20 xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} /> : <Menu className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 bg-bone text-plum-900 transition-[opacity,visibility] duration-500 xl:hidden ${open ? "visible opacity-100" : "invisible opacity-0"}`}
        aria-hidden={!open}
        data-lenis-prevent
      >
        <div className="container-x flex h-full flex-col overflow-y-auto pb-10 pt-28">
          <ul className="flex flex-col">
            {[{ label: "Home", href: "/" }, ...nav, { label: "FAQ", href: "/faq" }, { label: "Contact", href: "/contact" }].map((n, i) => (
              <li key={n.href} style={{ transitionDelay: open ? `${60 + i * 40}ms` : "0ms" }} className={`transition-[opacity,transform] duration-700 ease-[var(--ease-lens)] ${open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
                <Link href={n.href} tabIndex={open ? 0 : -1} className="block border-b border-plum-900/10 py-3.5 font-display text-[2.1rem] leading-none">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href={bookHref} tabIndex={open ? 0 : -1} className="mt-8 inline-flex h-14 items-center justify-center rounded-pill bg-plum-900 px-8 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-bone">
            Book a free discovery call
          </Link>
          <div className="mt-auto pt-10 text-plum-700">
            <p className="eyebrow text-amethyst">Visit the studio</p>
            <p className="mt-2">{business.address.street}, {business.address.city}, VA {business.address.postalCode}</p>
            <a tabIndex={open ? 0 : -1} href={business.phoneHref} className="mt-1 block text-plum-900">{business.phone}</a>
          </div>
        </div>
      </div>
    </>
  );
}
