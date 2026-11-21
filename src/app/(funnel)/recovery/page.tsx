import type { Metadata } from "next";
import { CalendarCheck, Mail, Video } from "lucide-react";
import { recoveryPlans, recoveryCreditCents, recoveryFullTodayCents, usdWhole } from "@/lib/site";
import { RecoveryChooser } from "@/components/funnel/RecoveryChooser";
import { shareMeta } from "@/lib/share";

/**
 * /recovery: "Your Recovery. Your Way." (Iisha, 2026-11-21). The three recovery programs from her printed
 * sheet, each payable as a deposit or in full through Square (money goes to her Square account).
 * The printed sheet's QR encodes https://www.icbeautyinyou.com/recovery: never rename or remove this route.
 * Visitors must pick a program, deposit or full, and agree to the terms before checkout (<RecoveryChooser/>);
 * checkout is a POST form (the optional confirmation email never goes in a URL).
 */
export const metadata: Metadata = {
  title: "Your Recovery. Your Way.",
  description: "Choose the level of support that fits your journey: Guided, Supported or Exclusive Recovery with Iisha C. Silver. Secure your spot with a deposit or pay in full.",
  alternates: { canonical: "/recovery" },
  robots: { index: false, follow: true },
  ...shareMeta("/recovery"),
};

const NEXT = [
  { icon: Mail, text: "Your customized care plan, sent by email" },
  { icon: Video, text: "A Recovery Roadmap Zoom to walk through it together" },
  { icon: CalendarCheck, text: "Your program appointments, scheduled with you" },
];

const NOTICE: Record<string, string> = {
  unavailable: "Online checkout is being set up. Please call or text Iisha to enroll.",
  error: "Checkout didn't open. Please try again, or call or text Iisha to enroll.",
  missing: "Please choose a program and payment option below.",
  terms: "Please review and agree to the recovery agreement before checkout.",
  email: "Please check the email address for your confirmation, or untick the box.",
};

export default async function RecoveryPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  const notice = checkout ? NOTICE[checkout] : undefined;
  return (
    <section className="min-h-dvh bg-paper pb-16 pt-24 text-plum-900 sm:pt-28">
      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="text-center">
          <p className="eyebrow rise text-amethyst" style={{ ["--d" as string]: 0 }}>Hair wellness &middot; Personalized recovery</p>
          <h1 className="rise mt-3 font-display text-[clamp(2.4rem,1.6rem+3.6vw,3.8rem)] leading-[1.03]" style={{ ["--d" as string]: 1 }}>
            Your Recovery. <span className="italic-accent text-amethyst">Your Way.</span>
          </h1>
          <p className="rise mx-auto mt-4 max-w-lg text-plum-700" style={{ ["--d" as string]: 2 }}>Choose the level of support that fits your journey.</p>
        </div>

        {notice && (
          <p role="status" className="mx-auto mt-8 max-w-xl rounded-card border border-brass/40 bg-bone px-5 py-3 text-center text-[0.92rem] text-plum-800">{notice}</p>
        )}

        <div id="plans" className="mt-10 scroll-mt-24">
          <RecoveryChooser
            plans={recoveryPlans.map((p) => ({ id: p.id, num: p.num, name: p.name, term: p.term, support: p.support, blurb: p.blurb, full: usdWhole(p.fullCents), fullToday: usdWhole(recoveryFullTodayCents(p)), deposit: usdWhole(p.depositCents), credit: usdWhole(recoveryCreditCents) }))}
          />
        </div>

        <div className="rise mt-6 rounded-card bg-plum-950 p-7 text-bone sm:p-9" style={{ ["--d" as string]: 6 }}>
          <p className="eyebrow text-brass-soft">Same-day enrollment benefit</p>
          <p className="mt-2 font-display text-[2.1rem] leading-tight">
            <span className="italic-accent text-brass-soft">{usdWhole(recoveryCreditCents)}</span> Program Credit
          </p>
          <p className="mt-2 text-[0.98rem] text-bone/80">Enroll today, by deposit or paid in full, and receive {usdWhole(recoveryCreditCents)} off your program. Paying a deposit? It comes off your remaining program balance. Paying in full? It comes off today&rsquo;s total.</p>
        </div>

        <div className="rise mt-10 grid gap-6 sm:grid-cols-2" style={{ ["--d" as string]: 7 }}>
          <div>
            <p className="eyebrow text-amethyst">What happens after you enroll</p>
            <p className="mt-2 font-display text-[1.6rem] leading-snug">Your plan is customized, sent by email, and reviewed with you on a <span className="italic-accent text-amethyst">Recovery Roadmap Zoom.</span></p>
            <p className="mt-3 text-[0.95rem] text-plum-700">Payments are processed securely by Square. Your receipt is emailed right away.</p>
          </div>
          <ul className="space-y-3">
            {NEXT.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[0.98rem] text-plum-800">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" strokeWidth={1.6} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 border-t border-plum-800/10 pt-5 text-[0.82rem] text-plum-700/80">
          No specific outcomes are guaranteed. Program services and payment terms are reviewed before enrollment.
        </p>
      </div>
    </section>
  );
}
