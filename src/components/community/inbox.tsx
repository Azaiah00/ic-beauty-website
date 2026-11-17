"use client";

/** Messages islands: the send box, and a quiet refresh every 30 seconds while the page is visible. */
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { useAct } from "./client";

export function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = setInterval(() => document.visibilityState === "visible" && router.refresh(), seconds * 1000);
    return () => clearInterval(t);
  }, [router, seconds]);
  return null;
}

export function MessageBox({ thread, to }: { thread: string; to: string }) {
  const { run, busy } = useAct();
  const ref = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => end.current?.scrollIntoView({ block: "nearest" }), []);
  return (
    <form
      className="flex items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const body = ref.current?.value.trim();
        if (!body) return;
        const r = await run("message.send", { thread, body }, { quiet: true });
        if (r.ok && ref.current) ref.current.value = "";
        end.current?.scrollIntoView({ block: "nearest" });
      }}
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">Message to {to}</span>
        <textarea ref={ref} rows={2} maxLength={3000} placeholder={`Write to ${to}…`} className="block min-h-11 w-full resize-y rounded-xl border border-plum-800/20 bg-white px-3.5 py-2 text-[1rem] text-ink outline-none focus:border-amethyst focus:ring-2 focus:ring-amethyst/20" />
      </label>
      <button disabled={busy} aria-label="Send message" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-plum-900 text-bone hover:bg-amethyst disabled:opacity-50">
        <Send className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>
      <div ref={end} />
    </form>
  );
}
