"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, ShieldAlert } from "lucide-react";
import { useSubmit } from "@/components/forms/useSubmit";
import { FormStatus } from "@/components/forms/FormStatus";
import { Honeypot } from "@/components/forms/Field";

type Opt = { label: string; tags?: string[] };
type Q = { id: string; prompt: string; help?: string; options: Opt[]; multi?: boolean };

const QUESTIONS: Q[] = [
  {
    id: "who",
    prompt: "What brings you here today?",
    options: [
      { label: "I'm noticing changes in my own hair or scalp", tags: ["client"] },
      { label: "I want to prevent problems before they start", tags: ["client", "prevent"] },
      { label: "I'm a stylist and want to serve my clients better", tags: ["stylist"] },
      { label: "I'm planning an event for my organization", tags: ["org"] },
    ],
  },
  {
    id: "shedding",
    prompt: "Are you noticing more shedding than usual?",
    help: "Shedding 50–100 hairs a day is normal (AAD).",
    options: [
      { label: "Yes, noticeably more", tags: ["inside", "shed"] },
      { label: "A little more than usual", tags: ["shed-mild"] },
      { label: "No, about the same" },
    ],
  },
  {
    id: "where",
    prompt: "Where are you noticing change? Choose all that apply.",
    multi: true,
    options: [
      { label: "Edges / hairline", tags: ["tension"] },
      { label: "Crown or part is widening", tags: ["inside"] },
      { label: "All over, thinner overall", tags: ["inside"] },
      { label: "Distinct patches", tags: ["refer"] },
      { label: "Nowhere yet", tags: ["prevent"] },
    ],
  },
  {
    id: "styles",
    prompt: "How often do you wear styles that pull?",
    help: "Tight braids, sew-ins, ponytails, tight retwists, wigs with glue or bands.",
    options: [
      { label: "Most of the time", tags: ["tension", "tension"] },
      { label: "Sometimes", tags: ["tension"] },
      { label: "Rarely or never" },
    ],
  },
  {
    id: "scalp",
    prompt: "How does your scalp feel?",
    options: [
      { label: "Itchy, flaky, or tight", tags: ["scalp"] },
      { label: "Burning, painful, or I have sores", tags: ["refer"] },
      { label: "Sensitive when styled", tags: ["tension", "scalp"] },
      { label: "Comfortable" },
    ],
  },
  {
    id: "wash",
    prompt: "How often do you shampoo your scalp?",
    help: "Dermatologists suggest every 1–2 weeks for textured hair.",
    options: [
      { label: "Weekly" },
      { label: "Every 2 weeks" },
      { label: "Every 3–4 weeks", tags: ["scalp"] },
      { label: "Longer than a month", tags: ["scalp", "scalp"] },
    ],
  },
  {
    id: "inside",
    prompt: "In the last 6 months, have any of these happened? Choose all that apply.",
    multi: true,
    options: [
      { label: "High stress or a big life change", tags: ["inside"] },
      { label: "Childbirth, illness, surgery, or major weight change", tags: ["inside"] },
      { label: "Gut issues (reflux, bloating, irregular digestion)", tags: ["inside"] },
      { label: "Urges to pull or twist at my hair", tags: ["inside", "emotional"] },
      { label: "None of these" },
    ],
  },
];

type Profile = { key: string; name: string; headline: string; body: string; next: string[] };

