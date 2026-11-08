"use client";
import { useSubmit } from "@/components/forms/useSubmit";
import { FormStatus } from "@/components/forms/FormStatus";
import { Input, Honeypot } from "@/components/forms/Field";
import { demoSample } from "@/lib/demo";
import { useDemo } from "@/components/demo/useDemo";

/**
 * Pre-payments "buy" path: captures the order request so no sale is lost while Square checkout
 * isn't connected. Iisha replies with a secure Square payment link. Remove once checkoutUrl is set.
 */
export function ProductRequestForm({ product, price, notify = false }: { product: string; price: string; notify?: boolean }) {
  const { status, onSubmit } = useSubmit("product-request", () => ({ product, price, request: notify ? "Notify me when it launches" : "Send checkout link" }));
  const demo = useDemo();
  const d = (v: string) => (demo ? v : undefined);
  return (
    <form key={demo ? "demo" : "live"} name="product-request" onSubmit={onSubmit} className="grid gap-3.5">
      <Honeypot />
      <Input label="Your name" name="name" required autoComplete="name" defaultValue={d(demoSample.fullName)} />
      <Input label="Email" name="email" type="email" required autoComplete="email" defaultValue={d(demoSample.email)} />
      <Input label="Mobile number" name="phone" type="tel" autoComplete="tel" hint="Optional" />
      <label className="flex items-start gap-3 text-[0.8rem] leading-snug text-plum-700/85">
        <input type="checkbox" name="consent" value="yes" required defaultChecked={demo} className="mt-0.5 h-4 w-4 shrink-0 accent-amethyst" />
        <span>{notify ? "Email me when it's ready. I can unsubscribe any time." : "Send me my secure checkout link and order details by email or text."}</span>
      </label>
      <button
        type="submit"
        disabled={status === "sending" || status === "sent"}
        className="mt-1 inline-flex min-h-[3.4rem] w-full items-center justify-center rounded-pill bg-amethyst px-6 font-sans text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-bone shadow-[0_12px_30px_rgba(110,63,134,0.28)] transition hover:bg-plum-800 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : status === "sent" ? (notify ? "You're on the list" : "Request received") : notify ? "Notify me when it's ready" : `Get it · ${price}`}
      </button>
      <FormStatus status={status} sent={notify ? "You're on the early list. You'll be the first to know the moment it's ready." : "You're all set! Iisha will send your secure checkout link shortly, usually within 24 hours."} />
    </form>
  );
}
