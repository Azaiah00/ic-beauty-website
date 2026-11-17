"use client";

/** Client islands for the feed: like, poll vote, post options, comment box, load-more and the post modal. */
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUp, EyeOff, Flag, Heart, Mail, MoreHorizontal, MoveRight, Pencil, Pin, Send, Sparkles, Trash2 } from "lucide-react";
import { Sheet, act, useAct, useToast } from "../client";

const row = "flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[1rem] text-plum-900 hover:bg-mist disabled:opacity-50";
const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-linear-to-b from-plum-800 to-plum-950 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-bone transition hover:from-amethyst hover:to-plum-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-2px_0_rgba(0,0,0,0.22),0_10px_22px_-12px_rgba(36,19,42,0.75)] ring-1 ring-inset ring-brass-soft/30 active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2)] disabled:opacity-50";
const field = "block min-h-11 w-full rounded-xl border border-plum-800/20 bg-white px-3.5 py-2 text-[1rem] text-ink outline-none focus:border-amethyst focus:ring-2 focus:ring-amethyst/20";

export function LikeButton({ action, args, liked, count, own, what }: { action: "post.like" | "comment.like"; args: Record<string, unknown>; liked: boolean; count: number; own: boolean; what: string }) {
  const [state, setState] = useState({ liked, count });
  const toast = useToast();
  const router = useRouter();
  useEffect(() => setState({ liked, count }), [liked, count]);
  return (
    <button
      type="button"
      aria-pressed={state.liked}
      aria-label={`${state.liked ? "Unlike" : "Like"} ${what}. ${state.count} ${state.count === 1 ? "like" : "likes"}`}
      disabled={own}
      title={own ? "Likes come from other members" : undefined}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-[0.92rem] transition disabled:cursor-default ${state.liked ? "text-amethyst" : "text-plum-700 hover:bg-mist hover:text-plum-900"}`}
      onClick={async () => {
        const before = state;
        setState({ liked: !before.liked, count: before.count + (before.liked ? -1 : 1) });
        const r = await act(action, args);
        if (!r.ok) {
          setState(before);
          toast(r.message ?? "That didn't work. Please try again.", false);
        } else router.refresh();
      }}
    >
      <Heart className="h-[18px] w-[18px]" aria-hidden="true" fill={state.liked ? "currentColor" : "none"} strokeWidth={1.7} />
      <span className="tabular-nums">{state.count}</span>
    </button>
  );
}

export function PollVote({ postId, options, mine }: { postId: string; options: { id: string; text: string; votes: number }[]; mine: string | null }) {
  const { run, busy } = useAct();
  const total = options.reduce((a, o) => a + o.votes, 0);
  return (
    <fieldset className="space-y-2">
      <legend className="sr-only">Poll</legend>
      {options.map((o) => {
        const pct = total ? Math.round((o.votes / total) * 100) : 0;
        const on = mine === o.id;
        return (
          <button key={o.id} type="button" disabled={busy} aria-pressed={on} onClick={() => run("post.vote", { id: postId, option: o.id }, { quiet: true })} className={`relative flex min-h-12 w-full items-center justify-between gap-3 overflow-hidden rounded-xl border px-4 text-left text-[0.96rem] transition ${on ? "border-amethyst text-plum-900" : "border-plum-800/15 text-plum-900 hover:border-amethyst"}`}>
            <span aria-hidden="true" className={`absolute inset-y-0 left-0 ${on ? "bg-lilac/60" : "bg-mist"}`} style={{ width: `${pct}%` }} />
            <span className="relative">{o.text}{on && <span className="sr-only"> (your vote)</span>}</span>
            <span className="relative shrink-0 tabular-nums text-plum-700">{pct}%</span>
          </button>
        );
      })}
      <p className="text-[0.82rem] text-plum-700">{total} {total === 1 ? "vote" : "votes"}{mine ? " · Tap another choice to change yours" : " · Tap to vote"}</p>
    </fieldset>
  );
}

type MenuProps = { id: string; title: string; body: string; own: boolean; staff: boolean; admin: boolean; pinned: boolean; hidden: boolean; spotlight: boolean; categoryId: string; categories: { id: string; name: string }[] };

/** "More" on a post: big, plain choices in a sheet (never a tiny dropdown). */
export function PostMenu(p: MenuProps) {
  const [mode, setMode] = useState<null | "menu" | "edit" | "report" | "move" | "delete" | "email">(null);
  const { run, busy } = useAct();
  const close = () => setMode(null);
  const go = async (action: string, args: Record<string, unknown> = {}) => {
    const r = await run(action, { id: p.id, ...args });
    if (r.ok) close();
  };
  return (
    <>
      <button type="button" aria-label={`More options for “${p.title}”`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-plum-700 hover:bg-mist" onClick={() => setMode("menu")}>
        <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
      </button>
      <Sheet open={mode !== null} onClose={close} title={mode === "edit" ? "Edit your post" : mode === "report" ? "Report this post" : mode === "move" ? "Move to another category" : mode === "delete" ? "Delete this post?" : mode === "email" ? "Email this to all members?" : "Post options"}>
        {mode === "menu" && (
          <div className="space-y-1">
            {p.own && <button type="button" className={row} onClick={() => setMode("edit")}><Pencil className="h-5 w-5 text-amethyst" aria-hidden="true" /> Edit</button>}
            {!p.own && <button type="button" className={row} onClick={() => setMode("report")}><Flag className="h-5 w-5 text-amethyst" aria-hidden="true" /> Report to Iisha&apos;s team</button>}
            {p.staff && (
              <>
                <button type="button" className={row} disabled={busy} onClick={() => go("post.pin")}><Pin className="h-5 w-5 text-amethyst" aria-hidden="true" /> {p.pinned ? "Unpin from the top" : "Pin to the top of the feed"}</button>
                <button type="button" className={row} disabled={busy} onClick={() => go("post.spotlight")}><Sparkles className="h-5 w-5 text-amethyst" aria-hidden="true" /> {p.spotlight ? "Remove the Spotlight" : "Feature as Spotlight for 7 days"}</button>
                <button type="button" className={row} disabled={busy} onClick={() => go("post.hide")}><EyeOff className="h-5 w-5 text-amethyst" aria-hidden="true" /> {p.hidden ? "Show it to members again" : "Hide it from members"}</button>
                <button type="button" className={row} onClick={() => setMode("move")}><MoveRight className="h-5 w-5 text-amethyst" aria-hidden="true" /> Move to another category</button>
              </>
            )}
            {p.admin && <button type="button" className={row} onClick={() => setMode("email")}><Mail className="h-5 w-5 text-amethyst" aria-hidden="true" /> Email this to all members</button>}
            {(p.own || p.staff) && <button type="button" className={row} onClick={() => setMode("delete")}><Trash2 className="h-5 w-5 text-brass-deep" aria-hidden="true" /> Delete</button>}
          </div>
        )}
        {mode === "edit" && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); const f = new FormData(e.currentTarget); go("post.update", { title: f.get("title"), body: f.get("body") }); }}>
            <label className="block text-[0.9rem] text-plum-800">Title<input name="title" defaultValue={p.title} required maxLength={140} className={`${field} mt-1`} /></label>
            <label className="block text-[0.9rem] text-plum-800">Your post<textarea name="body" defaultValue={p.body} rows={7} className={`${field} mt-1`} /></label>
            <div className="flex justify-end"><button className={primary} disabled={busy}>Save changes</button></div>
          </form>
        )}
        {mode === "report" && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); go("post.report", { reason: new FormData(e.currentTarget).get("reason") }); }}>
            <p className="text-plum-800">Only Iisha&apos;s team sees this. Thank you for looking out for the Circle.</p>
            <label className="block text-[0.9rem] text-plum-800">What&apos;s wrong with it?
              <select name="reason" className={`${field} mt-1`}>
                {["Selling or spam", "Unkind or disrespectful", "Medical claims", "Something else"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <div className="flex justify-end"><button className={primary} disabled={busy}>Send report</button></div>
          </form>
        )}
        {mode === "move" && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); go("post.move", { category: new FormData(e.currentTarget).get("category") }); }}>
            <label className="block text-[0.9rem] text-plum-800">Move to
              <select name="category" defaultValue={p.categoryId} className={`${field} mt-1`}>{p.categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
            </label>
            <div className="flex justify-end"><button className={primary} disabled={busy}>Move post</button></div>
          </form>
        )}
        {mode === "delete" && (
          <div>
            <p className="text-plum-800">{p.own ? "This removes your post and its comments for everyone." : "This removes the post for everyone. You can undo it from the activity log for 24 hours."}</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className="inline-flex min-h-11 items-center rounded-pill border border-plum-900/25 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900" onClick={close}>No, keep it</button>
              <button type="button" className={primary} disabled={busy} onClick={() => go("post.delete")}>Yes, delete it</button>
            </div>
          </div>
        )}
        {mode === "email" && (
          <div>
            <p className="text-plum-800">Every member gets this post by email. You can do this once every 72 hours, so save it for what matters. In the demo, nothing is actually sent.</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className="inline-flex min-h-11 items-center rounded-pill border border-plum-900/25 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900" onClick={close}>No, go back</button>
              <button type="button" className={primary} disabled={busy} onClick={() => go("post.broadcast")}>Yes, email everyone</button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}

export function CommentBox({ post, parent, placeholder = "Write a comment…", label = "Write a comment" }: { post: string; parent?: string; placeholder?: string; label?: string }) {
  const { run, busy } = useAct();
  const ref = useRef<HTMLTextAreaElement>(null);
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const body = ref.current?.value.trim();
        if (!body) return;
        const r = await run("comment.create", { post, parent, body }, { quiet: true });
        if (r.ok && ref.current) ref.current.value = "";
      }}
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">{label}</span>
        <textarea ref={ref} rows={2} maxLength={3000} placeholder={placeholder} className={`${field} resize-y`} />
      </label>
      <button className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum-900 text-bone hover:bg-amethyst disabled:opacity-50" disabled={busy} aria-label="Post comment">
        <Send className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
    </form>
  );
}

export function DeleteComment({ post, id }: { post: string; id: string }) {
  const { run, busy } = useAct();
  const [ask, setAsk] = useState(false);
  return ask ? (
    <span className="inline-flex items-center gap-2 text-[0.84rem]">
      Delete this comment?
      <button type="button" disabled={busy} className="min-h-11 rounded-pill bg-plum-900 px-4 text-bone" onClick={() => run("comment.delete", { post, id })}>Yes</button>
      <button type="button" className="min-h-11 rounded-pill border border-plum-900/25 px-4" onClick={() => setAsk(false)}>No</button>
    </span>
  ) : (
    <button type="button" className="min-h-11 px-2 text-[0.88rem] text-plum-700 underline-offset-2 hover:underline" onClick={() => setAsk(true)}>Delete</button>
  );
}

/** Infinite scroll: when the marker comes into view, ask the server for ten more posts. */
export function LoadMore({ shown, total }: { shown: number; total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();
  const [top, setTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setTop(window.scrollY > 1400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown >= total) return;
    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      const next = new URLSearchParams(params.toString());
      next.set("n", String(shown + 10));
      router.replace(`${path}?${next}`, { scroll: false });
    }, { rootMargin: "600px" });
    io.observe(el);
    return () => io.disconnect();
  }, [shown, total, params, path, router]);
  return (
    <>
      <div ref={ref} className="py-6 text-center text-[0.9rem] text-plum-700" aria-live="polite">
        {shown < total ? "Loading more posts…" : total > 6 ? "You're all caught up." : ""}
      </div>
      {top && (
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-24 right-4 z-30 inline-flex min-h-11 items-center gap-2 rounded-pill bg-plum-900 px-4 text-[0.78rem] font-medium uppercase tracking-[0.12em] text-bone shadow-xl lg:bottom-8 lg:right-8">
          <ArrowUp className="h-4 w-4" aria-hidden="true" /> Back to top
        </button>
      )}
    </>
  );
}

/** A post opened over the feed. Closing goes back to where you were. */
export function PostModal({ title, children }: { title: string; children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Sheet open onClose={() => router.back()} title={title} wide>
      {children}
    </Sheet>
  );
}
