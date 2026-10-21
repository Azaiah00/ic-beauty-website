"use client";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";
import { Input, Select, Textarea, Honeypot, Consent } from "./Field";
import { talks } from "@/lib/content";

export function SpeakingForm() {
  const { status, onSubmit } = useSubmit("speaking-inquiry");
  if (status === "sent")
    return (
      <div className="rounded-card border border-plum-800/10 bg-bone p-8">
        <p className="eyebrow text-amethyst">Inquiry received</p>
        <h3 className="mt-3 font-display text-4xl text-plum-900">Thank you. Let&apos;s bring awareness to your audience.</h3>
        <p className="mt-3 text-plum-700">Iisha&apos;s team will reply within 3 business days with availability and next steps.</p>
      </div>
    );
  return (
    <form name="speaking-inquiry" onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <Input label="Your name" name="name" required autoComplete="name" />
      <Input label="Role / title" name="role" />
      <Input label="Organization" name="organization" required autoComplete="organization" />
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input label="Phone" name="phone" type="tel" autoComplete="tel" />
      <Input label="Event date" name="event-date" type="date" />
      <Select label="Audience" name="audience-type" required options={["HBCU / university", "Sorority / Greek org", "Church / faith community", "Women's organization", "Corporate / ERG", "Beauty school / stylist association", "Health fair / community", "Parents / school", "Other"]} />
      <Select label="Audience size" name="audience-size" options={["Under 25", "25–75", "75–200", "200–500", "500+"]} />
      <Select label="Format" name="format" options={["Keynote (45–60 min)", "Workshop (90–180 min)", "Panel", "Virtual session", "Not sure yet"]} />
      <Select label="Location" name="location" options={["Richmond / Central VA", "Elsewhere in Virginia", "Out of state", "Virtual"]} />
      <Select className="sm:col-span-2" label="Talk of interest" name="talk" options={[...talks.map((t) => `${t.title} — ${t.sub}`), "Custom topic"]} />
      <Select label="Budget range" name="budget" options={["Under $500", "$500–$1,500", "$1,500–$3,500", "$3,500+", "Community / nonprofit rate request"]} />
      <Input label="How did you hear about Iisha?" name="referral" />
      <Textarea className="sm:col-span-2" label="Tell us about your event" name="message" placeholder="Goals, theme, who's in the room…" />
      <div className="sm:col-span-2"><Consent /></div>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={status === "sending"} className="h-14 rounded-pill bg-plum-900 px-8 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-bone transition hover:bg-amethyst disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Send speaking inquiry"}
        </button>
        <FormStatus status={status} sent="" />
      </div>
    </form>
  );
}
