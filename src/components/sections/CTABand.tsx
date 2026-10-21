import Image from "next/image";
import { Btn } from "@/components/ui/Btn";
import { ICMark } from "@/components/brand/ICMark";
import { bookHref } from "@/lib/site";
import { img } from "@/lib/images";

export function CTABand({
  title = (
    <>
      The sooner you start, <span className="italic-accent text-brass-soft">the sooner you heal.</span>
    </>
  ),
  body = "Book your complimentary 15-minute discovery call. A compassionate, no-pressure conversation, because you don't have to do this alone.",
  primary = { label: "Book my free discovery call", href: bookHref },
  secondary = { label: "Take the Scalp Self-Check", href: "/scalp-check" },
  image = "studio",
}: {
  title?: React.ReactNode;
  body?: string;
  primary?: { label: string; href: string };
  secondary?: { label: string; href: string } | null;
  image?: string;
}) {
  const src = img(image);
  return (
    <section className="relative overflow-hidden bg-plum-950 py-28 text-bone sm:py-36">
      {src && (
        <div className="absolute inset-0">
          <Image src={src} alt="" fill sizes="100vw" className="object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-plum-950/70 via-plum-950/55 to-plum-950/85" />
        </div>
      )}
      <div className="container-x relative flex flex-col items-center text-center">
        <ICMark className="h-14 w-auto text-lilac" title="" />
        <h2 className="mt-8 max-w-4xl text-display" data-reveal>{title}</h2>
        <p className="mt-6 max-w-xl text-lede text-lilac" data-reveal>{body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3" data-reveal>
          <Btn href={primary.href} variant="light" size="lg">{primary.label}</Btn>
          {secondary && <Btn href={secondary.href} variant="outline-light" size="lg">{secondary.label}</Btn>}
        </div>
      </div>
    </section>
  );
}
