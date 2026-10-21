"use client";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";
import { Input, Select, Honeypot } from "./Field";
import { stylistClasses } from "@/lib/content";

export function WaitlistForm({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { status, onSubmit } = useSubmit("class-waitlist");
  return (
    <form name="class-waitlist" onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Honeypot />
      <Input tone={tone} label="Name" name="name" required autoComplete="name" />
      <Input tone={tone} label="Email" name="email" type="email" required autoComplete="email" />
      <Input tone={tone} label="Salon / business" name="salon" hint="Optional" />
      <Select tone={tone} label="I'm interested in" name="class" required options={stylistClasses.map((c) => c.name)} />
      <Select tone={tone} className="sm:col-span-2" label="I am a…" name="role" options={["Licensed stylist / cosmetologist", "Salon owner", "Cosmetology student", "Barber", "Educator / school"]} />
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={status === "sending"} className={`rounded-pill px-7 py-4 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] transition disabled:opacity-60 ${tone === "dark" ? "bg-brass text-ink hover:bg-brass-soft" : "bg-plum-900 text-bone hover:bg-amethyst"}`}>
          {status === "sending" ? "Saving your seat…" : "Join the class waitlist"}
        </button>
        <FormStatus status={status} tone={tone} sent="You're on the list. You'll hear about dates before anyone else." />
      </div>
    </form>
  );
}
