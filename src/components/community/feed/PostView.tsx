/** A single post with its comments. Used by the post page and by the modal that opens over the feed. */
import Link from "next/link";
import { check, isStaff } from "@/lib/community/permissions";
import type { Member } from "@/lib/community/types";
import { getSettings, memberMap } from "@/lib/server/community/queries";
import { db } from "@/lib/server/community/store";
import { EducationNote, Empty, LockNote, btn } from "../ui";
import { Comments, PostCard } from "./PostCard";

export async function loadPost(id: string) {
  const [post, s] = await Promise.all([db.post(id), getSettings()]);
  return { post, s, cat: post ? s.categories.find((c) => c.id === post.categoryId) : undefined };
}

export async function PostView({ id, actor }: { id: string; actor: Member }) {
  const { post, s, cat } = await loadPost(id);
  if (!post || !cat || (post.hidden && !isStaff(actor))) {
    return (
      <Empty title="This post isn't here any more">
        <p>It may have been removed. There&apos;s plenty more in the feed.</p>
        <Link href="/community" className={`${btn} mt-5`}>Back to the feed</Link>
      </Empty>
    );
  }
  const gate = check(actor, "category.view", cat);
  if (!gate.ok) return <LockNote>{gate.message}</LockNote>;
  const [comments, members] = await Promise.all([db.comments(post.id), memberMap()]);
  const now = new Date();
  return (
    <>
      {cat.note && <EducationNote className="mb-4" />}
      <PostCard post={post} comments={comments} members={members} actor={actor} s={s} now={now} full />
      <Comments post={post} comments={comments} members={members} actor={actor} s={s} now={now} />
    </>
  );
}
