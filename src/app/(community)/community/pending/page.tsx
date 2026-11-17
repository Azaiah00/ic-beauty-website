import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Hourglass } from "lucide-react";
import { btnGhost, card } from "@/components/community/ui";
import { funnel } from "@/lib/funnel";
import { hasAccess } from "@/lib/community/permissions";
import { getActor } from "@/lib/server/community/session";

export const metadata: Metadata = { title: "Your request is in" };
export const dynamic = "force-dynamic";

export default async function PendingPage() {
  const actor = await getActor();
  if (!actor) redirect("/community/login");
  if (hasAccess(actor)) redirect("/community/welcome");
  if (actor.state === "paused") redirect("/community/paused");
  if (actor.state === "removed") redirect("/community/login?removed=1");
  return (
    <div className={`${card} mx-auto max-w-xl p-7 text-center sm:p-10`}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-mist text-amethyst">
        <Hourglass className="h-6 w-6" aria-hidden="true" strokeWidth={1.5} />
      </span>
      <h1 className="mt-5 font-display text-[2.2rem] leading-tight text-plum-900">Your request is in, {actor.name.split(" ")[0]}.</h1>
      <p className="mt-3 text-plum-700">Iisha&apos;s team reviews every request, usually within a day. You&apos;ll get a welcome message from Iisha the moment you&apos;re in.</p>
      {!actor.answers?.goal && (
        <Link href="/community/join" className={`${btnGhost} mt-6`}>
          Answer the three questions
        </Link>
      )}
      <div className="mt-8 rounded-2xl bg-bone p-5 text-left">
        <p className="eyebrow text-amethyst">While you wait</p>
        <p className="mt-2 text-plum-900">
          Take the free self-check: <strong>{funnel.leadMagnet.title}</strong>. It&apos;s the same place we&apos;ll begin together.
        </p>
        <a href={funnel.leadMagnet.file} className={`${btnGhost} mt-4`}>
          Get the free checklist
        </a>
      </div>
    </div>
  );
}
