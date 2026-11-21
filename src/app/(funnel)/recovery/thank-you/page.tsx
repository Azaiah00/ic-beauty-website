import type { Metadata } from "next";
import { after } from "next/server";
import { processEnrollment } from "@/lib/server/recoveryEnrollments";
import { CheckCircle2 } from "lucide-react";
import { Btn } from "@/components/ui/Btn";
import { business, recoveryPlans } from "@/lib/site";

export const metadata: Metadata = {
  title: "You're Enrolled",
  description: "Your recovery program enrollment is in.",
  alternates: { canonical: "/recovery/thank-you" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function RecoveryThanks({ searchParams }: { searchParams: Promise<{ plan?: string; pay?: string; orderId?: string }> }) {
  const { plan, pay, orderId } = await searchParams;
  // Square adds ?orderId= when it sends the client back. After the page is sent, look that order up in Square and,
  // if it's a paid enrollment not yet handled, email Iisha and (if asked for) the client. The Square webhook and the
  // dashboard do the same, so a closed tab never loses an enrollment; each one is only emailed once.
  if (orderId && /^[A-Za-z0-9_-]{6,64}$/.test(orderId)) after(() => processEnrollment(orderId).catch((e) => console.error("[recovery] thank-you processing failed", e)));
  const p = recoveryPlans.find((x) => x.id === plan);
  return (
    <section className="flex min-h-[80dvh] items-center bg-bone pb-20 pt-36">
      <div className="container-x max-w-2xl text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-amethyst" strokeWidth={1.2} aria-hidden="true" />
        <p className="eyebrow mt-6 text-amethyst">{p ? `${p.name} Recovery · ${pay === "full" ? "paid in full" : "deposit received"}` : "Payment received"}</p>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,1.8rem+2.4vw,3.6rem)] leading-[1.05] text-plum-900">
          Thank you. <span className="italic-accent text-amethyst">Your recovery starts here.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[1.05rem] text-plum-700">
          Square has emailed your receipt. Next, Iisha will send your customized care plan by email and set up your Recovery Roadmap Zoom. Questions? Call or text{" "}
          <a href={business.phoneHref} className="link-underline text-plum-900">{business.phone}</a>.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Btn href="/">Back to the site</Btn>
        </div>
      </div>
    </section>
  );
}
