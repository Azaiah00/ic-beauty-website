import Link from "next/link";
import { Wordmark } from "@/components/brand/ICMark";
import { DISCLAIMER, business } from "@/lib/site";

/**
 * Funnel chrome: logo only, no navigation, no exit-intent popup.
 * A funnel page has ONE job (the next step), so nothing here competes with it.
 * Funnel pages are noindex and are not in the sitemap: they're shared as links (TikTok Live, IG bio, email).
 */
export default function FunnelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="absolute inset-x-0 top-0 z-30">
        <div className="container-x flex h-[76px] items-center justify-center sm:justify-start">
          <Wordmark markClass="h-9 w-auto text-amethyst" className="text-plum-900" />
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="border-t border-plum-800/10 bg-bone pb-28 pt-10 md:pb-10">
        <div className="container-x grid gap-4 text-[0.78rem] leading-relaxed text-plum-700/80">
          <p className="max-w-3xl">{DISCLAIMER}</p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <span>© {new Date().getFullYear()} {business.legalName}</span>
            <Link href="/policies" className="link-underline">Privacy &amp; policies</Link>
            <Link href="/" className="link-underline">icbeautyinyou.com</Link>
            <a href={business.phoneHref} className="link-underline">{business.phone}</a>
          </p>
        </div>
      </footer>
    </>
  );
}
