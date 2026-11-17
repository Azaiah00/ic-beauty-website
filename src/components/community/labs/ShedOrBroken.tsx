"use client";

/**
 * LAB: Shed or Broken? A tap / swipe / arrow-key sorting game. Education only: it teaches what to notice,
 * in the same words as Lesson 2 ("Reading Your Scalp"). It does not assess anyone's hair.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { reducedMotion, type LabProps } from "./types";

type Side = "shed" | "broken";
const CARDS: { text: string; answer: Side; why: string }[] = [
  { text: "A full-length strand with a tiny white bulb at the root end.", answer: "shed", why: "That little bulb usually means the hair finished its cycle and let go on its own. That's shedding." },
  { text: "A short piece, no bulb, with a rough end.", answer: "broken", why: "No bulb and a rough end points to a strand that snapped along its length. That's breakage." },
  { text: "A long strand with a bulb that slid out while you finger-detangled on wash day.", answer: "shed", why: "Full length plus a bulb is a shed hair. Wash day simply collects the hairs that were already ready to go." },
  { text: "Short pieces on your shoulders after brushing a tight ponytail.", answer: "broken", why: "Short pieces after tension or brushing are breakage. If it hurts, it's too tight." },
  { text: "Many long strands, each with a bulb, after a week in a protective style.", answer: "shed", why: "With 50 to 100 hairs shed on a normal day, a week tucked away adds up. It looks like a lot, but it's a week's worth at once." },
  { text: "A piece with a split, frayed tip and no bulb.", answer: "broken", why: "Frayed ends and no bulb mean the strand wore down and broke. That's breakage." },
  { text: "Little pieces of different lengths, always where your bonnet band sits.", answer: "broken", why: "Breakage in the same spot points to a habit. Here, friction from the band." },
  { text: "A strand as long as the rest of your hair, bulb at one end, on your pillow.", answer: "shed", why: "Same length as your other hair, with a bulb: a shed hair. Normal shedding happens day and night." },
  { text: "A strand that snapped mid-length when you combed it dry.", answer: "broken", why: "It snapped partway down, so there is no bulb. Combing dry puts stress on the strand. That's breakage." },
];

export default function ShedOrBroken({ onComplete }: LabProps) {
  const [i, setI] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<Side | null>(null);
  const [drag, setDrag] = useState(0);
  const start = useRef<number | null>(null);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const over = i >= CARDS.length;
  const card = CARDS[Math.min(i, CARDS.length - 1)];
  const right = picked === card.answer;

  const choose = useCallback(
    (side: Side) => {
      if (picked || over) return;
      setPicked(side);
      if (side === card.answer) setScore((s) => s + 1);
    },
    [picked, over, card.answer],
  );
  const next = useCallback(() => {
    setPicked(null);
    setDrag(0);
    setI((n) => n + 1);
  }, []);

  useEffect(() => {
    if (picked) nextBtn.current?.focus();
  }, [picked]);
  useEffect(() => {
    if (over) onComplete(Math.round((score / CARDS.length) * 100));
  }, [over, score, onComplete]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (e.key === "ArrowLeft") choose("shed");
      if (e.key === "ArrowRight") choose("broken");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [choose]);

  if (over) {
    const pct = score / CARDS.length;
    return (
      <section className="rounded-card border border-plum-800/10 bg-paper p-6 text-center sm:p-10" aria-live="polite">
        <p className="eyebrow text-amethyst">Your score</p>
        <p className="mt-2 font-display text-[3rem] leading-none text-plum-900">{score} of {CARDS.length}</p>
        <p className="mx-auto mt-3 max-w-md text-plum-800">
          {pct === 1 ? "A perfect read. Now you can look at your comb with awareness instead of worry." : pct >= 0.7 ? "You're reading the signs. One more round and it will be second nature." : "This takes practice. Remember: a bulb means shed, a rough end with no bulb means broken."}
        </p>
        <p className="mx-auto mt-3 max-w-md text-[0.92rem] text-plum-700">On your next wash day, look at a few strands the same way. Breakage in the same spot points to a habit you can change.</p>
        <button type="button" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-pill bg-plum-900 px-7 text-[0.78rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst" onClick={() => { setI(0); setScore(0); setPicked(null); }}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" /> Play again
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-card border border-plum-800/10 bg-paper p-4 sm:p-6" aria-labelledby="sob-h">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 id="sob-h" className="font-display text-[1.6rem] leading-tight text-plum-900">Shed, or broken?</h2>
          <p className="text-[0.92rem] text-plum-700">Tap a button, swipe the card, or use the left and right arrow keys.</p>
        </div>
        <p className="shrink-0 text-right text-[0.88rem] text-plum-800">
          Card {i + 1} of {CARDS.length}
          <span className="block font-medium text-plum-900">Score: {score}</span>
        </p>
      </div>

      <div
        className={`mt-5 flex min-h-[11rem] touch-pan-y select-none items-center justify-center rounded-card border-2 p-6 text-center ${picked ? (right ? "border-sage bg-sage/15" : "border-brass-deep bg-sand") : "border-plum-800/15 bg-bone"}`}
        style={{ transform: picked ? undefined : `translateX(${drag}px) rotate(${drag / 40}deg)` }}
        onPointerDown={(e) => { if (!picked) start.current = e.clientX; }}
        onPointerMove={(e) => { if (start.current !== null && !picked && !reducedMotion()) setDrag(Math.max(-120, Math.min(120, e.clientX - start.current))); }}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          setDrag(0);
          if (dx <= -50) choose("shed");
          else if (dx >= 50) choose("broken");
        }}
        onPointerCancel={() => { start.current = null; setDrag(0); }}
      >
        <p className="font-display text-[1.5rem] leading-snug text-plum-900 sm:text-[1.8rem]">{card.text}</p>
      </div>

      <div aria-live="polite" className="mt-4 min-h-[5.5rem]">
        {picked && (
          <div className="flex items-start gap-3">
            {right ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-sage" aria-hidden="true" /> : <XCircle className="mt-1 h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" />}
            <p className="text-plum-900">
              <strong>{right ? "Yes." : `Not quite. This one is ${card.answer}.`}</strong> {card.why}
            </p>
          </div>
        )}
      </div>

      {picked ? (
        <button ref={nextBtn} type="button" onClick={next} className="mt-2 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-pill bg-plum-900 px-7 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-bone hover:bg-amethyst">
          {i + 1 === CARDS.length ? "See my score" : "Next card"} <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : (
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => choose("shed")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-pill border-2 border-plum-900 bg-white px-4 text-[0.82rem] font-medium uppercase tracking-[0.14em] text-plum-900 hover:bg-mist">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Shed
          </button>
          <button type="button" onClick={() => choose("broken")} className="inline-flex min-h-14 items-center justify-center gap-2 rounded-pill border-2 border-plum-900 bg-white px-4 text-[0.82rem] font-medium uppercase tracking-[0.14em] text-plum-900 hover:bg-mist">
            Broken <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}
