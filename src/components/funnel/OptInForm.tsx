"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock } from "lucide-react";
import { submitForm, formToObject } from "@/lib/forms";
import { Honeypot } from "@/components/forms/Field";
import { funnel } from "@/lib/funnel";
import { demoSample } from "@/lib/demo";
import { useDemo } from "@/components/demo/useDemo";

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"] as const;

/** Reads ?utm_* (and ?ref=) so every lead shows where it came from (TikTok Live, IG bio, email…). */
export function useTrafficSource() {
  const [src, setSrc] = useState<Record<string, string>>({});
  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search);
      const out: Record<string, string> = {};
      UTM_KEYS.forEach((k) => {
        const v = p.get(k);
        if (v) out[k.replace("_", "-")] = v.slice(0, 80);
      });
      const ref = p.get("ref");
      if (ref) out["utm-source"] = out["utm-source"] || ref.slice(0, 80);
      if (!out["utm-source"] && document.referrer) {
        try {
          out["referrer"] = new URL(document.referrer).hostname;
        } catch {}
      }
      setSrc(out);
    } catch {}
  }, []);
  return src;
}

const field =
  "w-full rounded-xl border border-plum-800/15 bg-paper px-4 py-3.5 text-[1rem] text-ink outline-none transition placeholder:text-plum-700/45 focus:border-amethyst focus:ring-2 focus:ring-amethyst/20";

export function OptInForm({ id = "optin", cta = "Send me the checklist" }: { id?: string; cta?: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const src = useTrafficSource();
  const phoneRef = useRef<HTMLInputElement>(null);
  const [hasPhone, setHasPhone] = useState(false);
  const demo = useDemo();
  useEffect(() => setHasPhone(demo), [demo]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = formToObject(form);
    if (data["bot-field"]) return;
    setStatus("sending");
    try {
      await submitForm("hair-love-optin", { ...data, ...src, "lead-magnet": funnel.leadMagnet.title });
      try {
        sessionStorage.setItem("icb-first-name", (data["first-name"] || "").slice(0, 40));
      } catch {}
      router.push(`${funnel.basePath}/welcome`);
    } catch {
      setStatus("error");
    }
  }

  return (
    <form key={demo ? "demo" : "live"} id={id} name="hair-love-optin" onSubmit={onSubmit} className="grid gap-3.5" noValidate={false}>
      <Honeypot />
      <div>
        <label htmlFor={`${id}-name`} className="sr-only">First name</label>
        <input id={`${id}-name`} name="first-name" required autoComplete="given-name" defaultValue={demo ? demoSample.firstName : undefined} placeholder="First name" className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-email`} className="sr-only">Email</label>
        <input id={`${id}-email`} name="email" type="email" required autoComplete="email" inputMode="email" defaultValue={demo ? demoSample.email : undefined} placeholder="Email address" className={field} />
      </div>
      <div>
        <label htmlFor={`${id}-phone`} className="sr-only">Mobile number (optional)</label>
        <input
          ref={phoneRef}
          id={`${id}-phone`}
          name="phone"
          type="tel"
          defaultValue={demo ? demoSample.phone : undefined}
          autoComplete="tel"
          inputMode="tel"
          placeholder="Mobile number (optional)"
          className={field}
          onChange={(e) => setHasPhone(e.currentTarget.value.trim().length > 6)}
        />
      </div>
      {hasPhone && (
        <label className="flex items-start gap-3 text-[0.8rem] leading-snug text-plum-700/90">
          <input type="checkbox" name="sms-consent" value="yes" defaultChecked={demo} className="mt-0.5 h-4 w-4 shrink-0 accent-amethyst" />
          <span>
            Yes, text me hair tips and program updates from I.C. Beauty. Up to 4 msgs/month. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. Consent is not required to get the checklist.
          </span>
        </label>
      )}
      <button
        type="submit"
        disabled={status === "sending"}
        className="group mt-1 inline-flex min-h-[3.6rem] w-full items-center justify-center gap-3 rounded-pill bg-amethyst px-6 font-sans text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_12px_30px_rgba(110,63,134,0.32)] transition-[background,box-shadow,transform] duration-300 hover:bg-plum-800 active:scale-[0.99] disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : cta}
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
      </button>
      <p className="flex items-center justify-center gap-2 text-center text-[0.78rem] text-plum-700/80">
        <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Free &amp; instant. No spam, unsubscribe anytime.
      </p>
      <div aria-live="polite">
        {status === "error" && (
          <p className="text-center text-[0.9rem] text-[#b4533c]">
            Something went wrong. Please try again, or text (804) 397-3340.
          </p>
        )}
      </div>
    </form>
  );
}
