import { NextResponse } from "next/server";
import { COOKIE } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url), 303);
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
