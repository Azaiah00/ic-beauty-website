import { isAdmin } from "@/lib/server/auth";
import { FORMS } from "@/lib/server/forms";
import { listSubmissions } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const cell = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;

/** GET /api/admin/export?form=pilot-application → CSV (opens in Excel / Google Sheets; Square can import it). */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const form = new URL(req.url).searchParams.get("form") || "";
  if (form && !FORMS[form]) return new Response("Unknown form", { status: 400 });
  const rows = await listSubmissions(form || undefined);
  const dataKeys = [...new Set(rows.flatMap((r) => Object.keys(r.data)))].filter((k) => !["name", "email", "phone", "first-name"].includes(k));
  const head = ["Date", "Form", "Name", "Email", "Phone", "Status", "Notes", ...dataKeys];
  const lines = rows.map((r) =>
    [new Date(r.createdAt).toLocaleString("en-US", { timeZone: "America/New_York" }), FORMS[r.form]?.label ?? r.form, r.name, r.email, r.phone, r.status, r.notes, ...dataKeys.map((k) => r.data[k] ?? "")].map(cell).join(","),
  );
  const csv = "﻿" + [head.map(cell).join(","), ...lines].join("\r\n");
  const file = `icbeauty-${form || "all"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${file}"`, "Cache-Control": "no-store" } });
}
