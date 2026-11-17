import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Search, Sparkles } from "lucide-react";
import { Composer } from "@/components/community/feed/Composer";
import { LoadMore } from "@/components/community/feed/islands";
import { PostCard } from "@/components/community/feed/PostCard";
import { WithRail } from "@/components/community/Shell";
import { EducationNote, Empty, Icon3D, LockNote, MemberAvatar, card, chip, chipOn, input, type IconName } from "@/components/community/ui";
import { INTRO_TEMPLATE } from "@/lib/community/config";
import { can, reason } from "@/lib/community/permissions";
import type { Comment } from "@/lib/community/types";
import { ensureRituals } from "@/lib/server/community/core";
import { getSettings, memberMap, visiblePosts } from "@/lib/server/community/queries";
import { requireMember } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const metadata: Metadata = { title: "Community" };
export const dynamic = "force-dynamic";

const CAT_ICON: Record<string, IconName> = { "start-here": "key", announcements: "megaphone", general: "community", wins: "heart", "ask-iisha": "question", "wash-day": "comb", "scalp-wellness": "seedling", "inner-lounge": "crown" };

type Params = { category?: string; sort?: string; q?: string; n?: string; compose?: string; title?: string; search?: string };

export default async function FeedPage({ searchParams }: { searchParams: Promise<Params> }) {
  const actor = await requireMember();
  const sp = await searchParams;
  await ensureRituals();
  const now = new Date();
  const [s, all, allComments, members] = await Promise.all([getSettings(), visiblePosts(actor), db.comments(), memberMap()]);
  const byPost = new Map<string, Comment[]>();
  for (const c of allComments) byPost.set(c.postId, [...(byPost.get(c.postId) ?? []), c]);

  const cats = [...s.categories].sort((a, b) => a.order - b.order);
  const cat = cats.find((c) => c.id === sp.category);
  const locked = cat && !can(actor, "category.view", cat);
  const sort = sp.sort === "new" || sp.sort === "top" ? sp.sort : "default";
  const q = (sp.q ?? "").trim().toLowerCase();

  let posts = all.filter((p) => (!cat || p.categoryId === cat.id) && (!q || `${p.title} ${p.body} ${members.get(p.authorId)?.name ?? ""}`.toLowerCase().includes(q)));
  const score = (id: string, likes: number) => likes + (byPost.get(id)?.length ?? 0);
  if (sort === "new") posts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (sort === "top") posts = posts.filter((p) => +now - +new Date(p.createdAt) < 7 * 864e5).sort((a, b) => score(b.id, b.likes.length) - score(a.id, a.likes.length));
  else posts.sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) || b.lastActivityAt.localeCompare(a.lastActivityAt));

  const limit = Math.max(10, Math.min(200, Number(sp.n) || 10));
  const page = posts.slice(0, limit);
  const spotlight = !cat && !q && sort === "default" ? all.find((p) => p.spotlightUntil && +new Date(p.spotlightUntil) > +now) : undefined;
  const postable = cats.filter((c) => can(actor, "post.create", c)).map((c) => ({ id: c.id, name: c.name }));
  const link = (patch: Partial<Params>) => {
    const next = new URLSearchParams();
    const merged = { category: sp.category, sort: sp.sort, q: sp.q, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) next.set(k, v);
    return `/community${next.size ? `?${next}` : ""}`;
  };
  const intro = sp.compose === "intro";

  return (
    <WithRail actor={actor}>
      <h1 className="sr-only">{s.name} feed</h1>
      <Composer
        avatar={<MemberAvatar m={actor} level={false} />}
        categories={postable}
        start={{ open: !!sp.compose, category: intro ? "start-here" : sp.category, title: intro ? INTRO_TEMPLATE.title : sp.title, body: intro ? INTRO_TEMPLATE.body : undefined }}
      />

      {(sp.search || q) && (
        <form action="/community" role="search" className="mt-3 flex items-center gap-2">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search posts</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-plum-700" aria-hidden="true" />
            <input name="q" defaultValue={sp.q} placeholder="Search posts" autoFocus={!!sp.search} className={`${input} pl-10`} />
          </label>
          {q && <Link href="/community" className={chip}>Clear</Link>}
        </form>
      )}

      <nav aria-label="Categories" className="-mx-4 mt-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        <ul className="flex gap-2 pb-1">
          <li className="shrink-0"><Link href={link({ category: undefined })} aria-current={!cat ? "page" : undefined} className={!cat ? chipOn : chip}>All</Link></li>
          {cats.map((c) => (
            <li key={c.id} className="shrink-0">
              <Link href={link({ category: c.id })} aria-current={cat?.id === c.id ? "page" : undefined} className={`whitespace-nowrap ${cat?.id === c.id ? chipOn : chip}`}>
                {CAT_ICON[c.id] && <Icon3D name={CAT_ICON[c.id]} size={24} className="-ml-1" />}
                {c.name}
                {!can(actor, "category.view", c) && <Lock className="h-3.5 w-3.5" aria-hidden="true" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.9rem] text-plum-700">{q ? `${posts.length} ${posts.length === 1 ? "post" : "posts"} for “${sp.q}”` : cat ? cat.description : "Everything happening in the Circle"}</p>
        <div className="flex gap-1 text-[0.86rem]" role="group" aria-label="Sort posts">
          {([["default", "Default"], ["new", "New"], ["top", "Top this week"]] as const).map(([k, label]) => (
            <Link key={k} href={link({ sort: k === "default" ? undefined : k })} aria-current={sort === k ? "true" : undefined} className={`inline-flex min-h-11 items-center rounded-pill px-3.5 ${sort === k ? "bg-mist font-medium text-plum-900" : "text-plum-700 hover:text-plum-900"}`}>{label}</Link>
          ))}
        </div>
      </div>

      {cat?.note && <EducationNote className="mt-3" />}
      {cat && !locked && !can(actor, "post.create", cat) && <p className="mt-3 rounded-xl bg-mist px-4 py-3 text-[0.92rem] text-plum-900">{reason(actor, "post.create", cat)} <Link href="/community/upgrade" className="font-medium text-amethyst underline underline-offset-2">See plans</Link></p>}

      <div className="mt-4 space-y-4">
        {locked ? (
          <div className={`${card} overflow-hidden`}>
            <div className="bg-plum-900 p-6 text-bone sm:p-8">
              <p className="eyebrow text-brass-soft">Included in {s.plans.inner.name}</p>
              <h2 className="mt-2 font-display text-[1.9rem] leading-tight">{cat!.name}</h2>
              <p className="mt-2 max-w-md text-lilac">{cat!.description} Coaching-call notes, accountability partners and a closer circle with Iisha.</p>
            </div>
            <div className="p-4 sm:p-6"><LockNote cta={`See ${s.plans.inner.name}`}>{reason(actor, "category.view", cat)}</LockNote></div>
          </div>
        ) : (
          <>
            {spotlight && (
              <section aria-label="Member spotlight" className="rounded-card bg-plum-900 p-1">
                <p className="flex items-center gap-2 px-4 py-2 text-[0.74rem] font-medium uppercase tracking-[0.16em] text-brass-soft"><Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Member spotlight this week</p>
                <PostCard post={spotlight} comments={byPost.get(spotlight.id) ?? []} members={members} actor={actor} s={s} now={now} />
              </section>
            )}
            {page.filter((p) => p.id !== spotlight?.id).map((p) => <PostCard key={p.id} post={p} comments={byPost.get(p.id) ?? []} members={members} actor={actor} s={s} now={now} />)}
            {posts.length === 0 && (
              <Empty title={q ? "Nothing matches that yet" : sort === "top" ? "A quiet week so far" : "It's quiet in here"}>
                <p>{q ? "Try a different word, or ask the Circle yourself." : "Be the first to share. A small win, a question, a wash day story. Someone needs to hear it."}</p>
              </Empty>
            )}
            <LoadMore shown={page.length} total={posts.length} />
          </>
        )}
      </div>
    </WithRail>
  );
}
