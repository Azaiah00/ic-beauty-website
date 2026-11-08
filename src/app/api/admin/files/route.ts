/**
 * Owner-only file library.
 *   GET  /api/admin/files?id=…        view inline (images/PDFs open in the browser)
 *   GET  /api/admin/files?id=…&dl=1   download
 *   POST /api/admin/files             multipart upload (file, title, note) or { action: "delete", id }
 */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/server/auth";
import { readDeliverable, saveUpload, deleteUpload, MAX_UPLOAD } from "@/lib/server/deliverables";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const u = new URL(req.url);
  const f = await readDeliverable(u.searchParams.get("id") ?? "");
  if (!f) return new Response("Not found", { status: 404 });
  const inline = !u.searchParams.get("dl") && /^(image\/|application\/pdf|text\/plain|video\/)/.test(f.meta.type);
  const name = encodeURIComponent(f.meta.file);
  return new Response(f.body as BodyInit, {
    headers: {
      "Content-Type": f.meta.type === "image/svg+xml" && inline ? "image/svg+xml" : f.meta.type,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename*=UTF-8''${name}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      ...(f.meta.type === "image/svg+xml" ? { "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'" } : {}),
    },
  });
}

export async function POST(req: Request) {
  const back = (msg: string) => NextResponse.redirect(new URL(`/admin?view=files${msg ? `&msg=${encodeURIComponent(msg)}` : ""}`, req.url), 303);
  if (!(await isAdmin())) return NextResponse.redirect(new URL("/admin/login", req.url), 303);
  const fd = await req.formData();
  if (fd.get("action") === "delete") {
    await deleteUpload(String(fd.get("id") ?? ""));
    return back("deleted");
  }
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return back("nofile");
  if (file.size > MAX_UPLOAD) return back("toolarge");
  await saveUpload(file, {
    title: String(fd.get("title") ?? "").slice(0, 120).trim(),
    note: String(fd.get("note") ?? "").slice(0, 400).trim(),
    uploadedBy: String(fd.get("by") ?? "Iisha") === "Couture House" ? "Couture House" : "Iisha",
  });
  return back("uploaded");
}
