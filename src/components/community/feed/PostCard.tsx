/** One post, as a card in the feed or in full on its own page. Server component with small client islands. */
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, EyeOff, Flag, MessageCircle, Pin, Sparkles } from "lucide-react";
import { embedUrl } from "@/lib/community/courses";
import { effectivePlan, isAdmin, isStaff } from "@/lib/community/permissions";
import type { Comment, Member, Post, Settings } from "@/lib/community/types";
import { MemberAvatar, MemberName, Pill, PlanPill, RichText, card, timeAgo } from "../ui";
import { CommentBox, DeleteComment, LikeButton, PollVote, PostMenu } from "./islands";

export function AuthorLine({ m, s, when, children }: { m: Member; s: Settings; when: string; children?: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Link href={`/community/members/${m.id}`} aria-label={`${m.name}'s profile`} className="shrink-0">
        <MemberAvatar m={m} />
      </Link>
      <div className="min-w-0">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <Link href={`/community/members/${m.id}`} className="font-medium text-plum-900 hover:text-amethyst"><MemberName m={m} /></Link>
          {m.role !== "member" ? <Pill tone="dark">{m.role === "owner" ? "Owner" : m.role === "admin" ? "Team" : "Moderator"}</Pill> : m.showPlan ? <PlanPill plan={effectivePlan(m)} name={s.plans[effectivePlan(m)].name} /> : null}
        </p>
        <p className="flex flex-wrap items-center gap-x-1.5 text-[0.82rem] text-plum-700">
          <span>{when}</span>
          {children}
        </p>
      </div>
    </div>
  );
}

type Props = { post: Post; comments: Comment[]; members: Map<string, Member>; actor: Member; s: Settings; full?: boolean; now: Date };

