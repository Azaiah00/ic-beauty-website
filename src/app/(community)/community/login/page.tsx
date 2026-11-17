import type { Metadata } from "next";
import { ArrowRight, UserRound } from "lucide-react";
import { roleLabel } from "@/components/community/Shell";
import { MemberAvatar, MemberName, btn, card } from "@/components/community/ui";
import { DEMO, levelFor } from "@/lib/community/config";
import { PERSONAS } from "@/lib/community/seed";
import { isAdmin } from "@/lib/server/auth";
import { getMembers, getSettings } from "@/lib/server/community/queries";

export const metadata: Metadata = { title: "Sign in" };
export const dynamic = "force-dynamic";

/**
 * Demo sign-in. "Continue with Google" opens the persona picker until real sign-in is connected.
 * // TODO: Auth — Google OAuth via Supabase Auth (or Auth.js) + email magic link; map auth user → Member by
 * // email; keep the approval step.
 */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ removed?: string; next?: string }> }) {
  const { removed, next } = await searchParams;
  const [members, s, team] = await Promise.all([getMembers(), getSettings(), isAdmin()]);
  // Team personas only show to someone signed in to the owner dashboard.
  const personas = PERSONAS.map((id) => members.find((m) => m.id === id)).filter((m) => !!m).filter((m) => team || m.role === "member");
  return (
    <div className="mx-auto max-w-3xl">
      <div className={`${card} p-6 text-center sm:p-10`}>
        <p className="eyebrow text-amethyst">Welcome back</p>
        <h1 className="mt-2 font-display text-[2.4rem] leading-tight text-plum-900">Sign in to {s.name}</h1>
        {removed && <p role="alert" className="mx-auto mt-4 max-w-md rounded-xl bg-sand px-4 py-3 text-plum-950">This membership has been removed from the community. If you think that&apos;s a mistake, please message Iisha&apos;s team.</p>}
        <a href="#preview" className={`${btn} mx-auto mt-6 w-full max-w-sm !min-h-14`}>
          <span aria-hidden="true" className="flex h-6 w-6 items-center justify-center rounded-full bg-bone text-[0.8rem] font-semibold normal-case tracking-normal text-plum-900">G</span>
          Continue with Google
        </a>
        <p className="mt-3 text-[0.88rem] text-plum-700">{DEMO ? "Demo sign-in: Google sign-in connects at launch. For now, choose a person below to see what they see." : "Sign-in opens when the community launches."}</p>
      </div>

      {DEMO && (
        <section id="preview" className="mt-8 scroll-mt-28" aria-labelledby="preview-h">
          <h2 id="preview-h" className="font-display text-[1.8rem] text-plum-900">Preview as…</h2>
          <p className="text-plum-700">Every person here is a sample. Pick one to walk through the community exactly as they would.</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            <li>
              <form method="post" action="/api/community/login">
                <input type="hidden" name="id" value="guest" />
                <button className={`${card} flex min-h-[5.5rem] w-full items-center gap-4 p-4 text-left transition hover:border-amethyst`}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-plum-800/20 text-plum-800"><UserRound className="h-5 w-5" aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-plum-900">Guest</span>
                    <span className="block text-[0.86rem] text-plum-700">Not signed in. Sees only the About page.</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />
                </button>
              </form>
            </li>
            {personas.map((m) => (
              <li key={m.id}>
                <form method="post" action="/api/community/login">
                  <input type="hidden" name="id" value={m.id} />
                  {next && <input type="hidden" name="next" value={next} />}
                  <button className={`${card} flex min-h-[5.5rem] w-full items-center gap-4 p-4 text-left transition hover:border-amethyst`}>
                    <MemberAvatar m={m} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-plum-900"><MemberName m={m} /></span>
                      <span className="block text-[0.86rem] text-plum-700">
                        {roleLabel(m, s)}
                        {m.role === "member" && m.state !== "pending" ? ` · Level ${levelFor(m.points).level}` : ""}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />
                  </button>
                </form>
              </li>
            ))}
          </ul>
          {!team && (
            <p className="mt-4 rounded-xl bg-mist px-4 py-3 text-[0.92rem] text-plum-900">
              On Iisha&apos;s team? <a href="/admin" className="font-medium text-amethyst underline underline-offset-2">Sign in to the owner dashboard</a>, then tap <strong>Open member portal</strong> to come in as yourself.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
