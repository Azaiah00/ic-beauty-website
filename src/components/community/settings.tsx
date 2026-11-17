"use client";

/** Settings islands: profile photo upload and the cancel flow ("Before you go" → 3 questions → confirm). */
import { useState } from "react";
import { Camera } from "lucide-react";
import { Sheet, act, useAct, useToast } from "./client";

const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill bg-linear-to-b from-plum-800 to-plum-950 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-bone transition hover:from-amethyst hover:to-plum-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-2px_0_rgba(0,0,0,0.22),0_10px_22px_-12px_rgba(36,19,42,0.75)] ring-1 ring-inset ring-brass-soft/30 active:translate-y-px active:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-1px_0_rgba(0,0,0,0.2)] disabled:opacity-50";
const ghost = "inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border border-plum-900/25 px-6 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-plum-900 hover:border-plum-900 disabled:opacity-50";
const field = "block min-h-11 w-full rounded-xl border border-plum-800/20 bg-white px-3.5 py-2 text-[1rem] text-ink outline-none focus:border-amethyst focus:ring-2 focus:ring-amethyst/20";

export function PhotoButton({ hasPhoto }: { hasPhoto: boolean }) {
  const { run, busy } = useAct();
  const toast = useToast();
  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      const bmp = await createImageBitmap(file);
      const side = Math.min(bmp.width, bmp.height);
      const c = document.createElement("canvas");
      c.width = c.height = Math.min(600, side);
      c.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, c.width, c.height);
      const up = await act("upload", { dataUrl: c.toDataURL("image/jpeg", 0.88) });
      if (!up.ok || !up.data?.url) return toast(up.message ?? "That photo couldn't be added.", false);
      await run("profile.save", { photo: up.data.url });
    } catch {
      toast("That photo couldn't be read. Please try a JPG or PNG.", false);
    }
  };
  return (
    <div className="flex flex-wrap gap-2">
      <label className={`${ghost} cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
        <Camera className="h-4 w-4" aria-hidden="true" /> {hasPhoto ? "Change photo" : "Add a photo"}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      </label>
      {hasPhoto && <button type="button" className={ghost} disabled={busy} onClick={() => run("profile.save", { photo: "" })}>Remove photo</button>}
    </div>
  );
}

export function CancelFlow({ plan, planName, circleName, until }: { plan: "circle" | "inner"; planName: string; circleName: string; until: string }) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [answers, setAnswers] = useState({ joined: "", leaving: "", kept: "" });
  const { run, busy } = useAct();
  const close = () => setStep(0);
  const finish = async (to: "free" | "circle") => {
    const r = await run("plan.cancel", { to, ...answers });
    if (r.ok) close();
  };
  return (
    <>
      <button type="button" className="min-h-11 text-[0.92rem] text-plum-700 underline underline-offset-4 hover:text-plum-900" onClick={() => setStep(1)}>Cancel my membership</button>
      <Sheet open={step > 0} onClose={close} title={step === 1 ? "Before you go" : step === 2 ? "Three quick questions" : "Cancel your membership?"}>
        {step === 1 && (
          <div>
            <p className="text-plum-800">You don&apos;t have to leave the Circle to make it lighter. You could stay smaller instead:</p>
            <div className="mt-4 space-y-2">
              {plan === "inner" && (
                <button type="button" disabled={busy} className="flex min-h-16 w-full flex-col items-start justify-center rounded-2xl border border-plum-800/15 bg-white px-4 py-2 text-left hover:border-amethyst" onClick={() => finish("circle")}>
                  <span className="font-medium text-plum-900">Switch to {circleName}</span>
                  <span className="text-[0.88rem] text-plum-700">Keep the weekly lessons, My Journey and Ask Iisha. {planName} stays on until {until}.</span>
                </button>
              )}
              <button type="button" className="flex min-h-16 w-full flex-col items-start justify-center rounded-2xl border border-plum-800/15 bg-white px-4 py-2 text-left hover:border-amethyst" onClick={close}>
                <span className="font-medium text-plum-900">Keep {planName}</span>
                <span className="text-[0.88rem] text-plum-700">Nothing changes. I&apos;m staying.</span>
              </button>
              <button type="button" className="flex min-h-16 w-full flex-col items-start justify-center rounded-2xl border border-plum-800/15 bg-white px-4 py-2 text-left hover:border-amethyst" onClick={() => setStep(2)}>
                <span className="font-medium text-plum-900">Go back to the free plan</span>
                <span className="text-[0.88rem] text-plum-700">Stay in the community for free. Your paid access stays on until {until}.</span>
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
            <p className="text-plum-800">Your honest answers help Iisha make this better. They go straight to her.</p>
            {([["joined", "Why did you join?"], ["leaving", "Why are you leaving?"], ["kept", "What would have kept you?"]] as const).map(([k, q]) => (
              <label key={k} className="block text-[0.95rem] text-plum-900">{q}<textarea rows={2} maxLength={600} value={answers[k]} onChange={(e) => setAnswers({ ...answers, [k]: e.target.value })} className={`${field} mt-1`} /></label>
            ))}
            <div className="flex flex-wrap justify-end gap-2"><button type="button" className={ghost} onClick={() => setStep(1)}>Back</button><button className={primary}>Continue</button></div>
          </form>
        )}
        {step === 3 && (
          <div>
            <p className="text-plum-800">Your {planName} access stays on until <strong>{until}</strong>. After that you&apos;ll be a Free Member: still in the community, with your posts and progress saved. You can come back any time.</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button type="button" className={ghost} onClick={close}>No, keep my membership</button>
              <button type="button" className={primary} disabled={busy} onClick={() => finish("free")}>Yes, cancel it</button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