export function PostCard({ post, comments, members, actor, s, full = false, now }: Props) {
  const author = members.get(post.authorId);
  if (!author) return null;
  const cat = s.categories.find((c) => c.id === post.categoryId);
  const shown = comments.filter((c) => !c.hidden);
  const owner = [...members.values()].find((m) => m.role === "owner");
  const answered = !!owner && post.authorId !== owner.id && shown.some((c) => c.authorId === owner.id);
  const lastFew = [...new Map(shown.slice().reverse().map((c) => [c.authorId, members.get(c.authorId)])).values()].filter((m): m is Member => !!m).slice(0, 3);
  const spotlight = !!post.spotlightUntil && +new Date(post.spotlightUntil) > +now;
  const video = embedUrl(post.video);
  const href = `/community/post/${post.id}`;
  const long = post.body.length > 420 || post.body.split("\n").length > 6;

  return (
    <article className={`${card} ${post.hidden ? "opacity-70" : ""} ${spotlight && !full ? "border-brass" : ""}`} aria-labelledby={`post-${post.id}-${full ? "f" : "c"}`}>
      {(post.pinned || spotlight || post.hidden || (isStaff(actor) && post.reports.length > 0)) && (
        <div className="flex flex-wrap gap-2 px-4 pt-4 sm:px-6">
          {post.pinned && <Pill tone="dark"><Pin className="h-3 w-3" aria-hidden="true" /> Pinned</Pill>}
          {spotlight && <Pill tone="brass"><Sparkles className="h-3 w-3" aria-hidden="true" /> Spotlight</Pill>}
          {post.hidden && <Pill tone="warn"><EyeOff className="h-3 w-3" aria-hidden="true" /> Hidden from members</Pill>}
          {isStaff(actor) && post.reports.length > 0 && <Pill tone="warn"><Flag className="h-3 w-3" aria-hidden="true" /> Reported {post.reports.length}x</Pill>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        <div className="flex items-start justify-between gap-2">
          <AuthorLine m={author} s={s} when={timeAgo(post.createdAt, now)}>
            {cat && (
              <>
                <span aria-hidden="true">·</span>
                <Link href={`/community?category=${cat.id}`} className="text-amethyst hover:underline">{cat.name}</Link>
              </>
            )}
          </AuthorLine>
          <PostMenu id={post.id} title={post.title} body={post.body} own={post.authorId === actor.id} staff={isStaff(actor)} admin={isAdmin(actor)} pinned={!!post.pinned} hidden={!!post.hidden} spotlight={spotlight} categoryId={post.categoryId} categories={s.categories.map((c) => ({ id: c.id, name: c.name }))} />
        </div>

        <h2 id={`post-${post.id}-${full ? "f" : "c"}`} className="mt-4 font-display text-[1.55rem] leading-snug text-plum-900">
          {full ? post.title : <Link href={href} className="hover:text-amethyst">{post.title}</Link>}
        </h2>
        {post.body && (
          <div className="mt-2 text-plum-950">
            <RichText text={post.body} className={full ? "" : "line-clamp-6"} />
            {!full && long && <Link href={href} className="mt-1 inline-flex min-h-11 items-center text-[0.9rem] font-medium text-amethyst hover:underline">See more</Link>}
          </div>
        )}

        {post.images.length > 0 && (
          <div className={`mt-4 grid gap-2 ${post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
            {post.images.map((src, i) => (
              <div key={src} className={`relative overflow-hidden rounded-xl bg-sand ${post.images.length === 1 ? "aspect-[16/10]" : "aspect-square"}`}>
                <Image src={src} alt={`Photo ${i + 1} shared by ${author.name}`} fill sizes="(min-width: 768px) 44rem, 100vw" className="object-cover" unoptimized={src.startsWith("/api/")} />
              </div>
            ))}
          </div>
        )}
        {video && (
          <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-plum-950">
            <iframe src={video} title={`Video: ${post.title}`} loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture" allowFullScreen className="h-full w-full" />
          </div>
        )}
        {post.poll && (
          <div className="mt-4">
            <PollVote postId={post.id} options={post.poll.options.map((o) => ({ id: o.id, text: o.text, votes: o.votes.length }))} mine={post.poll.options.find((o) => o.votes.includes(actor.id))?.id ?? null} />
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-2 border-t border-plum-800/10 pt-2">
          <LikeButton action="post.like" args={{ id: post.id }} liked={post.likes.includes(actor.id)} count={post.likes.length} own={post.authorId === actor.id} what={`“${post.title}”`} />
          <Link href={`${href}#comments`} className="inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-[0.92rem] text-plum-700 hover:bg-mist hover:text-plum-900">
            <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" strokeWidth={1.7} />
            <span className="tabular-nums">{shown.length}</span>
            <span className="sr-only">{shown.length === 1 ? "comment" : "comments"}</span>
          </Link>
          {!full && lastFew.length > 0 && (
            <span className="ml-1 flex -space-x-2" aria-hidden="true">
              {lastFew.map((m) => <span key={m.id} className="rounded-full ring-2 ring-paper"><MemberAvatar m={m} size={26} level={false} /></span>)}
            </span>
          )}
          {answered && <span className="ml-auto inline-flex items-center gap-1.5 rounded-pill bg-brass-soft/60 px-3 py-1 text-[0.74rem] font-medium uppercase tracking-[0.1em] text-plum-950"><BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Iisha answered</span>}
        </div>
      </div>
    </article>
  );
}

/** Comments, threaded one level deep. Iisha's replies are highlighted. */
export function Comments({ post, comments, members, actor, s, now }: Omit<Props, "full">) {
  const shown = comments.filter((c) => !c.hidden).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const roots = shown.filter((c) => !c.parentId);
  const one = (c: Comment, reply: boolean) => {
    const m = members.get(c.authorId);
    if (!m) return null;
    const isOwner = m.role === "owner";
    return (
      <li key={c.id} id={`c-${c.id}`} className={`scroll-mt-40 ${reply ? "ml-6 sm:ml-12" : ""}`}>
        <div className={`rounded-2xl p-3 sm:p-4 ${isOwner ? "border border-brass/60 bg-bone" : "bg-mist/60"}`}>
          <AuthorLine m={m} s={s} when={timeAgo(c.createdAt, now)}>{isOwner && <><span aria-hidden="true">·</span><span className="text-brass-deep">Iisha&apos;s reply</span></>}</AuthorLine>
          <RichText text={c.body} className="mt-2 text-plum-950" />
          <div className="mt-1 flex flex-wrap items-center gap-x-2">
            <LikeButton action="comment.like" args={{ post: post.id, id: c.id }} liked={c.likes.includes(actor.id)} count={c.likes.length} own={c.authorId === actor.id} what={`${m.name}'s comment`} />
            {(c.authorId === actor.id || isStaff(actor)) && <DeleteComment post={post.id} id={c.id} />}
          </div>
          {!reply && (
            <details className="mt-1">
              <summary className="inline-flex min-h-11 cursor-pointer list-none items-center px-2 text-[0.88rem] text-amethyst hover:underline [&::-webkit-details-marker]:hidden">Reply</summary>
              <div className="mt-2"><CommentBox post={post.id} parent={c.id} placeholder={`Reply to ${m.name.split(" ")[0]}…`} label={`Reply to ${m.name}`} /></div>
            </details>
          )}
        </div>
      </li>
    );
  };
  return (
    <section id="comments" aria-label="Comments" className="mt-6 scroll-mt-40">
      <h2 className="font-display text-[1.4rem] text-plum-900">{shown.length} {shown.length === 1 ? "comment" : "comments"}</h2>
      <div className="mt-3"><CommentBox post={post.id} /></div>
      {roots.length === 0 ? (
        <p className="mt-4 text-plum-700">No comments yet. Be the first to say something kind.</p>
      ) : (
        <ul className="mt-4 space-y-3">{roots.flatMap((c) => [one(c, false), ...shown.filter((r) => r.parentId === c.id).map((r) => one(r, true))])}</ul>
      )}
    </section>
  );
}
