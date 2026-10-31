import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ExitIntent } from "@/components/ExitIntent";
import { Wordmark } from "@/components/brand/ICMark";

/** Main website chrome (header, footer, exit-intent). Funnel pages live in (funnel) and skip all of this. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header mark={<Wordmark markClass="h-10 w-auto text-amethyst" className="text-plum-900" />} />
      <main id="main">{children}</main>
      <Footer />
      <ExitIntent />
    </>
  );
}
