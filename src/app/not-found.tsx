import { ICMark } from "@/components/brand/ICMark";
import { Btn } from "@/components/ui/Btn";

export default function NotFound() {
  return (
    <section className="flex min-h-[90dvh] items-center bg-bone pt-24">
      <div className="container-x flex flex-col items-center text-center">
        <ICMark className="h-24 w-auto text-amethyst" title="" />
        <p className="eyebrow mt-8 text-plum-700">404</p>
        <h1 className="mt-4 text-display text-plum-900">This page has <span className="italic-accent text-amethyst">moved on.</span></h1>
        <p className="mt-5 max-w-md text-plum-700">The page may have changed when the site was refreshed. Let&apos;s get you where you were going.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Btn href="/">Back home</Btn>
          <Btn href="/book" variant="outline">Book a discovery call</Btn>
        </div>
      </div>
    </section>
  );
}
