import { NextResponse } from "next/server";
import { seeOther } from "@/lib/server/redirect";
import { COOKIE, passwordOk, sessionValue } from "@/lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const fd = await req.formData();
  const pw = String(fd.get("password") ?? "");
  const url = new URL(req.url);
  if (!passwordOk(pw)) {
    await new Promise((r) => setTimeout(r, 900)); // slow down guessing
    return seeOther("/admin/login?e=1");
  }
  const s = sessionValue();
  const res = seeOther("/admin");
  res.cookies.set(COOKIE, s.value, { httpOnly: true, secure: url.protocol === "https:", sameSite: "lax", path: "/", maxAge: s.maxAge });
  return res;
}
