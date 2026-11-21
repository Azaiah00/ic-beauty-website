/**
 * Owner dashboard → Recovery enrollments.
 *   POST (action=status, id, status, notes)  Iisha's progress on an enrollment
 *   POST (action=test, email)                send both enrollment emails as [TEST] with sample data (nothing is charged)
 *   GET                                      every enrollment as a spreadsheet (CSV), straight from Square
 */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/auth";
import { RECOVERY_STATUSES, setRecoveryMark, getRecoveryMarks } from "@/lib/server/tracking";
import { getRecoveryEnrollments, sendEnrollmentEmails, type Enrollment } from "@/lib/server/recoveryEnrollments";
import { recoveryPlans, recoveryCreditCents } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const back = (req: Request, msg?: string, hash?: string) => {
  const u = new URL("/admin?view=recovery", req.url);
  if (msg) u.searchParams.set("msg", msg);
  if (hash) u.hash = hash;
  return NextResponse.redirect(u, 303);
};

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  const fd = await req.formData();
  const action = String(fd.get("action") ?? "status");

  if (action === "test") {
    const to = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 200);
    if (!EMAIL_RE.test(to)) return back(req, "Add an email address for the test.");
    const plan = recoveryPlans.find((p) => p.id === "supported")!;
    const sample: Enrollment = {
      id: "TEST",
      createdAt: new Date().toISOString(),
      planId: plan.id,
      program: `${plan.name} Recovery (${plan.term})`,
      pay: "deposit",
      paidCents: plan.depositCents,
      balanceCents: plan.fullCents - plan.depositCents - recoveryCreditCents,
      name: "Test Client",
      email: to,
      phone: "",
      receiptUrl: "",
      confirmEmail: to,
    };
    const r = await sendEnrollmentEmails(sample, { test: true, testTo: to });
    return back(req, `Test: ${r.log.join(" · ")}`);
  }

  const id = String(fd.get("id") ?? "").slice(0, 64);
  const status = String(fd.get("status") ?? "");
  const notes = String(fd.get("notes") ?? "").slice(0, 2000);
  if (!/^[A-Za-z0-9_-]+$/.test(id) || !(RECOVERY_STATUSES as readonly string[]).includes(status)) return back(req);
  await setRecoveryMark(id, { status, notes });
  return back(req, "Enrollment updated.", id);
}

export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  const list = (await getRecoveryEnrollments()) ?? [];
  const marks = await getRecoveryMarks(list.map((e) => e.id));
  const cell = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const usd = (c: number) => (c / 100).toFixed(2);
  const rows = [
    ["Date", "Name", "Email", "Phone", "Program", "Payment", "Paid", "Balance after credit", "Status", "Notes", "Confirmation sent to", "Square order"],
    ...list.map((e: Enrollment) => {
      const m = marks.get(e.id);
      return [new Date(e.createdAt).toISOString().slice(0, 10), e.name, e.email, e.phone, e.program, e.pay === "full" ? "Paid in full" : "Deposit", usd(e.paidCents), usd(e.balanceCents), m?.status ?? "New", m?.notes ?? "", m?.confirmedTo ?? "", e.id];
    }),
  ];
  const csv = rows.map((r) => r.map((v) => cell(String(v))).join(",")).join("\r\n");
  return new NextResponse(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="recovery-enrollments-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" },
  });
}
