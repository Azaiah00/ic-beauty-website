/**
 * POST /api/community/<action>: the one door for every change in the community and in the dashboard's
 * Community section. Accepts JSON (client islands) or a plain HTML form (dashboard buttons, no JavaScript needed).
 *
 *   1. finds the action in the service layer (src/lib/server/community/actions.ts)
 *   2. works out who is asking: the signed-in member, or the team member using the owner dashboard (_as=dashboard)
 *   3. asks the policy module; a "no" is a 403 with a friendly sentence
 *   4. runs it, then answers with JSON or redirects back with a message (and an Undo id)
 *
 * GET /api/community/ics?id=<event>   calendar file for one event
 * GET /api/community/my-data          "Download my data" (JSON)
 */
import { NextResponse } from "next/server";
import { seeOther } from "@/lib/server/redirect";
import { DEMO, TZ } from "@/lib/community/config";
import { occurrences } from "@/lib/community/calendar";
import { can, isLive } from "@/lib/community/permissions";
import { isAdmin } from "@/lib/server/auth";
import { ACTIONS } from "@/lib/server/community/actions";
import { bool, fail, ok, str, type Args, type ServiceResult } from "@/lib/server/community/core";
import { getActor, getDashboardActor } from "@/lib/server/community/session";
import { db } from "@/lib/server/community/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readArgs(req: Request): Promise<{ args: Args; form: boolean }> {
  if ((req.headers.get("content-type") ?? "").includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    return { args: body && typeof body === "object" ? (body as Args) : {}, form: false };
  }
  const fd = await req.formData().catch(() => null);
  const args: Args = {};
  if (fd)
    for (const key of new Set(fd.keys())) {
      const all = fd.getAll(key).filter((v): v is string => typeof v === "string");
      args[key] = all.length > 1 ? all : all[0] ?? "";
    }
  return { args, form: true };
}

export async function POST(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const def = ACTIONS[action];
  const { args, form } = await readArgs(req);
  let r: ServiceResult;
  if (!def) r = fail(404, "That action doesn't exist.");
  else {
    try {
      const authed = await isAdmin();
      const dashboard = authed && str(args._as) === "dashboard";
      const actor = dashboard ? await getDashboardActor() : await getActor();
      if (dashboard && !actor && action !== "who" && action !== "view-as") r = fail(403, "First choose who's using the dashboard, at the top of the Community page.");
      else {
        const ctx = { actor, args, now: new Date(), authed };
        const decision = await def.allow(ctx);
        // _dry (demo only) stops after the permission check: used by scripts/community-permissions.test.ts
        r = !decision.ok ? decision : DEMO && bool(args._dry) ? ok("Allowed.") : await def.run(ctx);
      }
    } catch (e) {
      console.error("[community]", action, e);
      r = fail(500, "Something went wrong on our side. Please try again.");
    }
  }

  let res: NextResponse;
  if (form) {
    const safe = (p: string | undefined) => (p && p.startsWith("/") && !p.startsWith("//") ? p : "");
    const [path, hash] = (safe(r.ok ? r.goto : "") || safe(str(args.back)) || "/community").split("#");
    const url = new URL(path, "http://local"); // relative redirect below: stay on the host the visitor is on
    if (r.message) url.searchParams.set(r.ok ? "msg" : "err", r.message);
    if (r.ok && r.auditId) url.searchParams.set("undo", r.auditId);
    if (hash) url.hash = hash;
    res = seeOther(url.pathname + url.search + url.hash);
  } else {
    res = NextResponse.json(r.ok ? { ok: true, message: r.message, data: r.data, goto: r.goto, auditId: r.auditId } : { ok: false, message: r.message }, { status: r.ok ? 200 : r.status });
  }
  for (const c of r.cookies ?? []) res.cookies.set(c.name, c.value, { httpOnly: true, secure: new URL(req.url).protocol === "https:", sameSite: "lax", path: "/", maxAge: c.maxAge });
  return res;
}

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");

export async function GET(req: Request, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  const actor = await getActor();
  if (!isLive(actor)) return NextResponse.json({ ok: false, message: "Please sign in to the community first." }, { status: 403 });

  if (action === "ics") {
    const e = await db.event(new URL(req.url).searchParams.get("id") ?? "");
    const next = e ? occurrences(e, new Date(), 1)[0] : null;
    if (!e || !next) return NextResponse.json({ ok: false, message: "That event couldn't be found." }, { status: 404 });
    const end = new Date(+next + (e.minutes || 30) * 6e4);
    const join = can(actor, "event.join", e) && e.zoom ? `\\n\\nJoin: ${e.zoom}` : "";
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//I.C. Beauty//H.A.I.R. Circle Community//EN", "BEGIN:VEVENT", `UID:${e.id}-${icsDate(next)}@icbeautyinyou.com`, `DTSTAMP:${icsDate(new Date())}`, `DTSTART:${icsDate(next)}`, `DTEND:${icsDate(end)}`, `SUMMARY:${esc(e.title)}`, `DESCRIPTION:${esc(e.description)}${join}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    return new NextResponse(ics, { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${e.id}.ics"` } });
  }

  if (action === "my-data") {
    const [progress, posts, comments, purchases, notifications] = await Promise.all([db.progress(actor.id), db.posts(), db.comments(), db.purchases(), db.notifications(actor.id)]);
    const profile: Record<string, unknown> = { ...actor };
    delete profile.teamNotes;
    const data = { exportedAt: new Date().toISOString(), timeZone: actor.timeZone ?? TZ, profile, progress, posts: posts.filter((p) => p.authorId === actor.id), comments: comments.filter((c) => c.authorId === actor.id), purchases: purchases.filter((p) => p.memberId === actor.id), notifications };
    return new NextResponse(JSON.stringify(data, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": 'attachment; filename="my-hair-circle-data.json"' } });
  }
  return NextResponse.json({ ok: false, message: "Not found." }, { status: 404 });
}
