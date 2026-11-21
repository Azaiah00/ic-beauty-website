/**
 * Square checkout link for a recovery program deposit or full payment. The order carries a one-off line item (name + price),
 * so no Square Online store or catalog item is needed; the payment lands in Iisha's Square like any sale.
 * Only the plans and amounts in `recoveryPlans` (site.ts) can be charged: nobody can craft a custom amount.
 */
import { SITE_URL, recoveryPlans, recoveryFullTodayCents, usdWhole, recoveryCreditCents, type RecoveryPlanId } from "@/lib/site";
import { base, VERSION, LOCATION } from "./squareLive";

export type PayKind = "deposit" | "full";

export async function createRecoveryCheckout(planId: RecoveryPlanId, pay: PayKind, confirmEmail?: string) {
  const plan = recoveryPlans.find((p) => p.id === planId);
  if (!plan) return { ok: false as const, reason: "missing" };
  const amount = pay === "full" ? recoveryFullTodayCents(plan) : plan.depositCents; // full = price less the $100 program credit
  const label = `${plan.name} Recovery (${plan.term}): ${pay === "full" ? `paid in full, ${usdWhole(recoveryCreditCents)} program credit applied` : "deposit"}`;
  const res = await fetch(`${base()}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`, "Square-Version": VERSION, "Content-Type": "application/json" },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      description: `Website recovery enrollment: ${label}`,
      // An order with a one-off line item (no catalog item needed). reference_id + metadata let the owner dashboard
      // (Recovery enrollments) find these payments in Square and know the program and payment option.
      order: {
        location_id: LOCATION,
        reference_id: "recovery",
        metadata: { channel: "recovery", plan: plan.id, pay, ...(confirmEmail ? { confirm_email: confirmEmail } : {}) },
        line_items: [{ name: label, quantity: "1", base_price_money: { amount, currency: "USD" } }],
      },
      checkout_options: {
        redirect_url: `${SITE_URL}/recovery/thank-you?plan=${plan.id}&pay=${pay}`,
        ask_for_shipping_address: false,
        merchant_support_email: "icbeautyinyou@gmail.com",
      },
      ...(confirmEmail ? { pre_populated_data: { buyer_email: confirmEmail } } : {}),
      payment_note: `Recovery program (website): ${label}`,
    }),
    signal: AbortSignal.timeout(10000),
  });
  const json = (await res.json().catch(() => ({}))) as { payment_link?: { url?: string }; errors?: { code: string; detail?: string }[] };
  if (!res.ok || !json.payment_link?.url) {
    console.error("[square] recovery payment link failed", res.status, json.errors?.[0]);
    return { ok: false as const, reason: "error" };
  }
  return { ok: true as const, url: json.payment_link.url };
}
