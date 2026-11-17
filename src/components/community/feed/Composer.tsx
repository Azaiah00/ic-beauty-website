"use client";

/**
 * The write box and composer: title, light formatting (bold, italic, list, link), up to 4 photos
 * (resized in the browser to 1600px before upload), a YouTube/Vimeo link, a poll, and a category.
 */
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Bold, ImagePlus, Italic, Link2, List, Video, X } from "lucide-react";
import { Sheet, act, useToast } from "../client";

const field = "block min-h-11 w-full rounded-xl border border-plum-800/20 bg-white px-3.5 py-2 text-[1rem] text-ink outline-none focus:border-amethyst focus:ring-2 focus:ring-amethyst/20";
const tool = "inline-flex h-11 min-w-11 items-center justify-center gap-1.5 rounded-xl px-2.5 text-[0.86rem] text-plum-800 hover:bg-mist";

async function resize(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.85);
}

export type ComposerProps = {
  avatar: React.ReactNode;
  categories: { id: string; name: string }[];
  start?: { open: boolean; category?: string; title?: string; body?: string };
};

export function Composer({ avatar, categories, start }: ComposerProps) {
  const [open, setOpen] = useState(!!start?.open);
  const [images, setImages] = useState<string[]>([]);
  const [poll, setPoll] = useState<string[] | null>(null);
  const [video, setVideo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const body = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();
  const router = useRouter();
  const path = usePathname();

  // Opened from a link (?compose=…): tidy the address bar so a refresh doesn't reopen it.
  useEffect(() => {
    if (start?.open) window.history.replaceState(null, "", path);
  }, [start?.open, path]);

  const wrap = (before: string, after = before, fallback = "text") => {
    const t = body.current;
    if (!t) return;
    const sel = t.value.slice(t.selectionStart, t.selectionEnd) || fallback;
    t.setRangeText(`${before}${sel}${after}`, t.selectionStart, t.selectionEnd, "end");
    t.focus();
  };

  const addPhotos = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    for (const f of [...files].slice(0, 4 - images.length)) {
      if (f.size > 20 * 1024 * 1024) {
        toast("That photo is very large. Please choose a smaller one.", false);
        continue;
      }
      try {
        const r = await act("upload", { dataUrl: await resize(f) });
        if (r.ok && r.data?.url) setImages((x) => [...x, String(r.data!.url)].slice(0, 4));
        else toast(r.message ?? "That photo couldn't be added.", false);
      } catch {
        toast("That photo couldn't be read. Please try a JPG or PNG.", false);
      }
    }
    setBusy(false);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    const r = await act("post.create", { category: f.get("category"), title: f.get("title"), body: f.get("body"), images, video: video ?? "", poll: (poll ?? []).map((o) => o.trim()).filter(Boolean) });
    setBusy(false);
    if (!r.ok) return toast(r.message ?? "Your post couldn't be shared. Please try again.", false);
    toast(r.message ?? "Your post is up.");
    setOpen(false);
    setImages([]);
    setPoll(null);
    setVideo(null);
    router.push(r.goto ?? "/community");
    router.refresh();
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex min-h-[4.25rem] w-full items-center gap-3 rounded-card border border-plum-800/10 bg-paper px-4 text-left transition hover:border-amethyst">
        {avatar}
        <span className="flex-1 text-plum-700">Share a win, ask a question…</span>
        <span className="hidden rounded-pill bg-plum-900 px-5 py-2.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-bone sm:inline">Write a post</span>
      </button>

      <Sheet open={open} onClose={() => setOpen(false)} title="Write a post" wide>
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-[0.9rem] text-plum-800">
            Where should this go?
            <select name="category" defaultValue={start?.category && categories.some((c) => c.id === start.category) ? start.category : categories.find((c) => c.id === "general")?.id ?? categories[0]?.id} className={`${field} mt-1`}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="block text-[0.9rem] text-plum-800">
            Title
            <input name="title" required maxLength={140} defaultValue={start?.title} placeholder="What's this about?" className={`${field} mt-1`} />
          </label>
          <div>
            <label htmlFor="composer-body" className="block text-[0.9rem] text-plum-800">Your post</label>
            <div className="mt-1 flex flex-wrap gap-0.5 rounded-t-xl border border-b-0 border-plum-800/20 bg-bone px-1" role="toolbar" aria-label="Formatting">
              <button type="button" className={tool} onClick={() => wrap("**")} aria-label="Bold"><Bold className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" className={tool} onClick={() => wrap("*")} aria-label="Italic"><Italic className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" className={tool} onClick={() => wrap("\n- ", "", "list item")} aria-label="List"><List className="h-4 w-4" aria-hidden="true" /></button>
              <button type="button" className={tool} onClick={() => wrap("[", "](https://)", "link text")} aria-label="Link"><Link2 className="h-4 w-4" aria-hidden="true" /></button>
            </div>
            <textarea id="composer-body" ref={body} name="body" rows={7} maxLength={8000} defaultValue={start?.body} placeholder="Say it in your own words. To mention someone, type @ and their full name." className={`${field} rounded-t-none`} />
          </div>

          {images.length > 0 && (
            <ul className="grid grid-cols-4 gap-2">
              {images.map((src) => (
                <li key={src} className="relative aspect-square overflow-hidden rounded-xl bg-sand">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="Photo you added" className="h-full w-full object-cover" />
                  <button type="button" aria-label="Remove photo" onClick={() => setImages((x) => x.filter((y) => y !== src))} className="absolute right-1 top-1 flex h-8 w-8 items-center justify-center rounded-full bg-plum-950/80 text-bone"><X className="h-4 w-4" aria-hidden="true" /></button>
                </li>
              ))}
            </ul>
          )}
          {video !== null && (
            <label className="block text-[0.9rem] text-plum-800">
              YouTube or Vimeo link
              <input value={video} onChange={(e) => setVideo(e.target.value)} placeholder="https://youtu.be/…" inputMode="url" className={`${field} mt-1`} />
            </label>
          )}
          {poll && (
            <fieldset className="space-y-2 rounded-xl border border-plum-800/15 p-3">
              <legend className="px-1 text-[0.9rem] text-plum-800">Poll choices (2 to 6)</legend>
              {poll.map((o, i) => (
                <input key={i} value={o} onChange={(e) => setPoll(poll.map((x, j) => (j === i ? e.target.value : x)))} maxLength={120} aria-label={`Choice ${i + 1}`} placeholder={`Choice ${i + 1}`} className={field} />
              ))}
              <div className="flex gap-2">
                {poll.length < 6 && <button type="button" className={tool} onClick={() => setPoll([...poll, ""])}>Add a choice</button>}
                <button type="button" className={tool} onClick={() => setPoll(null)}>Remove poll</button>
              </div>
            </fieldset>
          )}

          <div className="flex flex-wrap items-center gap-1 border-t border-plum-800/10 pt-3">
            <label className={`${tool} cursor-pointer ${images.length >= 4 ? "pointer-events-none opacity-40" : ""}`}>
              <ImagePlus className="h-5 w-5 text-amethyst" aria-hidden="true" /> Photos
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
            </label>
            <button type="button" className={tool} onClick={() => setVideo(video === null ? "" : null)} aria-pressed={video !== null}><Video className="h-5 w-5 text-amethyst" aria-hidden="true" /> Video link</button>
            <button type="button" className={tool} onClick={() => setPoll(poll ? null : ["", ""])} aria-pressed={!!poll}><BarChart3 className="h-5 w-5 text-amethyst" aria-hidden="true" /> Poll</button>
            <button disabled={busy} className="ml-auto inline-flex min-h-11 items-center justify-center rounded-pill bg-plum-900 px-7 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst disabled:opacity-50">{busy ? "One moment…" : "Share post"}</button>
          </div>
        </form>
      </Sheet>
    </>
  );
}
