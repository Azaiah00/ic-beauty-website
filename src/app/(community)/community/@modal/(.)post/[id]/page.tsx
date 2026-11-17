import { PostModal } from "@/components/community/feed/islands";
import { PostView } from "@/components/community/feed/PostView";
import { requireMember } from "@/lib/server/community/session";

export const dynamic = "force-dynamic";

/** The same post, opened over the feed when you tap it from inside the community. A shared link opens the full page. */
export default async function PostOverFeed({ params }: { params: Promise<{ id: string }> }) {
  const actor = await requireMember();
  const { id } = await params;
  return (
    <PostModal title="Post">
      <PostView id={id} actor={actor} />
    </PostModal>
  );
}
