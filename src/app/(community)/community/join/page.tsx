import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RichText, btn, card, input, label } from "@/components/community/ui";
import { DEMO } from "@/lib/community/config";
import { hasAccess } from "@/lib/community/permissions";
import { getSettings } from "@/lib/server/community/queries";
import { getActor } from "@/lib/server/community/session";

export const metadata: Metadata = { title: "Join free" };
export const dynamic = "force-dynamic";

/**
 * Membership questions. Demo: a guest types their name and email here.
 * // TODO: Auth — "Continue with Google" comes first; name and email then come from the Google account.
 */
export default async function JoinPage({ searchParams }: { searchParams: Promise<{ err?: string }> }) {
  const [actor, s, { err }] = await Promise.all([getActor(), getSettings(), searchParams]);
  if (actor && hasAccess(actor)) redirect("/community");
  if (actor?.state === "paused") redirect("/community/paused");
  if (actor?.state === "removed") redirect("/community/login?removed=1");
  return (
    <div className="mx-auto max-w-xl">
      <p className="eyebrow text-amethyst">Join free</p>
      <h1 className="mt-1 font-display text-[2.4rem] leading-tight text-plum-900">{actor ? `Almost there, ${actor.name.split(" ")[0]}.` : `Join ${s.name}`}</h1>
      <p className="mt-2 text-plum-700">Three short questions so Iisha knows how to help you. It takes about a minute.</p>
      {err && (
        <p role="alert" className="mt-4 rounded-xl bg-sand px-4 py-3 text-plum-950 ring-1 ring-brass-deep/40">
          {err}
        </p>
      )}

      <form method="post" action="/api/community/join" className={`${card} mt-6 space-y-5 p-5 sm:p-7`}>
        <input type="hidden" name="back" value="/community/join" />
        {!actor && (
          <>
            <p className="rounded-xl bg-mist px-4 py-3 text-[0.9rem] text-plum-900">{DEMO ? "Demo sign-in: at launch this step is “Continue with Google”. For now, type your name and email." : "Tell us who you are."}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={label}>
                Your name
                <input name="name" required maxLength={80} autoComplete="name" className={`${input} mt-1.5 normal-case tracking-normal`} />
              </label>
              <label className={label}>
                Email
                <input name="email" type="email" required maxLength={160} autoComplete="email" className={`${input} mt-1.5 normal-case tracking-normal`} />
              </label>
            </div>
          </>
        )}
        {s.questions.map((q) => (
          <div key={q.id}>
            {q.choices ? (
              <fieldset>
                <legend className="text-[1.02rem] text-plum-900">{q.label}</legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.choices.map((c, i) => (
                    <label key={c} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-pill border border-plum-800/20 bg-white px-4 text-[0.95rem] text-plum-900 has-[:checked]:border-plum-900 has-[:checked]:bg-plum-900 has-[:checked]:text-bone has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-amethyst">
                      <input type="radio" name={`q-${q.id}`} value={c} required={i === 0} defaultChecked={actor?.answers?.[q.id] === c} className="sr-only" />
                      {c}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <label className="block text-[1.02rem] text-plum-900">
                {q.label}
                <textarea name={`q-${q.id}`} required rows={2} maxLength={600} defaultValue={actor?.answers?.[q.id]} className={`${input} mt-2`} />
              </label>
            )}
          </div>
        ))}
        <div className="rounded-2xl bg-bone p-4">
          <p className="eyebrow text-amethyst">Community guidelines</p>
          <RichText text={s.guidelines.split("\n").map((g) => `- ${g}`).join("\n")} className="mt-2 text-[0.95rem] text-plum-900" />
          <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-plum-900">
            <input type="checkbox" name="agree" value="yes" required className="h-5 w-5 accent-amethyst" />
            I agree to the community guidelines
          </label>
        </div>
        <button className={`${btn} w-full !min-h-14`}>{actor ? "Save my answers" : "Ask to join"}</button>
      </form>
    </div>
  );
}
