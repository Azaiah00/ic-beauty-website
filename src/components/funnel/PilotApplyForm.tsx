"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { submitForm, formToObject } from "@/lib/forms";
import { Input, Select, Textarea, Honeypot } from "@/components/forms/Field";
import { funnel, pilotTiers } from "@/lib/funnel";
import { useTrafficSource } from "./OptInForm";
import { demoSample } from "@/lib/demo";
import { useDemo } from "@/components/demo/useDemo";

/** Short founding-seat application (5 questions, the pattern beta cohorts use to qualify + set expectations). */
export function PilotApplyForm() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const src = useTrafficSource();
  const demo = useDemo();
  const d = (v: string) => (demo ? v : undefined);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = formToObject(form);
    if (data["bot-field"]) return;
    setStatus("sending");
    try {
      await submitForm("pilot-application", { ...data, ...src, program: funnel.pilot.name });
      try {
        sessionStorage.setItem("icb-first-name", (data["name"] || "").split(" ")[0].slice(0, 40));
      } catch {}
      router.push(`${funnel.basePath}/reserved`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form key={demo ? "demo" : "live"} name="pilot-application" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Honeypot />
      <Input label="Your name" name="name" required autoComplete="name" defaultValue={d(demoSample.fullName)} />
      <Input label="Email" name="email" type="email" required autoComplete="email" defaultValue={d(demoSample.email)} />
      <Input label="Mobile number" name="phone" type="tel" required autoComplete="tel" hint="Your seat link comes by text" defaultValue={d(demoSample.phone)} />
      <Select label="I'm applying for" name="tier" required options={pilotTiers.map((t) => `${t.name} (${t.tag})`).concat("Not sure yet, help me choose")} defaultValue={d(`${pilotTiers[1].name} (${pilotTiers[1].tag})`)} />
      <Textarea
        className="sm:col-span-2"
        label="What's your biggest hair frustration right now?"
        name="frustration"
        required
        rows={3}
        placeholder="Breakage in the same spots, a scalp that won't calm down, not knowing what my hair needs…"
        defaultValue={d(demoSample.frustration)}
      />
      <Textarea
        className="sm:col-span-2"
        label="Thirty days from now, what would a new love story with your hair look like?"
        name="goal"
        required
        rows={3}
        defaultValue={d(demoSample.goal)}
      />
      <Select
        className="sm:col-span-2"
        label="Can you give about 2–3 hours a week during February?"
        name="commitment"
        required
        options={["Yes, I'm all in", "Mostly, I'll use the replays", "I'm not sure yet"]}
        defaultValue={d("Yes, I'm all in")}
      />
      <Select
        className="sm:col-span-2"
        label="How did you find Iisha?"
        name="heard-from"
        options={["TikTok Live", "TikTok video", "Instagram", "I'm a current client", "A friend told me", "Google", "Other"]}
        defaultValue={d("TikTok Live")}
      />
      <label className="flex items-start gap-3 text-[0.82rem] leading-snug text-plum-700/85 sm:col-span-2">
        <input type="checkbox" name="consent" value="yes" required defaultChecked={demo} className="mt-0.5 h-4 w-4 shrink-0 accent-amethyst" />
        <span>
          I agree to be contacted by I.C. Beauty by email and text about my application. I understand this is an education program, not medical advice or treatment.
        </span>
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group inline-flex min-h-[3.6rem] w-full items-center justify-center gap-3 rounded-pill bg-amethyst px-8 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_12px_30px_rgba(110,63,134,0.32)] transition-[background,transform] duration-300 hover:bg-plum-800 active:scale-[0.99] disabled:opacity-60 sm:w-auto"
        >
          {status === "sending" ? "Sending your application…" : "Apply for a founding seat"}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
        </button>
        <div aria-live="polite" className="mt-3">
          {status === "error" && (
            <p className="text-[0.92rem] text-[#b4533c]">Something went wrong. Please try again, or text (804) 397-3340.</p>
          )}
        </div>
      </div>
    </form>
  );
}
