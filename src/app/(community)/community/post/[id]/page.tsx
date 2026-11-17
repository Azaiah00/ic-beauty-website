import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PostView } from "@/components/community/feed/PostView";
import { WithRail } from "@/components/community/Shell";
import { requireMember } from "@/lib/server/community/session";

export const metadata: Metadata = { title: "Post" };
export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireMember();
  const { id } = await params;
  return (
    <WithRail actor={actor}>
      <Link href="/community" className="mb-3 inline-flex min-h-11 items-center gap-2 text-[0.9rem] text-plum-700 hover:text-plum-900">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to the feed
      </Link>
      <PostView id={id} actor={actor} />
    </WithRail>
  );
}
