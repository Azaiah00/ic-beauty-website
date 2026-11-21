/**
 * Recovery-program enrollments paid through /recovery, read live from Square (owner dashboard → Recovery enrollments).
 * Each checkout creates a Square order with reference_id "recovery" and metadata { channel, plan, pay, confirm_email? }
 * (see recoveryCheckout.ts); only fully paid ones count. Name, email and phone come from the Square customer the
 * checkout created, or from the payment itself. Square stays the record of truth; Iisha's progress notes live in
 * tracking.ts (recovery/<orderId>). Server-only.
 */
import { recoveryPlans, recoveryCreditCents, usdWhole, SITE_URL, business, type RecoveryPlanId } from "@/lib/site";
import { base, VERSION, LOCATION } from "./squareLive";
import { sendEmail, OWNER } from "./email";
import { renderConfirmation, renderEnrollmentAlert } from "./templates";
import { getRecoveryMark, setRecoveryMark } from "./tracking";

export type Enrollment = {
  id: string;
  createdAt: string;
  planId: RecoveryPlanId | "";
  program: string; // "Supported Recovery (90 days)"
  pay: "deposit" | "full";
  paidCents: number;
  /** What is still owed after today's payment and the $100 credit (0 when paid in full). */
  balanceCents: number;
  name: string;
  email: string;
  phone: string;
  receiptUrl: string;
  /** The address the client typed on /recovery when they asked for an email confirmation ("" if they didn't). */
  confirmEmail: string;
};

type SqOrder = {
  id: string;
  created_at: string;
  reference_id?: string;
  metadata?: Record<string, string>;
  customer_id?: string;
  tenders?: { id?: string; customer_id?: string; payment_id?: string }[];
  net_amount_due_money?: { amount?: number };
  total_money?: { amount?: number };
  line_items?: { name?: string }[];
};
type SqPayment = { buyer_email_address?: string; receipt_url?: string; billing_address?: { first_name?: string; last_name?: string }; shipping_address?: { first_name?: string; last_name?: string } };
type SqCustomer = { given_name?: string; family_name?: string; email_address?: string; phone_number?: string };

