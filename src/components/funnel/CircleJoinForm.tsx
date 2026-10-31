"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { submitForm, formToObject } from "@/lib/forms";
import { Input, Honeypot } from "@/components/forms/Field";
import { membership } from "@/lib/portal/data";
import { useTrafficSource } from "./OptInForm";
import { demoSample } from "@/lib/demo";
import { useDemo } from "@/components/demo/useDemo";

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

/**
 * Membership signup. Demo: records the signup (Netlify form "circle-join") and opens the demo portal.
 * // TODO: Supabase Auth (Google) → Square subscription (trial) → member row → portal access
 */
export function CircleJoinForm() {
  const router = useRouter();
  const src = useTrafficSource();
  const [plan, setPlan] = useState<"monthly" | "annual">("monthly");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const demo = useDemo();
  const d = (v: string) => (demo ? v : undefined);

  async function go(data: Record<string, string>) {
    setStatus("sending");
    try {
      await submitForm("circle-join", { ...data, ...src, plan, membership: membership.name });
      try {
        sessionStorage.setItem("icb-first-name", (data["name"] || "").split(" ")[0].slice(0, 40));
      } catch {}
      router.push("/circle/welcome");
    } catch {
      setStatus("error");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = formToObject(form);
    if (data["bot-field"]) return;
    await go(data);
  }

  const planBtn = (key: "monthly" | "annual", title: string, price: string, note: string) => (
    <button
      type="button"
      onClick={() => setPlan(key)}
      aria-pressed={plan === key}
      className={`rounded-xl border p-4 text-left transition ${plan === key ? "border-amethyst bg-amethyst/[0.06] ring-1 ring-amethyst" : "border-plum-800/15 hover:border-plum-800/30"}`}
    >
      <span className="block text-[0.95rem] font-medium text-plum-900">{title}</span>
      <span className="mt-1 block font-display text-[1.4rem] leading-tight text-plum-900">{price || "Price: confirm"}</span>
      <span className="mt-1 block text-[0.78rem] text-plum-700">{note}</span>
    </button>
  );

  return (
    <div className="grid gap-5">
      <div className="grid grid-cols-2 gap-3">
        {planBtn("monthly", "Monthly", membership.monthlyPrice, "Cancel anytime")}
        {planBtn("annual", "Annual", membership.annualPrice, "Best value · pay once a year")}
      </div>

      <button
        type="button"
        onClick={() => go({ name: demo ? demoSample.fullName : "", email: "", "signup-method": "google" })}
        className="flex min-h-[3.3rem] w-full items-center justify-center gap-3 rounded-pill border border-plum-800/20 bg-white px-6 text-[0.95rem] font-medium text-plum-900 transition hover:border-plum-800/40"
      >
        <GoogleG /> Continue with Google
      </button>
      <div className="flex items-center gap-3 text-[0.75rem] uppercase tracking-[0.18em] text-plum-700">
        <span className="h-px flex-1 bg-plum-800/15" /> or use your email <span className="h-px flex-1 bg-plum-800/15" />
      </div>

      <form key={demo ? "demo" : "live"} name="circle-join" onSubmit={onSubmit} className="grid gap-3.5">
        <Honeypot />
        <Input label="Your name" name="name" required autoComplete="name" defaultValue={d(demoSample.fullName)} />
        <Input label="Email" name="email" type="email" required autoComplete="email" defaultValue={d(demoSample.email)} />
        <Input label="Mobile number" name="phone" type="tel" autoComplete="tel" hint="Optional, for lesson reminders" />
        <label className="flex items-start gap-3 text-[0.8rem] leading-snug text-plum-700/90">
          <input type="checkbox" name="consent" value="yes" required defaultChecked={demo} className="mt-0.5 h-4 w-4 shrink-0 accent-amethyst" />
          <span>I agree to the membership terms. My {membership.trialDays}-day free trial starts today and I can cancel anytime before it ends. This is education, not medical care.</span>
        </label>
        <button
          type="submit"
          disabled={status === "sending"}
          className="group mt-1 inline-flex min-h-[3.5rem] w-full items-center justify-center gap-3 rounded-pill bg-amethyst px-6 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_12px_30px_rgba(110,63,134,0.3)] transition hover:bg-plum-800 disabled:opacity-60"
        >
          {status === "sending" ? "Starting your trial…" : `Start my ${membership.trialDays}-day free trial`}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </button>
        <p className="text-center text-[0.78rem] text-plum-700">Secure payment through Square · You won&apos;t be charged during your trial</p>
        <div aria-live="polite">{status === "error" && <p className="text-center text-[0.9rem] text-[#b4533c]">Something went wrong. Please try again, or text (804) 397-3340.</p>}</div>
      </form>
    </div>
  );
}
