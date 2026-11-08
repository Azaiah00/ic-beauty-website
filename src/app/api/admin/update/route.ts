import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/auth";
import { FORMS } from "@/lib/server/forms";
import { updateSubmission } from "@/lib/server/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  const fd = await req.formData();
  const form = String(fd.get("form") ?? "");
  const id = String(fd.get("id") ?? "");
  const back = String(fd.get("back") ?? "/admin");
  const def = FORMS[form];
  if (def) {
    const status = String(fd.get("status") ?? "");
    const notes = String(fd.get("notes") ?? "").slice(0, 4000);
    await updateSubmission(form, id, (s) => ({ ...s, status: def.statuses.includes(status) ? status : s.status, notes }));
  }
  const dest = back.startsWith("/admin") ? back : "/admin";
  return NextResponse.redirect(new URL(`${dest}${dest.includes("#") ? "" : `#${id}`}`, req.url), 303);
}
