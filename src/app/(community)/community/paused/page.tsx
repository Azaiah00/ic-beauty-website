import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PauseCircle } from "lucide-react";
import { btnGhost, card } from "@/components/community/ui";
import { business } from "@/lib/site";
import { hasAccess } from "@/lib/community/permissions";
import { getActor } from "@/lib/server/community/session";

export const metadata: Metadata = { title: "Your access is paused" };
export const dynamic = "force-dynamic";

export default async function PausedPage() {
  const actor = await getActor();
  if (!actor) redirect("/community/login");
  if (hasAccess(actor)) redirect("/community");
  if (actor.state === "pending") redirect("/community/pending");
  if (actor.state === "removed") redirect("/community/login?removed=1");
  return (
    <div className={`${card} mx-auto max-w-xl p-7 text-center sm:p-10`}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mist text-amethyst">
        <PauseCircle className="h-6 w-6" aria-hidden="true" strokeWidth={1.5} />
      </span>
      <h1 className="mt-5 font-display text-[2.2rem] leading-tight text-plum-900">Your access is paused.</h1>
      <p className="mt-3 text-plum-700">Nothing is lost, {actor.name.split(" ")[0]}. Your progress, posts and notes are all saved, and Iisha&apos;s team can turn your access back on any time.</p>
      <p className="mt-6 text-plum-900">To get back in, reach out to Iisha&apos;s team:</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <a href={`mailto:${business.email}`} className={btnGhost}>
          Email the team
        </a>
        <a href={business.phoneHref} className={btnGhost}>
          Call or text {business.phone}
        </a>
      </div>
    </div>
  );
}