const PROFILES: Record<string, Profile> = {
  tension: {
    key: "tension",
    name: "Tension Signals",
    headline: "Your answers point to tension. Your edges are asking for a break.",
    body: "Styles that pull, combined with changes at the hairline, are one of the most common patterns Iisha sees. The earlier you change course, the more options you have.",
    next: ["Loosen up: if a style hurts while it's installed, ask your stylist to stop and redo it.", "Give your hairline regular breaks between long-wear styles.", "Book a discovery call so Iisha can look at your hairline under magnification."],
  },
  inside: {
    key: "inside",
    name: "Inside-Out Signals",
    headline: "Your answers point inward. Your hair may be reflecting what your body is going through.",
    body: "Stress, life changes, digestion, and nutrition can all show up as shedding or overall thinning, often months after the trigger. This is exactly why the H.A.I.R. Method starts with your whole history.",
    next: ["Write down when the shedding started and what was happening a few months before it.", "Read 'Can gut health and nutrition affect your hair?' in the Library.", "Book a discovery call to map your history and decide if a full analysis makes sense."],
  },
  scalp: {
    key: "scalp",
    name: "Scalp Care Signals",
    headline: "Your answers point to your scalp. It needs more love than it's getting.",
    body: "Buildup, long gaps between wash days, and an itchy or tight scalp make a poor environment for healthy growth. The good news is that habits are the easiest thing to change.",
    next: ["Plan a shampoo between salon visits, every 1–2 weeks. Consider it self-care.", "Condition every time you wash, and be gentle at the hairline.", "A microscopic scalp analysis shows what's actually happening at the follicle."],
  },
  aware: {
    key: "aware",
    name: "Early Awareness",
    headline: "Healthy awareness is rare, and you've got it.",
    body: "You're not seeing many warning signs right now, which is the best time to build a regimen that keeps it that way. Prevention costs less, emotionally and financially, than recovery.",
    next: ["Download the free Hair Health Checklist and run it monthly.", "Join the H.A.I.R. Letter for seasonal scalp care tips.", "Take a class to learn wash day the right way."],
  },
};

function score(answers: Record<string, number[]>) {
  const tags: Record<string, number> = {};
  QUESTIONS.forEach((q) => (answers[q.id] ?? []).forEach((i) => (q.options[i].tags ?? []).forEach((t) => (tags[t] = (tags[t] ?? 0) + 1))));
  const who = answers.who?.[0];
  const route = who === 2 ? "stylist" : who === 3 ? "org" : "client";
  const refer = (tags.refer ?? 0) > 0;
  const ranked = (["tension", "inside", "scalp"] as const).map((k) => [k, tags[k] ?? 0] as const).sort((a, b) => b[1] - a[1]);
  const top = ranked[0][1] >= 2 ? PROFILES[ranked[0][0]] : PROFILES.aware;
  return { route, refer, profile: top, emotional: (tags.emotional ?? 0) > 0 };
}

