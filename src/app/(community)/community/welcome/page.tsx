import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { RichText, btn, card } from "@/components/community/ui";
import { CHECKLIST, firstName } from "@/lib/community/config";
import { getSettings } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";

export const metadata: Metadata = { title: "Welcome: start here" };
export const dynamic = "force-dynamic";

/** The "first win in 48 hours" page: Iisha's welcome and four small steps. */
export default async function WelcomePage() {
  const actor = await requireMember();
  const s = await getSettings();
  const done = CHECKLIST.filter((c) => actor.checklist[c.key]).length;
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow text-amethyst">You&apos;re in</p>
      <h1 className="mt-1 font-display text-[2.5rem] leading-tight text-plum-900">Welcome to the Circle, {firstName(actor.name)}.</h1>
      <blockquote className={`${card} mt-5 border-l-2 border-l-brass p-5`}>
        <RichText text={s.welcomeMessage.replace("{first}", firstName(actor.name))} className="text-plum-900" />
        <footer className="mt-2 text-[0.9rem] text-plum-700">Iisha</footer>
      </blockquote>

      <section className={`${card} mt-6 p-5 sm:p-7`} aria-labelledby="start-h">
        <div className="flex items-end justify-between gap-3">
          <h2 id="start-h" className="font-display text-[1.7rem] text-plum-900">
            Start Here
          </h2>
          <p className="text-[0.9rem] text-plum-700">
            {done} of {CHECKLIST.length} done
          </p>
        </div>
        <p className="text-plum-700">Four small steps. Do one today and you&apos;ve had your first win.</p>
        <ol className="mt-4 space-y-2">
          {CHECKLIST.map((c, i) => {
            const ok = !!actor.checklist[c.key];
            return (
              <li key={c.key}>
                <Link href={c.href} className={`flex min-h-16 items-center gap-4 rounded-2xl border px-4 transition ${ok ? "border-plum-800/10 bg-bone" : "border-plum-800/15 bg-white hover:border-amethyst"}`}>
                  {ok ? <CheckCircle2 className="h-6 w-6 shrink-0 text-sage" aria-hidden="true" /> : <Circle className="h-6 w-6 shrink-0 text-plum-700" aria-hidden="true" />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.74rem] uppercase tracking-[0.14em] text-plum-700">
                      Step {i + 1}
                      {ok ? " · Done" : ""}
                    </span>
                    <span className={`block text-[1.05rem] ${ok ? "text-plum-700" : "text-plum-900"}`}>{c.label}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ol>
        <Link href="/community" className={`${btn} mt-6 w-full sm:w-auto`}>
          Go to the community
        </Link>
      </section>
    </div>
  );
}
