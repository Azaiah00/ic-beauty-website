import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ClipboardCheck, Phone } from "lucide-react";
import { img } from "@/lib/images";
import { business, links } from "@/lib/site";
import { shareMeta } from "@/lib/share";
import { InstagramIcon, TikTokIcon } from "@/components/ui/SocialIcons";

/**
 * /event: where the retractable banner QR lands (Nov 2026). Two choices, nothing else:
 * people ready to talk book the free discovery call on the spot; curious people take the
 * free checklist (which then nurtures them toward the call). The QR points at this URL,
 * never straight at Jotform, so the destination can change without reprinting the banner.
 */
export const metadata: Metadata = {
  ...shareMeta("/event"),
  title: "So glad we met: start here with Iisha",
  description: "Request your complimentary 15-minute discovery call with Iisha C. Silver, or grab the free Hair Health Red Flags checklist.",
  alternates: { canonical: "/event" },
  robots: { index: false, follow: true },
};

export default function EventPage() {
  const portrait = img("iisha-portrait");
  return (
    <section className="min-h-dvh bg-bone pb-16 pt-24 text-plum-900 sm:pt-28">
      <div className="mx-auto w-full max-w-xl px-4">
        <div className="flex flex-col items-center text-center">
          {portrait && (
            <span className="rise relative block h-24 w-24 overflow-hidden rounded-full ring-1 ring-brass/70 ring-offset-4 ring-offset-bone" style={{ ["--d" as string]: 0 }}>
              <Image src={portrait} alt="Iisha C. Silver" fill sizes="96px" priority className="origin-[70%_25%] scale-[1.6] object-cover" style={{ objectPosition: "72% 22%" }} />
            </span>
          )}
          <p className="eyebrow rise mt-6 text-amethyst" style={{ ["--d" as string]: 1 }}>So glad we met</p>
          <h1 className="rise mt-3 font-display text-[clamp(2.3rem,1.7rem+3vw,3.2rem)] leading-[1.05]" style={{ ["--d" as string]: 2 }}>
            Hair loss starts deeper than <span className="italic-accent text-amethyst">the scalp.</span>
          </h1>
          <p className="rise mt-4 max-w-md text-plum-700" style={{ ["--d" as string]: 3 }}>
            Pick where you are right now. Either way, Iisha C. Silver will meet you there.
          </p>
        </div>

        <ul className="mt-10 space-y-4">
          <li className="rise" style={{ ["--d" as string]: 4 }}>
            <Link href="/book" className="group flex items-center gap-4 rounded-card bg-plum-900 p-5 text-bone shadow-lg shadow-plum-900/20 transition hover:bg-plum-800 sm:p-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-bone text-plum-900"><CalendarCheck className="h-6 w-6" aria-hidden="true" strokeWidth={1.4} /></span>
              <span className="flex-1">
                <span className="eyebrow block text-brass-soft">I&apos;m ready to talk</span>
                <span className="mt-1 block font-display text-[1.45rem] leading-tight">Request my complimentary discovery call</span>
                <span className="mt-1 block text-[0.9rem] text-bone/75">About 2 minutes. Virtual clients welcome.</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </li>
          <li className="rise" style={{ ["--d" as string]: 5 }}>
            <Link href="/hair-love" className="group flex items-center gap-4 rounded-card border border-plum-900/15 bg-paper p-5 transition hover:border-plum-900/40 sm:p-6">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-brass/60 text-brass-deep"><ClipboardCheck className="h-6 w-6" aria-hidden="true" strokeWidth={1.4} /></span>
              <span className="flex-1">
                <span className="eyebrow block text-amethyst">I&apos;m just curious</span>
                <span className="mt-1 block font-display text-[1.45rem] leading-tight">Get the free Hair Health Red Flags checklist</span>
                <span className="mt-1 block text-[0.9rem] text-plum-700">A 5-minute self-check, sent straight to your inbox.</span>
              </span>
              <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </li>
        </ul>

        <div className="mt-10 flex flex-col items-center gap-4 text-center text-[0.92rem] text-plum-700">
          <p>
            Already a client? <Link href="/book?service=all" className="font-medium text-plum-900 underline decoration-amethyst/40 underline-offset-4">Book your service</Link>
          </p>
          <a href={business.phoneHref} className="inline-flex min-h-11 items-center gap-2 hover:text-plum-900">
            <Phone className="h-4 w-4 text-amethyst" aria-hidden="true" /> Call or text {business.phone}
          </a>
          <ul className="flex gap-2" aria-label="Follow Iisha">
            {[
              { h: links.instagram, l: "Instagram", I: InstagramIcon },
              { h: links.tiktok, l: "TikTok", I: TikTokIcon },
            ].map(({ h, l, I }) => (
              <li key={l}>
                <a href={h} target="_blank" rel="noopener noreferrer" aria-label={`${l} (opens in a new tab)`} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-plum-900/20 hover:border-plum-900">
                  <I className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
