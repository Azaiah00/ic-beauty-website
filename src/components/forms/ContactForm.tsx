"use client";
import { useSubmit } from "./useSubmit";
import { FormStatus } from "./FormStatus";
import { Input, Select, Textarea, Honeypot } from "./Field";

export function ContactForm() {
  const { status, onSubmit } = useSubmit("contact");
  return (
    <form name="contact" onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <Honeypot />
      <Input label="Name" name="name" required autoComplete="name" />
      <Input label="Email" name="email" type="email" required autoComplete="email" />
      <Input label="Phone" name="phone" type="tel" autoComplete="tel" hint="Optional" />
      <Select label="Topic" name="topic" options={["Hair recovery", "Classes for stylists", "Parent / family classes", "Speaking & workshops", "Products / supplements", "Press & partnerships", "Something else"]} />
      <Textarea className="sm:col-span-2" label="Message" name="message" required rows={5} />
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={status === "sending"} className="h-14 rounded-pill bg-plum-900 px-8 font-sans text-[0.74rem] font-medium uppercase tracking-[0.16em] text-bone transition hover:bg-amethyst disabled:opacity-60">
          {status === "sending" ? "Sending…" : "Send message"}
        </button>
        <FormStatus status={status} sent="Thank you. Iisha will get back to you soon." />
      </div>
    </form>
  );
}
