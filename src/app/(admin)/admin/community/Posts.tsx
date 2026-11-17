/** Posts & reports (6.3): the reported queue, every post, and the categories of the feed. */
import Link from "next/link";
import { ArrowDown, ArrowUp, ExternalLink, Flag, Pin, Sparkles } from "lucide-react";
import { BROADCAST_HOURS, firstName } from "@/lib/community/config";
import type { Category, Member, Post } from "@/lib/community/types";
import { communityNeeds } from "@/lib/server/community/admin";
import { db } from "@/lib/server/community/store";
import { Act, EmptyNote, StatePill, Tip, btn, btnGhost, btnRed, card, field, h2, lbl, panel, sum, sumRed, when } from "./shared";

const POST_RULES: [Category["post"], string][] = [["everyone", "Everyone"], ["circle", "Circle members and up"], ["inner", "Inner Circle"], ["team", "Team only"]];
const VIEW_RULES: [Category["view"], string][] = [["everyone", "Everyone"], ["inner", "Inner Circle only"]];

export async function CommunityPosts({ cat: rawCat }: { actor: Member; cat?: string }) {
  const now = new Date();
  const [posts, members, s, comments, needs] = await Promise.all([db.posts(), db.members(), db.settings(), db.comments(), communityNeeds()]);
  const cats = [...s.categories].sort((a, b) => a.order - b.order);
  const cat = cats.some((c) => c.id === rawCat) ? rawCat! : "";
  const back = `/admin?view=community-posts${cat ? `&cat=${cat}` : ""}`;
  const name = (id: string) => members.find((m) => m.id === id)?.name ?? "A member";
  const catName = (id: string) => cats.find((c) => c.id === id)?.name ?? "Uncategorized";
  const waiting = new Set(needs.waiting.map((p) => p.id));
  const reported = posts.filter((p) => p.reports.length > 0).sort((a, b) => b.reports.length - a.reports.length);
  const all = posts.filter((p) => !cat || p.categoryId === cat).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const replies = (id: string) => comments.filter((c) => c.postId === id).length;
  const canBroadcast = !s.lastBroadcastAt || +now - +new Date(s.lastBroadcastAt) > BROADCAST_HOURS * 36e5;

  const Head = ({ p }: { p: Post }) => (
    <div className="min-w-0">
      <p className="flex flex-wrap items-center gap-1.5">
        <StatePill>{catName(p.categoryId)}</StatePill>
        {p.pinned && <StatePill tone="good">Pinned</StatePill>}
        {p.spotlightUntil && +new Date(p.spotlightUntil) > +now && <StatePill tone="warn">Spotlight</StatePill>}
        {p.hidden && <StatePill tone="bad">Hidden</StatePill>}
        {waiting.has(p.id) && <StatePill tone="new">Waiting for Iisha&apos;s answer</StatePill>}
      </p>
      <p className="mt-1.5 text-[1.02rem] font-medium text-plum-900">{p.title}</p>
      <p className="text-[0.84rem] text-plum-700">{name(p.authorId)} · {when(p.createdAt)} · {p.likes.length} likes · {replies(p.id)} comments</p>
    </div>
  );

  return (
    <>
      <Tip>Keep the feed kind and tidy. Reported posts come first. Nothing here is permanent: every change has an Undo.</Tip>

      <section id="reported" className="mt-6 scroll-mt-28" aria-labelledby="rep-h">
        <h2 id="rep-h" className={h2}>Reported posts</h2>
        {reported.length === 0 ? (
          <EmptyNote>Nothing has been reported. When a member taps “Report” on a post, it shows up here with four simple choices.</EmptyNote>
        ) : (
          <ul className="mt-3 space-y-3">
            {reported.map((p) => (
              <li key={p.id} className={`${card} p-4 ring-2 ring-[#b4533c]/25 sm:p-5`}>
                <Head p={p} />
                <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-bone/70 p-3 text-[0.92rem] text-ink">{p.body.slice(0, 500)}</p>
                <ul className="mt-3 space-y-1 text-[0.88rem] text-plum-800">
                  {p.reports.map((r, i) => (
                    <li key={i} className="flex items-start gap-2"><Flag className="mt-1 h-3.5 w-3.5 shrink-0 text-[#b4533c]" aria-hidden="true" /> {name(r.by)} reported it: “{r.reason}” · {when(r.at)}</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  {([["keep", "Keep it", "It's fine. Clear the report."], ["hide", "Hide it", "Only the team will see it."], ["warn", "Warn the member", `Keeps the post and sends ${firstName(name(p.authorId))} a kind reminder of the guidelines.`]] as const).map(([outcome, text, title]) => (
                    <Act key={outcome} action="report.resolve" back={`${back}#reported`}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="outcome" value={outcome} />
                      <button title={title} className={outcome === "keep" ? btn : btnGhost}>{text}</button>
                    </Act>
                  ))}
                  <details className="open:w-full">
                    <summary className={sumRed}>Delete it</summary>
                    <Act action="report.resolve" back={`${back}#reported`} className={panel}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="outcome" value="delete" />
                      <p className="text-[0.92rem] text-plum-900">This takes the post out of the community for everyone. You can undo it for 24 hours.</p>
                      <button className={`${btnRed} mt-3`}>Yes, delete this post</button>
                    </Act>
                  </details>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="all" className="mt-8 scroll-mt-28" aria-labelledby="all-h">
        <h2 id="all-h" className={h2}>All posts</h2>
        <nav aria-label="Filter posts by category" className="mt-3 flex flex-wrap gap-2">
          {[{ id: "", name: "All" }, ...cats].map((c) => {
            const on = c.id === cat;
            return <Link key={c.id || "all"} href={`/admin?view=community-posts${c.id ? `&cat=${c.id}` : ""}#all`} aria-current={on ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-full px-4 text-[0.86rem] ${on ? "bg-plum-900 text-bone" : "border border-plum-800/15 bg-white text-plum-900 hover:border-amethyst"}`}>{c.name}</Link>;
          })}
        </nav>
        {all.length === 0 ? (
          <EmptyNote>No posts here yet. Posts appear the moment a member shares something in this category.</EmptyNote>
        ) : (
          <ul className="mt-3 space-y-3">
            {all.map((p) => {
              const spot = !!p.spotlightUntil && +new Date(p.spotlightUntil) > +now;
              const hid = { id: p.id };
              return (
                <li key={p.id} id={`post-${p.id}`} className={`scroll-mt-28 ${card} p-4 sm:p-5`}>
                  <div className="flex items-start justify-between gap-3">
                    <Head p={p} />
                    <a href={`/community/post/${p.id}`} target="_blank" rel="noopener" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 text-[0.74rem] font-medium uppercase tracking-[0.1em] text-amethyst hover:underline">
                      {waiting.has(p.id) ? "Answer" : "Open"} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                  <div className="mt-3 flex flex-wrap items-start gap-2">
                    <Act action="post.pin" back={`${back}#post-${p.id}`}><input type="hidden" name="id" value={hid.id} /><button className={btnGhost}><Pin className="h-4 w-4" aria-hidden="true" /> {p.pinned ? "Unpin" : "Pin to top"}</button></Act>
                    <Act action="post.spotlight" back={`${back}#post-${p.id}`}><input type="hidden" name="id" value={hid.id} /><button className={btnGhost} title="Shows a banner at the top of the feed for 7 days"><Sparkles className="h-4 w-4" aria-hidden="true" /> {spot ? "Stop Spotlight" : "Feature as Spotlight"}</button></Act>
                    <Act action="post.hide" back={`${back}#post-${p.id}`}><input type="hidden" name="id" value={hid.id} /><button className={btnGhost}>{p.hidden ? "Show again" : "Hide"}</button></Act>
                    <details className="open:w-full">
                      <summary className={sum}>More</summary>
                      <div className={`${panel} space-y-4`}>
                        <Act action="post.move" back={`${back}#post-${p.id}`} className="flex flex-wrap items-end gap-2">
                          <input type="hidden" name="id" value={hid.id} />
                          <label className={lbl}>
                            Move to another category
                            <select name="category" defaultValue={p.categoryId} className={`${field} sm:w-64`}>
                              {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                          </label>
                          <button className={btnGhost}>Move</button>
                        </Act>
                        <Act action="post.broadcast" back={`${back}#post-${p.id}`}>
                          <input type="hidden" name="id" value={hid.id} />
                          <p className="text-[0.88rem] text-plum-700">Email this post to all members. You can do this once every {BROADCAST_HOURS} hours, so members only hear from you when it matters. Demo: nothing is sent yet, it is only written to the activity log.</p>
                          <button className={`${btnGhost} mt-2`} disabled={!canBroadcast} title={canBroadcast ? undefined : `Available once every ${BROADCAST_HOURS} hours`}>Email this to all members</button>
                        </Act>
                        <details>
                          <summary className={sumRed}>Delete this post</summary>
                          <Act action="post.delete" back={back} className="mt-3 rounded-2xl border border-[#b4533c]/40 bg-white p-4">
                            <input type="hidden" name="id" value={hid.id} />
                            <p className="text-[0.92rem] text-plum-900">This takes “{p.title}” out of the community for everyone. You can undo it for 24 hours.</p>
                            <button className={`${btnRed} mt-3`}>Yes, delete this post</button>
                          </Act>
                        </details>
                      </div>
                    </details>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="categories" className="mt-8 scroll-mt-28" aria-labelledby="cat-h">
        <h2 id="cat-h" className={h2}>Categories</h2>
        <p className="text-[0.88rem] text-plum-700">The rooms of your feed. Change a name, who can post, or who can see it. People who can&apos;t see a room get a friendly locked card instead.</p>
        <ul className="mt-3 space-y-3">
          {cats.map((c, i) => (
            <li key={c.id} className={`${card} p-4 sm:p-5`}>
              <details>
                <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 [&::-webkit-details-marker]:hidden">
                  <span className="font-medium text-plum-900">{c.name}</span>
                  <span className="text-[0.84rem] text-plum-700">Posting: {POST_RULES.find(([k]) => k === c.post)?.[1]} · Seen by: {VIEW_RULES.find(([k]) => k === c.view)?.[1]}</span>
                  <span className="ml-auto text-[0.74rem] font-medium uppercase tracking-[0.1em] text-amethyst">Edit</span>
                </summary>
                <Act action="category.save" back={`${back}#categories`} className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={c.id} />
                  <label className={lbl}>Name<input name="name" defaultValue={c.name} required className={field} /></label>
                  <label className={lbl}>Short description<input name="description" defaultValue={c.description} className={field} /></label>
                  <label className={lbl}>Who can post here<select name="post" defaultValue={c.post} className={field}>{POST_RULES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
                  <label className={lbl}>Who can see it<select name="view" defaultValue={c.view} className={field}>{VIEW_RULES.map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></label>
                  <div className="sm:col-span-2"><button className={btn}>Save category</button></div>
                </Act>
              </details>
              <div className="mt-2 flex gap-2">
                {i > 0 && <Act action="category.save" back={`${back}#categories`}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="move" value="up" /><button className={`${btnGhost} !px-4`} aria-label={`Move ${c.name} up`}><ArrowUp className="h-4 w-4" aria-hidden="true" /> Up</button></Act>}
                {i < cats.length - 1 && <Act action="category.save" back={`${back}#categories`}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="move" value="down" /><button className={`${btnGhost} !px-4`} aria-label={`Move ${c.name} down`}><ArrowDown className="h-4 w-4" aria-hidden="true" /> Down</button></Act>}
              </div>
            </li>
          ))}
        </ul>
        <Act action="category.save" back={`${back}#categories`} className={`${card} mt-3 flex flex-wrap items-end gap-2 p-4 sm:p-5`}>
          <label className={`${lbl} min-w-0 flex-1`}>Add a category<input name="name" required placeholder="Example: Kids & Family Hair" className={field} /></label>
          <button className={btn}>Add category</button>
        </Act>
      </section>
    </>
  );
}
