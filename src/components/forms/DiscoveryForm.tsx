"use client";
import { useSearchParams } from "next/navigation";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";
import { Input, Select, Textarea, Honeypot, Consent } from "./Field";

export const DISCOVERY_TYPES = [
  "Phase 1 · Complimentary 15-min discovery call",
  "Virtual hair health appointment",
  "Phase 2 · Full consultation (I've had my discovery call)",
  "Hair recovery program check-in",
  "Parent / family class (Child Hair-Care, Flat Ironing, Twisting)",
];

export function DiscoveryForm() {
  const params = useSearchParams();
  const t = params.get("type");
  const preset = t === "virtual" ? DISCOVERY_TYPES[1] : t === "class" ? DISCOVERY_TYPES[4] : DISCOVERY_TYPES[0];
  const profile = params.get("profile") ?? "";
  const { status, onSubmit } = useSubmit("discovery-call", () => ({ "scalp-check-profile": profile }));

  if (status === "sent")
    return (
      <div className="rounded-card border border-plum-800/10 bg-paper p-8">
        <p className="eyebrow text-amethyst">Request received</p>
        <h3 className="mt-3 font-display text-4xl text-plum-900">The sooner you start, the sooner you heal.</h3>
        <p className="mt-3 text-plum-700">
          Iisha will reach out within 2 business days to confirm your time. Openings typically run 4–12 weeks out. Want a head start? Take the Scalp Self-Check or download the free Hair Health Checklist.
        </p>
      </div>
    );

  return (
    <form name="discovery-call" onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <Select className="sm:col-span-2" label="What would you like to book?" name="request-type" required options={DISCOVERY_TYPES} defaultValue={preset} />
      <Input label="First and last name" name="name" required autoComplete="name" />
      <Input label="Phone" name="phone" type="tel" required autoComplete="tel" hint="Call or text" />
      <Input className="sm:col-span-2" label="Email" name="email" type="email" required autoComplete="email" />
      <Select label="How long have you noticed changes?" name="duration" options={["Less than 3 months", "3–12 months", "1–3 years", "More than 3 years", "Not sure / prevention"]} />
      <Select label="Best time to reach you" name="best-time" options={["Weekday mornings", "Weekday afternoons", "Weekday evenings", "Saturday"]} />
      <Select className="sm:col-span-2" label="Preferred format" name="format" options={["In studio (Henrico / Short Pump)", "Phone", "Video call"]} />
      <Textarea className="sm:col-span-2" label="Tell Iisha what's going on" name="message" hint="Optional" placeholder="Shedding, thinning edges, an itchy scalp, what you've tried…" />
      {profile && <p className="sm:col-span-2 text-sm text-plum-700">Your Scalp Self-Check result (<strong>{profile}</strong>) will be shared with Iisha.</p>}
      <div className="sm:col-span-2"><Consent /></div>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={status === "sending"} className="h-14 rounded-pill bg-plum-900 px-8 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-bone transition hover:bg-amethyst disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Request my discovery call"}
        </button>
        <FormStatus status={status} sent="" />
      </div>
    </form>
  );
}
