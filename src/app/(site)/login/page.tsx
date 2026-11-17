import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, KeyRound, Sparkles } from "lucide-react";
import { PageHero } from "@/components/sections/PageHero";

/**
 * /login: one front door for everyone who signs in.
 *  - Members: The H.A.I.R. Circle Community (/community/login). Demo sign-in today (persona picker).
 *    // TODO: Auth — Google OAuth via Supabase Auth (or Auth.js) + email magic link, keeping the approval step.
 *  - Iisha: the owner dashboard (/admin), password sign-in today.
 */
export const metadata: Metadata = {
  title: "Log in",
  description: "Sign in to your I.C. Beauty member portal or the owner dashboard.",
  alternates: { canonical: "/login" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <>
      <PageHero crumbs={[{ name: "Log in", href: "/login" }]} eyebrow="Welcome back" title={<>Log <span className="italic-accent text-amethyst">in.</span></>} lede={<p>Choose where you&apos;re headed.</p>} />
      <section className="bg-bone pb-24 pt-4">
        <div className="container-x grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-card border border-plum-800/10 bg-paper p-7 sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-plum-900 text-bone">
              <Sparkles className="h-5 w-5" aria-hidden="true" strokeWidth={1.4} />
            </span>
            <p className="eyebrow mt-5 text-amethyst">Clients &amp; members</p>
            <h2 className="mt-2 font-display text-[1.9rem] leading-tight text-plum-900">The H.A.I.R. Circle Community</h2>
            <p className="mt-3 flex-1 text-plum-700">
              Your community, classroom, lessons and progress, all in one place. New here? It's free to join.
            </p>
            <Link href="/community/login" className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill bg-plum-900 px-6 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst">
              Sign in to the community <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
            <Link href="/community/join" className="mt-3 inline-flex min-h-11 items-center justify-center text-[0.9rem] text-plum-800 underline underline-offset-4 hover:text-amethyst">Not a member yet? Join free</Link>
          </div>
          <div className="flex flex-col rounded-card border border-plum-800/10 bg-paper p-7 sm:p-9">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-plum-800/20 text-plum-900">
              <KeyRound className="h-5 w-5" aria-hidden="true" strokeWidth={1.4} />
            </span>
            <p className="eyebrow mt-5 text-amethyst">Iisha</p>
            <h2 className="mt-2 font-display text-[1.9rem] leading-tight text-plum-900">Owner dashboard</h2>
            <p className="mt-3 flex-1 text-plum-700">Sign-ups, program applications, Scalp Check results and messages from the website.</p>
            <Link href="/admin/login" className="group mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-pill border border-plum-900/25 px-6 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-plum-900 hover:border-plum-900">
              Owner sign in <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
