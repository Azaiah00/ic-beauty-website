"use client";

/**
 * Small client islands shared by the community: calling an action, toasts (aria-live), a modal sheet
 * (native <dialog>: focus stays inside, Esc closes), and a button that runs one action.
 */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

export type ActResult = { ok: boolean; message?: string; data?: Record<string, unknown>; goto?: string; auditId?: string };

/** POST /api/community/<action>. Always resolves; a refusal comes back as { ok: false, message }. */
export async function act(action: string, args: Record<string, unknown> = {}): Promise<ActResult> {
  try {
    const res = await fetch(`/api/community/${action}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args) });
    return (await res.json()) as ActResult;
  } catch {
    return { ok: false, message: "We couldn't reach the community just now. Please check your connection and try again." };
  }
}

type Toast = { id: number; text: string; ok: boolean; undo?: string };
const ToastCtx = createContext<(text: string, ok?: boolean, undo?: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const router = useRouter();
  const push = useCallback((text: string, ok = true, undo?: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, text, ok, undo }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), undo ? 12000 : 6000);
  }, []);

  // Messages that arrive in the address bar after a plain form post (?msg= / ?err= / ?undo=).
  useEffect(() => {
    const url = new URL(window.location.href);
    const msg = url.searchParams.get("msg");
    const err = url.searchParams.get("err");
    if (!msg && !err) return;
    push(msg || err || "", !err, url.searchParams.get("undo") ?? undefined);
    for (const k of ["msg", "err", "undo"]) url.searchParams.delete(k);
    window.history.replaceState(null, "", url.pathname + (url.search ? url.search : "") + url.hash);
  }, [push]);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-20 z-[70] flex flex-col items-center gap-2 px-4 lg:bottom-6">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl px-4 py-3 text-[0.95rem] shadow-[0_18px_40px_-18px_rgba(36,19,42,0.6)] ${t.ok ? "bg-plum-900 text-bone" : "bg-paper text-plum-950 ring-2 ring-brass-deep"}`}>
            {t.ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brass-soft" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" />}
            <span className="min-w-0 flex-1">{t.text}</span>
            {t.undo && (
              <button
                type="button"
                className="min-h-11 shrink-0 rounded-pill bg-bone px-4 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-plum-900"
                onClick={async () => {
                  const r = await act("audit.undo", { id: t.undo });
                  setToasts((x) => x.filter((y) => y.id !== t.id));
                  push(r.message ?? (r.ok ? "Undone." : "That couldn't be undone."), r.ok);
                  router.refresh();
                }}
              >
                Undo
              </button>
            )}
            <button type="button" aria-label="Dismiss" className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full opacity-70 hover:opacity-100" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))}>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/** Run an action, show what happened, refresh the page data. */
export function useAct() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const run = useCallback(
    async (action: string, args: Record<string, unknown> = {}, opts: { quiet?: boolean; refresh?: boolean } = {}) => {
      setBusy(true);
      const r = await act(action, args);
      setBusy(false);
      if (!r.ok) toast(r.message ?? "That didn't work. Please try again.", false);
      else if (r.message && !opts.quiet) toast(r.message, true, r.auditId);
      if (r.ok && r.goto) router.push(r.goto);
      else if (r.ok && opts.refresh !== false) router.refresh();
      return r;
    },
    [router, toast],
  );
  return { run, busy };
}

/** A button that does one thing. `confirm` asks first, in plain English. */
export function ActButton({ action, args, children, className, confirm, quiet, label, disabled, onDone }: { action: string; args?: Record<string, unknown>; children: React.ReactNode; className?: string; confirm?: string; quiet?: boolean; label?: string; disabled?: boolean; onDone?: (r: ActResult) => void }) {
  const { run, busy } = useAct();
  const [asking, setAsking] = useState(false);
  const go = async () => {
    setAsking(false);
    const r = await run(action, args, { quiet });
    onDone?.(r);
  };
  return (
    <>
      <button type="button" className={className} aria-label={label} disabled={busy || disabled} onClick={() => (confirm ? setAsking(true) : go())}>
        {children}
      </button>
      {confirm && (
        <Sheet open={asking} onClose={() => setAsking(false)} title="Are you sure?">
          <p className="text-plum-800">{confirm}</p>
          <div className="mt-6 flex flex-wrap justify-end gap-2">
            <button type="button" className="inline-flex min-h-11 items-center rounded-pill border border-plum-900/25 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900" onClick={() => setAsking(false)}>
              No, go back
            </button>
            <button type="button" className="inline-flex min-h-11 items-center rounded-pill bg-plum-900 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst" onClick={go}>
              Yes, do it
            </button>
          </div>
        </Sheet>
      )}
    </>
  );
}

/** Modal sheet on a native <dialog>: keyboard focus is trapped inside and Esc closes it. */
export function Sheet({ open, onClose, title, children, wide = false }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-label={title}
      data-lenis-prevent
      className={`m-auto w-[calc(100vw-1.5rem)] ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-card bg-paper p-0 text-ink shadow-2xl backdrop:bg-plum-950/55 backdrop:backdrop-blur-[2px]`}
    >
      {open && (
        <div className="p-5 sm:p-7">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="font-display text-[1.7rem] leading-tight text-plum-900">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-plum-800 hover:bg-mist">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}
