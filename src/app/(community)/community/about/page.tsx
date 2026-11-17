import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PlansTable } from "@/components/community/PlansTable";
import { EducationNote, Icon3D, btn, btnBrass, btnGhost, card, type IconName } from "@/components/community/ui";
import { Needs } from "@/components/ui/Needs";
import { COMMUNITY_FAQ } from "@/lib/community/faq";
import { effectivePlan, isLive } from "@/lib/community/permissions";
import { img } from "@/lib/images";
import { graph, ids } from "@/lib/schema";
import { shareMeta } from "@/lib/share";
import { METHOD_DEFINITION, SITE_URL, business } from "@/lib/site";
import { getSettings, memberCounts } from "@/lib/server/community/queries";
import { getActor } from "@/lib/server/community/session";

const DESCRIPTION = "A free hair wellness community led by Iisha C. Silver, creator of The H.A.I.R. Wellness Method. Learn your hair, ask honest questions, and grow with women on the same journey.";

/** The public sales page for the community. Printed and shared links point here: never rename this route. */
export const metadata: Metadata = {
  ...shareMeta("/community/about"),
  title: { absolute: "The H.A.I.R. Circle Community: free hair wellness community | I.C. Beauty" },
  description: DESCRIPTION,
  alternates: { canonical: "/community/about" },
  robots: { index: true, follow: true },
};
export const dynamic = "force-dynamic";

const INSIDE: { icon: IconName; t: string; d: string }[] = [
  { icon: "community", t: "Community", d: "A warm feed for wins, questions, wash day check-ins and encouragement." },
  { icon: "classroom", t: "Classroom", d: "Short lessons from Iisha, free to start, with a weekly curriculum for Circle Members." },
  { icon: "calendar", t: "Calendar", d: "Monthly Lives, Q&As and coaching calls, shown in your own time zone." },
  { icon: "leaderboards", t: "Levels", d: "Every like you receive is a point. Levels open extras, like the Wash Day Blueprint." },
  { icon: "labs", t: "Labs", d: "Hands-on learning: explore the growth cycle, tell shedding from breakage, build your wash day." },
  { icon: "heart", t: "Iisha in your corner", d: "Ask Iisha, small-group coaching and 1:1 reviews on the paid plans." },
];

