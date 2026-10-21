"use client";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";
import { Honeypot } from "./Field";

export function NewsletterForm() {
  const { status, onSubmit } = useSubmit("newsletter");
  return (
    <form name="newsletter" onSubmit={onSubmit} className="space-y-3" noValidate={false}>
      <Honeypot />
      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="nl-email" className="sr-only">Email address</label>
        <input id="nl-email" name="email" type="email" required autoComplete="email" placeholder="Your email" className="h-12 w-full rounded-pill border sm:flex-1 border-lilac/20 bg-plum-900/70 px-5 text-bone placeholder:text-lilac/40 outline-none focus:border-lilac focus:ring-2 focus:ring-lilac/30" />
        <button type="submit" disabled={status === "sending"} className="h-12 rounded-pill bg-bone px-6 font-sans text-[0.72rem] font-medium uppercase tracking-[0.16em] text-plum-900 transition hover:bg-white disabled:opacity-60">
          {status === "sending" ? "Joining…" : "Join the letter"}
        </button>
      </div>
      <FormStatus status={status} tone="dark" sent="You're in. Class is in session." />
    </form>
  );
}
