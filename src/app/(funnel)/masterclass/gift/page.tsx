import type { Metadata } from "next";
import Image from "next/image";
import { Download, Gift } from "lucide-react";
import { shareMeta } from "@/lib/share";

/**
 * /masterclass/gift: private download page for H.A.I.R. Shift Masterclass participants.
 * Linked only from the QR on Iisha's Zoom slide (?src=qr), so only participants get it.
 * noindex, not in the sitemap, disallowed in robots. No date or time (Iisha's rule for the masterclass).
 */
export const metadata: Metadata = {
  ...shareMeta("/masterclass/gift"),
  title: "Your H.A.I.R. Shift Masterclass gift",
  description: "The H.A.I.R. Shift: Your Hair Decision Cheat Sheet, a free gift for masterclass participants.",
  robots: { index: false, follow: false },
};

const ERRORS: Record<string, string> = {
  name: "Please add your first name.",
  email: "Please check your email address.",
  save: "Something went wrong on our end. Please try again.",
  form: "Something went wrong. Please try again.",
};

export default async function GiftPage({ searchParams }: { searchParams: Promise<{ src?: string; err?: string; name?: string }> }) {
  const { src, err, name } = await searchParams;
  const from = src === "qr" || src === "email" ? src : "page";
  const error = err ? ERRORS[err] ?? ERRORS.form : "";
  const renderedAt = String(Date.now());
  const field = "min-h-12 w-full rounded-full border border-plum-800/15 bg-white px-5 text-[1rem] text-plum-900 placeholder:text-plum-700/60 focus:border-amethyst focus:outline-none";
  return (
    <section className="min-h-dvh bg-bone pb-16 pt-24 text-plum-900 sm:pt-28">
      <div className="mx-auto grid w-full max-w-4xl items-center gap-10 px-4 md:grid-cols-[1fr_minmax(0,340px)]">
        <div className="text-center md:text-left">
          <p className="eyebrow rise inline-flex items-center gap-2 text-amethyst" style={{ ["--d" as string]: 0 }}>
            <Gift className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} /> Your masterclass gift
          </p>
          <h1 className="rise mt-3 font-display text-[clamp(2.2rem,1.6rem+3vw,3.2rem)] leading-[1.04]" style={{ ["--d" as string]: 1 }}>
            The H.A.I.R. Shift <span className="italic-accent block text-amethyst">Your Hair Decision Cheat Sheet</span>
          </h1>
          <p className="rise mt-4 font-display text-[1.25rem] italic text-brass-deep" style={{ ["--d" as string]: 2 }}>
            9 Questions to Ask Before You Buy, Style, or Second-Guess Your Hair
          </p>
          <p className="rise mt-5 max-w-lg text-plum-700 md:max-w-none" style={{ ["--d" as string]: 3 }}>
            Thank you for being part of the H.A.I.R. Shift Masterclass. Enter your name and email to get your two-page cheat sheet, then print it or save it to your phone, and keep it close for your next hair decision.
          </p>
          <form method="post" action="/api/gift/hair-shift" className="rise mx-auto mt-8 grid max-w-md gap-3 md:mx-0" style={{ ["--d" as string]: 4 }}>
            <input type="hidden" name="src" value={from} />
            <input type="hidden" name="t" value={renderedAt} />
            <p className="hidden" aria-hidden="true"><label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>
            <label className="sr-only" htmlFor="gift-name">First name</label>
            <input id="gift-name" name="name" required autoComplete="given-name" placeholder="First name" defaultValue={name ?? ""} className={field} />
            <label className="sr-only" htmlFor="gift-email">Email</label>
            <input id="gift-email" name="email" type="email" required autoComplete="email" inputMode="email" placeholder="Email" className={field} />
            {error && <p role="alert" className="text-[0.88rem] text-[#9b2c2c]">{error}</p>}
            <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-plum-900 px-8 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-bone transition hover:bg-amethyst">
              <Download className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} /> Get my cheat sheet (PDF)
            </button>
            <p className="text-[0.8rem] text-plum-700/80">Free for H.A.I.R. Shift Masterclass participants. We&apos;ll also email you a copy so you always have it.</p>
          </form>
        </div>
        <div className="rise mx-auto w-full max-w-[340px]" style={{ ["--d" as string]: 3 }}>
          <Image
            src="/images/hair-shift-cheat-sheet-preview.webp"
            alt="Page 1 of The H.A.I.R. Shift: Your Hair Decision Cheat Sheet"
            width={850}
            height={1100}
            priority
            className="h-auto w-full rounded-2xl shadow-[0_30px_60px_-30px_rgba(36,19,42,0.55)] ring-1 ring-plum-900/10"
          />
        </div>
      </div>
    </section>
  );
}