export default async function AboutPage() {
  const [actor, s, counts] = await Promise.all([getActor(), getSettings(), memberCounts()]);
  const live = isLive(actor);
  const cover = img(s.cover) ?? img("classroom");
  const portrait = img("iisha-portrait");
  const join = live ? "/community" : "/community/join";
  const joinLabel = live ? "Open the community" : actor ? "Finish joining" : "Join free";
  const plan = live ? effectivePlan(actor) : null;

  return (
    <>
      <JsonLd
        data={graph(
          { "@type": "WebPage", "@id": `${SITE_URL}/community/about#webpage`, url: `${SITE_URL}/community/about`, name: s.name, description: DESCRIPTION, isPartOf: { "@id": ids.website }, about: { "@id": ids.method }, publisher: { "@id": ids.business }, inLanguage: "en-US" },
          { "@type": "Organization", "@id": `${SITE_URL}/community/about#community`, name: s.name, url: `${SITE_URL}/community/about`, description: DESCRIPTION, parentOrganization: { "@id": ids.business }, founder: { "@id": ids.person } },
        )}
      />
      <section className="overflow-hidden rounded-card bg-plum-900 text-bone lg:grid lg:grid-cols-2">
        <div className="p-7 sm:p-12">
          <p className="eyebrow text-brass-soft">Free to join · Led by {business.owner.name}</p>
          <h1 className="mt-3 font-display text-[clamp(2.4rem,1.6rem+3vw,3.8rem)] leading-[1.04]">{s.name}</h1>
          <p className="mt-4 max-w-md text-lede text-lilac">{s.promise}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={join} className="inline-flex min-h-14 items-center justify-center rounded-pill bg-bone px-8 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-plum-900 hover:bg-white">{joinLabel}</Link>
            {!actor && <Link href="/community/login" className="inline-flex min-h-14 items-center justify-center rounded-pill border border-bone/40 px-7 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-bone hover:bg-bone hover:text-plum-900">Sign in</Link>}
          </div>
          <p className="mt-5 text-[0.9rem] text-lilac">{counts.total} members and growing</p>
        </div>
        <div className="relative min-h-[15rem] bg-plum-800 lg:min-h-full">{cover && <Image src={cover} alt="Women learning about hair wellness together" fill priority sizes="(min-width: 1024px) 38rem, 100vw" className="object-cover" />}</div>
      </section>

      <section className="mt-12" aria-labelledby="inside-h">
        <p className="eyebrow text-amethyst">What&apos;s inside</p>
        <h2 id="inside-h" className="mt-1 font-display text-[2.2rem] leading-tight text-plum-900">Everything in one place, in plain words.</h2>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {INSIDE.map(({ icon, t, d }) => (
            <li key={t} className={`${card} p-5`}>
              <Icon3D name={icon} size={56} />
              <h3 className="mt-3 font-display text-[1.4rem] text-plum-900">{t}</h3>
              <p className="mt-1 text-[0.95rem] text-plum-700">{d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${card} mt-12 grid gap-6 p-6 sm:p-9 md:grid-cols-[14rem_1fr] md:items-center`} aria-labelledby="iisha-h">
        <div className="relative mx-auto aspect-[4/5] w-48 overflow-hidden rounded-[999px_999px_1.25rem_1.25rem] bg-sand md:w-full">
          {portrait && <Image src={portrait} alt={`${business.owner.name}, ${business.owner.title}`} fill sizes="224px" className="object-cover" style={{ objectPosition: "70% 20%" }} />}
        </div>
        <div>
          <p className="eyebrow text-amethyst">Meet Iisha</p>
          <h2 id="iisha-h" className="mt-1 font-display text-[2rem] leading-tight text-plum-900">{business.owner.name}</h2>
          <p className="text-plum-700">{business.owner.title}</p>
          <p className="mt-4 text-plum-900">{METHOD_DEFINITION}</p>
          <Link href="/the-hair-method" className={`${btnGhost} mt-5`}>About the method</Link>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="plans-h">
        <p className="eyebrow text-amethyst">Plans</p>
        <h2 id="plans-h" className="mt-1 font-display text-[2.2rem] leading-tight text-plum-900">Start free. Go deeper when you&apos;re ready.</h2>
        <p className="mt-1 max-w-2xl text-plum-700">Each plan is a different kind of support, not just more lessons. You can upgrade, switch or cancel any time.</p>
        <div className="mt-6">
          <PlansTable
            s={s}
            cta={(key) =>
              plan === key ? (
                <span className="inline-flex min-h-11 w-full items-center justify-center rounded-pill bg-mist text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900">Your plan</span>
              ) : key === "free" ? (
                live ? null : <Link href={join} className={`${btn} w-full`}>{joinLabel}</Link>
              ) : (
                <Link href={live ? `/community/checkout/${key}` : join} className={`${key === "circle" ? btnBrass : btnGhost} w-full`}>{live ? (key === "circle" && s.plans.circle.trialDays ? `Try ${s.plans.circle.trialDays} days free` : `Choose ${s.plans[key].name}`) : "Join free first"}</Link>
              )
            }
          />
        </div>
      </section>

      <section className="mt-12" aria-labelledby="say-h">
        <p className="eyebrow text-amethyst">What members say</p>
        <h2 id="say-h" className="mt-1 font-display text-[2.2rem] leading-tight text-plum-900">In their own words.</h2>
        <ul className="mt-6 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className={`${card} flex min-h-36 flex-col items-start justify-center gap-3 p-6`}>
              <Needs>Real member quotes from Iisha</Needs>
              <p className="text-[0.92rem] text-plum-700">A real quote, with the member&apos;s permission, goes here.</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12" aria-labelledby="faq-h">
        <h2 id="faq-h" className="font-display text-[2.2rem] leading-tight text-plum-900">Questions, answered.</h2>
        <div className="mt-4 divide-y divide-plum-800/12 border-y border-plum-800/12">
          {COMMUNITY_FAQ.map((f) => (
            <details key={f.q} className="group">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-left text-plum-900 [&::-webkit-details-marker]:hidden">
                <h3 className="font-display text-[1.35rem] leading-snug">{f.q}</h3>
                <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-plum-800/20 text-[1.2rem] text-amethyst transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="max-w-3xl pb-5 text-plum-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-card bg-mist p-7 text-center sm:p-10">
        <h2 className="font-display text-[2rem] leading-tight text-plum-900">Healthy awareness is rare. Come get yours.</h2>
        <Link href={join} className={`${btn} mt-5 !min-h-14 !px-9`}>{joinLabel}</Link>
      </section>
      <EducationNote className="mt-8" />
    </>
  );
}
