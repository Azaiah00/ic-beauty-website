import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { ICMark } from "@/components/brand/ICMark";
import { PortalProvider } from "@/components/portal/PortalState";
import { PortalSidebar, PortalTabBar } from "@/components/portal/PortalNav";
import { membership } from "@/lib/portal/data";

export const metadata: Metadata = {
  title: { default: "Member portal", template: `%s | ${membership.name}` },
  robots: { index: false, follow: false },
};

/** Member portal shell — demo mode (sample data, memory only). // TODO: Supabase Auth guard + approval step */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalProvider>
      <div className="flex min-h-dvh bg-bone">
        <PortalSidebar />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-center gap-2 bg-plum-900 px-4 py-2 text-center text-[0.75rem] text-lilac">
            <Info className="h-3.5 w-3.5 shrink-0 text-brass-soft" aria-hidden="true" />
            Demo preview with sample member data. Nothing is saved after you refresh.
          </div>
          <header className="flex items-center justify-between border-b border-plum-800/10 bg-paper px-4 py-3 lg:hidden">
            <Link href="/portal" className="flex items-center gap-2.5">
              <ICMark className="h-8 w-auto text-amethyst" title="" />
              <span className="font-display text-[1.15rem] text-plum-900">{membership.name}</span>
            </Link>
          </header>
          <main id="main" className="mx-auto w-full max-w-6xl px-4 pb-28 pt-8 sm:px-8 lg:pb-16 lg:pt-12">{children}</main>
        </div>
      </div>
      <PortalTabBar />
    </PortalProvider>
  );
}