const headers = () => ({ Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`, "Square-Version": VERSION, "Content-Type": "application/json" });
const isPaidRecovery = (o: SqOrder) =>
  (o.reference_id === "recovery" || o.metadata?.channel === "recovery") && (o.tenders?.length ?? 0) > 0 && (o.net_amount_due_money?.amount ?? 0) === 0;
const customerIdOf = (o: SqOrder) => o.customer_id ?? o.tenders?.find((t) => t.customer_id)?.customer_id ?? "";

async function getJson<T>(url: string): Promise<T | undefined> {
  const r = await fetch(url, { headers: headers(), cache: "no-store", signal: AbortSignal.timeout(8000) }).catch(() => null);
  return r && r.ok ? ((await r.json()) as T) : undefined;
}

async function enrich(orders: SqOrder[]): Promise<Enrollment[]> {
  const ids = [...new Set(orders.map(customerIdOf).filter(Boolean))];
  const customers = new Map<string, SqCustomer>();
  const payments = new Map<string, SqPayment>();
  await Promise.all([
    ...ids.slice(0, 100).map(async (id) => {
      const c = (await getJson<{ customer?: SqCustomer }>(`${base()}/v2/customers/${id}`))?.customer;
      if (c) customers.set(id, c);
    }),
    ...orders.slice(0, 100).map(async (o) => {
      const pid = o.tenders?.[0]?.payment_id ?? o.tenders?.[0]?.id;
      const p = pid ? (await getJson<{ payment?: SqPayment }>(`${base()}/v2/payments/${pid}`))?.payment : undefined;
      if (p) payments.set(o.id, p);
    }),
  ]);
  return orders.map((o) => {
    const item = o.line_items?.[0]?.name ?? "";
    const plan = recoveryPlans.find((p) => p.id === o.metadata?.plan) ?? recoveryPlans.find((p) => item.startsWith(`${p.name} Recovery`));
    const pay: "deposit" | "full" = o.metadata?.pay === "full" || /paid in full/i.test(item) ? "full" : "deposit";
    const paidCents = o.total_money?.amount ?? 0;
    const c = customers.get(customerIdOf(o));
    const p = payments.get(o.id);
    const addr = p?.billing_address ?? p?.shipping_address;
    return {
      id: o.id,
      createdAt: o.created_at,
      planId: plan?.id ?? "",
      program: plan ? `${plan.name} Recovery (${plan.term})` : item.split(":")[0] || "Recovery program",
      pay,
      paidCents,
      balanceCents: plan && pay === "deposit" ? Math.max(0, plan.fullCents - paidCents - recoveryCreditCents) : 0,
      name: [c?.given_name, c?.family_name].filter(Boolean).join(" ") || [addr?.first_name, addr?.last_name].filter(Boolean).join(" "),
      email: c?.email_address || p?.buyer_email_address || o.metadata?.confirm_email || "",
      phone: c?.phone_number ?? "",
      receiptUrl: p?.receipt_url ?? "",
      confirmEmail: o.metadata?.confirm_email ?? "",
    };
  });
}

/** Paid enrollments, newest first, from the last `days` days (default 2 years). null = Square not connected or not answering. */
export async function getRecoveryEnrollments(days = 730): Promise<Enrollment[] | null> {
  if (!process.env.SQUARE_ACCESS_TOKEN) return null;
  try {
    const found: SqOrder[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 10; page++) {
      const res = await fetch(`${base()}/v2/orders/search`, {
        method: "POST",
        headers: headers(),
        cache: "no-store",
        body: JSON.stringify({
          location_ids: [LOCATION],
          limit: 500,
          ...(cursor ? { cursor } : {}),
          query: {
            filter: { date_time_filter: { created_at: { start_at: new Date(Date.now() - days * 864e5).toISOString() } }, state_filter: { states: ["OPEN", "COMPLETED"] } },
            sort: { sort_field: "CREATED_AT", sort_order: "DESC" },
          },
        }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      const json = (await res.json()) as { orders?: SqOrder[]; cursor?: string };
      found.push(...(json.orders ?? []));
      cursor = json.cursor;
      if (!cursor) break;
    }
    return enrich(found.filter(isPaidRecovery));
  } catch (e) {
    console.error("[square] recovery enrollments failed", e);
    return null;
  }
}

/** One enrollment by Square order id, or null if it isn't a paid recovery order. */
export async function getEnrollment(orderId: string): Promise<Enrollment | null> {
  if (!process.env.SQUARE_ACCESS_TOKEN || !/^[A-Za-z0-9_-]{6,64}$/.test(orderId)) return null;
  try {
    const o = (await getJson<{ order?: SqOrder }>(`${base()}/v2/orders/${orderId}`))?.order;
    if (!o || !isPaidRecovery(o)) return null;
    return (await enrich([o]))[0] ?? null;
  } catch (e) {
    console.error("[square] recovery enrollment lookup failed", e);
    return null;
  }
}

/**
 * Runs once per paid enrollment, however many times it's called (thank-you page, Square webhook, dashboard catch-up):
 * emails Iisha a new-enrollment alert, and emails the client their confirmation if they asked for one on /recovery.
 * The data always comes from Square, never from the visitor, so a crafted URL can't trigger an email.
 */
export async function processEnrollment(orderIdOrEnrollment: string | Enrollment) {
  const e = typeof orderIdOrEnrollment === "string" ? await getEnrollment(orderIdOrEnrollment) : orderIdOrEnrollment;
  if (!e) return { ok: false as const, reason: "not-a-paid-enrollment" };
  const mark = await getRecoveryMark(e.id);
  if (mark?.alertedAt) return { ok: true as const, already: true };
  // Claim it first so a second caller arriving at the same moment skips it.
  await setRecoveryMark(e.id, { alertedAt: new Date().toISOString() });

  const r = await sendEnrollmentEmails(e);
  // If the alert didn't go out (email not connected yet), release the claim so the next pass tries again.
  await setRecoveryMark(e.id, { ...(r.alertOk ? {} : { alertedAt: "" }), ...(r.confirmedTo ? { confirmedTo: r.confirmedTo } : {}), emailLog: r.log.join(" · ") });
  return { ok: true as const, already: false, log: r.log };
}

/**
 * The two enrollment emails: Iisha's alert, and the client's confirmation (only when they asked for one).
 * `test` marks both subjects [TEST] and sends the client copy to `testTo` (dashboard → Send a test).
 */
export async function sendEnrollmentEmails(e: Enrollment, opts: { test?: boolean; testTo?: string } = {}) {
  const tag = opts.test ? "[TEST] " : "";
  const log: string[] = [];
  const alert = renderEnrollmentAlert(e);
  const a = await sendEmail({ to: OWNER, subject: `${tag}New enrollment: ${e.name || e.email || "Recovery client"}, ${e.program}`, ...alert, replyTo: e.email || undefined });
  log.push(`Alert to Iisha: ${a.ok ? "sent" : `not sent (${a.error ?? "email off"})`}`);

  let confirmedTo = "";
  const to = opts.test ? opts.testTo ?? "" : e.confirmEmail;
  if (to) {
    const first = (e.name.split(/\s+/)[0] || "").replace(/^\w/, (c) => c.toUpperCase());
    const paidLine =
      e.pay === "full"
        ? `You paid <strong>${usdWhole(e.paidCents)}</strong> in full, with your <strong>${usdWhole(recoveryCreditCents)} Program Credit</strong> already applied.`
        : `Your deposit of <strong>${usdWhole(e.paidCents)}</strong> is in. Your <strong>${usdWhole(recoveryCreditCents)} Program Credit</strong> comes off your remaining program balance of <strong>${usdWhole(e.balanceCents + recoveryCreditCents)}</strong>, leaving <strong>${usdWhole(e.balanceCents)}</strong>. Your first program installment is due at your first program visit, scheduled 30-45 days from today.`;
    const c = renderConfirmation({
      subject: `You're enrolled: ${e.program}`,
      heading: first ? `${first}, you're enrolled.` : "You're enrolled.",
      paragraphs: [
        `Thank you for choosing <strong>${e.program}</strong>. Your recovery starts here.`,
        paidLine,
        "Next, I'll customize your care plan and send it to you by email, then we'll review it together on your <strong>Recovery Roadmap Zoom</strong> and schedule your program appointments.",
        `Please remember: cancel or reschedule at least 48 hours before an appointment. Questions? Reply to this email, or call or text me at ${business.phone}.`,
      ],
      cta: { label: "Review your program", href: `${SITE_URL}/recovery` },
    });
    const r = await sendEmail({ to, subject: `${tag}You're enrolled: ${e.program}`, ...c });
    log.push(`Confirmation to ${to}: ${r.ok ? "sent" : `not sent (${r.error ?? "email off"})`}`);
    if (r.ok) confirmedTo = to;
  }
  return { alertOk: a.ok, confirmedTo, log };
}