export function ScalpCheck() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const panel = useRef<HTMLDivElement>(null);
  const total = QUESTIONS.length;
  const done = step >= total;
  const result = useMemo(() => (done ? score(answers) : null), [done, answers]);
  const summary = () =>
    Object.fromEntries(QUESTIONS.map((q) => [`q-${q.id}`, (answers[q.id] ?? []).map((i) => q.options[i].label).join(" | ")]));
  const { status, onSubmit } = useSubmit("scalp-check", () => ({ ...summary(), profile: result?.profile.name ?? "", "refer-flag": result?.refer ? "yes" : "no" }));

  const q = QUESTIONS[Math.min(step, total - 1)];
  const sel = answers[q.id] ?? [];

  const focusPanel = () => requestAnimationFrame(() => panel.current?.focus());
  const choose = (i: number) => {
    if (q.multi) {
      setAnswers((a) => {
        const cur = a[q.id] ?? [];
        const isNone = /^(None|Nowhere)/.test(q.options[i].label);
        let next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
        if (isNone) next = cur.includes(i) ? [] : [i];
        else next = next.filter((x) => !/^(None|Nowhere)/.test(q.options[x].label));
        return { ...a, [q.id]: next };
      });
    } else {
      setAnswers((a) => ({ ...a, [q.id]: [i] }));
      // Early exit for stylists/orgs: route them on step 1
      if (q.id === "who" && (i === 2 || i === 3)) {
        setStep(total);
      } else setTimeout(() => setStep((s) => s + 1), 220);
      focusPanel();
    }
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    focusPanel();
  };

  return (
    <div className="relative overflow-hidden rounded-card border border-lilac/15 bg-plum-950 text-bone shadow-[0_40px_120px_-40px_rgba(23,14,27,0.8)]">
      {/* progress lens bar */}
      <div className="flex items-center justify-between gap-4 border-b border-lilac/10 px-6 py-4 sm:px-10">
        <p className="eyebrow text-brass-soft">Scalp Self-Check</p>
        <div className="flex items-center gap-3">
          <span className="eyebrow text-lilac/75">{done ? "Result" : `${step + 1} / ${total}`}</span>
          <div className="h-1 w-28 overflow-hidden rounded-full bg-plum-700" aria-hidden="true">
            <div className="h-full rounded-full bg-gradient-to-r from-amethyst to-brass transition-[width] duration-500" style={{ width: `${(Math.min(step, total) / total) * 100}%` }} />
          </div>
        </div>
      </div>

      <div ref={panel} tabIndex={-1} className="px-6 py-10 outline-none sm:px-10 sm:py-14" aria-live="polite">
        {!done && (
          <fieldset key={q.id}>
            <legend className="font-display text-[clamp(1.6rem,1.2rem+1.6vw,2.6rem)] leading-tight">{q.prompt}</legend>
            {q.help && <p className="mt-3 text-lilac/70">{q.help}</p>}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {q.options.map((o, i) => {
                const on = sel.includes(i);
                return (
                  <button
                    key={o.label}
                    type="button"
                    role={q.multi ? "checkbox" : "radio"}
                    aria-checked={on}
                    onClick={() => choose(i)}
                    className={`group flex min-h-[4rem] items-center gap-4 rounded-2xl border px-5 py-4 text-left text-[1.02rem] transition duration-300 ${
                      on ? "border-brass bg-brass/15 text-bone" : "border-lilac/15 bg-plum-950/40 text-lilac hover:border-lilac/50 hover:text-bone"
                    }`}
                  >
                    <span aria-hidden="true" className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${on ? "border-brass bg-brass" : "border-lilac/40"}`}>
                      <span className={`h-2 w-2 rounded-full bg-ink transition ${on ? "scale-100" : "scale-0"}`} />
                    </span>
                    {o.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex items-center justify-between">
              <button type="button" onClick={() => { setStep((s) => Math.max(0, s - 1)); focusPanel(); }} disabled={step === 0} className="inline-flex items-center gap-2 text-lilac/70 transition hover:text-bone disabled:opacity-30">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
              </button>
              {q.multi && (
                <button type="button" onClick={() => { setStep((s) => s + 1); focusPanel(); }} disabled={sel.length === 0} className="inline-flex items-center gap-2 rounded-pill bg-bone px-6 py-3 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900 transition hover:bg-white disabled:opacity-40">
                  Next <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </fieldset>
        )}

        {done && result && result.route === "stylist" && (
          <div>
            <p className="eyebrow text-brass-soft">Your path</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,1.4rem+2vw,3.2rem)] leading-tight">Turn your consultations into currency.</h2>
            <p className="mt-4 max-w-2xl text-lilac/80">Professional Education is built for stylists who want higher retention, better color results, and the confidence to talk about scalp health without overstepping.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/professional-education" className="rounded-pill bg-bone px-6 py-3.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900 hover:bg-white">See classes for stylists</Link>
              <button onClick={restart} className="inline-flex items-center gap-2 rounded-pill border border-lilac/30 px-6 py-3.5 text-lilac hover:text-bone"><RotateCcw className="h-4 w-4" aria-hidden="true" />Take the client check instead</button>
            </div>
          </div>
        )}

        {done && result && result.route === "org" && (
          <div>
            <p className="eyebrow text-brass-soft">Your path</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,1.4rem+2vw,3.2rem)] leading-tight">Bring healthy awareness to your audience.</h2>
            <p className="mt-4 max-w-2xl text-lilac/80">Keynotes and hands-on workshops for HBCUs, sororities, churches, women&apos;s organizations, and professional audiences.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/speaking" className="rounded-pill bg-bone px-6 py-3.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900 hover:bg-white">See talks & book Iisha</Link>
              <button onClick={restart} className="inline-flex items-center gap-2 rounded-pill border border-lilac/30 px-6 py-3.5 text-lilac hover:text-bone"><RotateCcw className="h-4 w-4" aria-hidden="true" />Start over</button>
            </div>
          </div>
        )}

        {done && result && result.route === "client" && (
          <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="eyebrow text-brass-soft">Your awareness profile</p>
              <h2 className="mt-3 font-display text-[clamp(2.2rem,1.4rem+2.4vw,3.6rem)] leading-[1.02]">{result.profile.name}</h2>
              <p className="mt-4 text-[1.15rem] text-bone">{result.profile.headline}</p>
              <p className="mt-3 text-lilac/80">{result.profile.body}</p>
              {result.refer && (
                <div className="mt-6 flex gap-3 rounded-2xl border border-brass/40 bg-brass/10 p-5 text-[0.95rem] text-brass-soft">
                  <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <p>Distinct patches, burning, pain, or sores can have a medical cause. Please see a board-certified dermatologist. Iisha is happy to work alongside your doctor on scalp care and education.</p>
                </div>
              )}
              {result.emotional && (
                <p className="mt-4 text-[0.95rem] text-lilac/80">You mentioned urges to pull at your hair. You&apos;re not alone. Emotional healing tools are part of Iisha&apos;s approach, and a licensed mental health professional can be a powerful partner too.</p>
              )}
              <h3 className="eyebrow mt-8 text-lilac/75">Your next three steps</h3>
              <ol className="mt-3 space-y-3">
                {result.profile.next.map((n, i) => (
                  <li key={n} className="flex gap-4"><span className="font-display text-2xl leading-none text-brass">{i + 1}</span><span className="text-lilac">{n}</span></li>
                ))}
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/book?profile=${encodeURIComponent(result.profile.name)}`} className="rounded-pill bg-bone px-6 py-3.5 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900 hover:bg-white">Book my free discovery call</Link>
                <button onClick={restart} className="inline-flex items-center gap-2 rounded-pill border border-lilac/30 px-6 py-3.5 text-lilac hover:text-bone"><RotateCcw className="h-4 w-4" aria-hidden="true" />Retake</button>
              </div>
              <p className="mt-6 text-[0.78rem] text-lilac/75">This self-check is educational. It is not a diagnosis or medical advice.</p>
            </div>
            <div className="rounded-3xl border border-lilac/15 bg-plum-950/50 p-6 sm:p-8">
              <p className="eyebrow text-brass-soft">Email me my results</p>
              <p className="mt-3 text-lilac/80">Iisha will email your profile, your next steps, and the free Hair Health Checklist.</p>
              <form name="scalp-check" onSubmit={onSubmit} className="mt-5 space-y-3">
                <Honeypot />
                <label htmlFor="sc-name" className="sr-only">First name</label>
                <input id="sc-name" name="name" autoComplete="given-name" placeholder="First name" className="h-12 w-full rounded-xl border border-lilac/20 bg-plum-900 px-4 text-bone placeholder:text-lilac/40 outline-none focus:border-brass" />
                <label htmlFor="sc-email" className="sr-only">Email</label>
                <input id="sc-email" name="email" type="email" required autoComplete="email" placeholder="Email" className="h-12 w-full rounded-xl border border-lilac/20 bg-plum-900 px-4 text-bone placeholder:text-lilac/40 outline-none focus:border-brass" />
                <button type="submit" disabled={status === "sending" || status === "sent"} className="h-12 w-full rounded-pill bg-bone font-medium text-ink transition hover:bg-brass-soft disabled:opacity-60">
                  {status === "sent" ? "Sent" : status === "sending" ? "Sending…" : "Send my results"}
                </button>
                <FormStatus status={status} tone="dark" sent="Saved. Your profile and the free Hair Health Checklist are headed to your email." />
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
