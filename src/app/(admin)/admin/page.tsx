import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard, Sparkles, ClipboardCheck, Users, ScanSearch, MessageSquare, Mic, GraduationCap, ShoppingBag, Newspaper, CalendarCheck,
  LogOut, Download, Search, FolderOpen, Store, Mail, Phone, CheckCircle2, AlertTriangle, Globe, ExternalLink, Inbox, ArrowRight,
} from "lucide-react";
import { isAdmin } from "@/lib/server/auth";
import { FORMS, formNames } from "@/lib/server/forms";
import { listSubmissions, backend, type Submission } from "@/lib/server/store";
import { funnel } from "@/lib/funnel";
import { img } from "@/lib/images";
import { links } from "@/lib/site";
import { Suspense } from "react";
import { ICMark } from "@/components/brand/ICMark";
import { MobileMenu } from "./MobileMenu";
import { DeliverablesView } from "./Deliverables";
import { ShopView } from "./ShopView";
import { EmailComposer, type Template } from "./EmailComposer";
import { emailMode } from "@/lib/server/email";
import { getHours, getServices } from "@/lib/server/squareLive";
import { SITE_URL, business } from "@/lib/site";
import { Avatar, Ring, AreaChart, DotBar, Bars, TZ } from "./ui";

export const metadata: Metadata = { title: "Owner dashboard", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const ICONS: Record<string, typeof Sparkles> = {
  "pilot-application": Sparkles,
  "hair-love-optin": ClipboardCheck,
  "circle-join": Users,
  "scalp-check": ScanSearch,
  "discovery-call": CalendarCheck,
  contact: MessageSquare,
  "speaking-inquiry": Mic,
  "class-waitlist": GraduationCap,
  "product-request": ShoppingBag,
  newsletter: Newspaper,
};

const when = (iso: string) => new Date(iso).toLocaleString("en-US", { timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const dayKey = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: TZ });
const label = (k: string) =>
  ({ "utm-source": "Came from", "utm-medium": "Channel", "utm-campaign": "Campaign", "utm-content": "Post / ad", "sms-consent": "OK to text", "lead-magnet": "Download", "refer-flag": "Doctor referral suggested", "heard-from": "Heard about Iisha" })[k] ??
  k.replace(/^q-/, "").replace(/[-_]/g, " ").replace(/^\w/, (c) => c.toUpperCase());
const HIDE = new Set(["name", "first-name", "email", "phone"]);

function statusTone(s: string) {
  if (s === "New") return "bg-amethyst text-bone";
  if (/(Paid|Booked|Member|Enrolled|Accepted|Delivered|Subscribed)/.test(s)) return "bg-[#e3efe8] text-[#24603f]";
  if (/(Not a fit|Declined|Closed|Unsubscribed)/.test(s)) return "bg-plum-800/10 text-plum-800";
  return "bg-brass-soft/35 text-plum-900";
}

function templatesFor(s: Submission): Template[] {
  const first = (s.name.split(/\s+/)[0] || "there").replace(/^\w/, (c) => c.toUpperCase());
  const book = `${SITE_URL}/book`;
  const checklist = `${SITE_URL}${funnel.leadMagnet.file}`;
  const reach = `Just reply to this email, or call or text me at ${business.phone}.`;
  const followUp: Record<string, string> = {
    "pilot-application": `Hi ${first},\n\nThank you so much for applying for the founding group of ${funnel.pilot.name}. I read your application and I'd love to talk with you about it.\n\nWhen is a good time for a quick call this week? ${reach}`,
    "hair-love-optin": `Hi ${first},\n\nThank you for grabbing my Hair Health Red Flags checklist! How did it go? If anything you checked surprised you, I'd love to hear about it.\n\nWhen you're ready, you can request a complimentary 15-minute discovery call here and I'll personally reach out to schedule it: ${book}\n\n${reach}`,
    "scalp-check": `Hi ${first},\n\nThank you for taking my Scalp Self-Check.${s.data.profile ? ` Your result was "${s.data.profile}".` : ""} I'd love to walk you through what that means for you on a complimentary 15-minute discovery call. Request it here and I'll reach out to schedule: ${book}\n\n${reach}`,
    "circle-join": `Hi ${first},\n\nThank you for joining the founding list for The H.A.I.R. Circle! You'll be the first to know when doors open, along with your founding-member price.\n\nIn the meantime, ${reach.toLowerCase()}`,
  };
  const t: Template[] = [
    { key: "follow", label: "Thank you + follow-up", subject: `Thank you, ${first}`, body: followUp[s.form] ?? `Hi ${first},\n\nThank you for reaching out! I'd love to help.\n\n${reach}` },
    { key: "call", label: "Schedule a discovery call", subject: "Let's schedule your discovery call", body: `Hi ${first},\n\nThank you for reaching out. I'd love to hear your story and tell you honestly what I see. Here are a few times for your complimentary 15-minute discovery call:\n\n- [Day, date, time]\n- [Day, date, time]\n\nReply with the one that works best for you. If none of them fit, tell me what's better and I'll make it happen.` },
    { key: "checklist", label: "Send the checklist again", subject: "Your Hair Health Red Flags checklist", body: `Hi ${first},\n\nHere's your Hair Health Red Flags checklist again: ${checklist}\n\nSet aside five quiet minutes and go through it honestly. ${reach}` },
  ];
  if (s.form === "pilot-application")
    t.push({ key: "accepted", label: "Accepted to the 30-day program", subject: `You're in, ${first}!`, body: `Hi ${first},\n\nCongratulations, you've been accepted into the founding group of ${funnel.pilot.name}!\n\nI'm so excited to take this journey with you. Next, I'll send your enrollment details and everything you need to get ready for ${funnel.pilot.when}.\n\nIf you have any questions before then, ${reach.toLowerCase()}` });
  t.push({ key: "blank", label: "Blank email", subject: "", body: `Hi ${first},\n\n` });
  return t;
}

const card = "rounded-[1.4rem] bg-white shadow-[0_1px_2px_rgba(36,19,42,0.05),0_18px_40px_-28px_rgba(36,19,42,0.35)]";
const chip = "inline-flex min-h-10 items-center gap-2 rounded-full border border-plum-800/15 bg-white px-4 text-[0.86rem] text-plum-900 transition hover:border-amethyst hover:text-amethyst";

function Contact({ s }: { s: Submission }) {
  const tel = s.phone.replace(/[^\d+]/g, "");
  return (
    <div className="flex flex-wrap gap-2">
      {tel && (
        <>
          <a href={`tel:${tel}`} className={chip}><Phone className="h-4 w-4" aria-hidden="true" /> Call</a>
          <a href={`sms:${tel}`} className={chip}><MessageSquare className="h-4 w-4" aria-hidden="true" /> Text</a>
        </>
      )}
      {s.email && <a href={`mailto:${s.email}`} className={chip}><Mail className="h-4 w-4" aria-hidden="true" /> Email</a>}
    </div>
  );
}

function Person({ s, back, showForm, connected }: { s: Submission; back: string; showForm: boolean; connected: boolean }) {
  const def = FORMS[s.form];
  const Icon = ICONS[s.form] ?? Inbox;
  const fields = Object.entries(s.data).filter(([k, v]) => v && !HIDE.has(k));
  return (
    <li id={s.id} className={`scroll-mt-28 ${card}`}>
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
          <Avatar s={s} />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[1.02rem] font-medium text-plum-900">{s.name || s.email}</span>
            <span className="mt-0.5 flex min-w-0 items-center gap-1.5 truncate text-[0.83rem] text-plum-700">
              {showForm && (
                <>
                  <Icon className="h-3.5 w-3.5 shrink-0 text-amethyst" aria-hidden="true" />
                  <span className="truncate">{def?.tab ?? s.form}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span className="truncate">{when(s.createdAt)}</span>
            </span>
          </span>
          <span className={`hidden shrink-0 rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.1em] sm:inline-block ${statusTone(s.status)}`}>{s.status}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-plum-700 transition-transform group-open:rotate-90" aria-hidden="true" />
        </summary>
        <div className="border-t border-plum-800/8 px-4 pb-5 pt-4 sm:px-5">
          <span className={`mb-3 inline-block rounded-full px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.1em] sm:hidden ${statusTone(s.status)}`}>{s.status}</span>
          <Contact s={s} />
          {s.email && (
            <div className="mt-3">
              <EmailComposer form={s.form} id={s.id} to={s.email} back={back} templates={templatesFor(s)} connected={connected} canMarkContacted={s.status === "New" && !!FORMS[s.form]?.statuses.includes("Contacted")} />
            </div>
          )}
          <p className="mt-3 break-all text-[0.86rem] text-plum-700">
            {s.email}
            {s.phone && ` · ${s.phone}`}
          </p>
          {fields.length > 0 && (
            <dl className="mt-4 grid gap-x-6 gap-y-2.5 rounded-2xl bg-bone/70 p-4 text-[0.92rem] sm:grid-cols-[minmax(9rem,auto)_1fr]">
              {fields.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-plum-700">{label(k)}</dt>
                  <dd className="whitespace-pre-wrap break-words text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          )}
          <form method="post" action="/api/admin/update" className="mt-4 grid gap-3 sm:grid-cols-[12rem_1fr_auto] sm:items-end">
            <input type="hidden" name="form" value={s.form} />
            <input type="hidden" name="id" value={s.id} />
            <input type="hidden" name="back" value={back} />
            <label className="block text-[0.72rem] font-medium uppercase tracking-[0.14em] text-plum-700">
              Status
              <select name="status" defaultValue={s.status} className="mt-1.5 block min-h-11 w-full rounded-xl border border-plum-800/15 bg-white px-3 text-[0.95rem] normal-case tracking-normal text-ink focus:border-amethyst focus:outline-none">
                {(def?.statuses ?? [s.status]).map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
            <label className="block text-[0.72rem] font-medium uppercase tracking-[0.14em] text-plum-700">
              Your notes
              <textarea name="notes" defaultValue={s.notes} rows={2} placeholder="Called Tuesday, wants VIP…" className="mt-1.5 block w-full rounded-xl border border-plum-800/15 bg-white px-3 py-2 text-[0.95rem] normal-case tracking-normal text-ink focus:border-amethyst focus:outline-none" />
            </label>
            <button type="submit" className="min-h-11 rounded-full bg-plum-900 px-7 text-[0.76rem] font-medium uppercase tracking-[0.14em] text-bone transition hover:bg-amethyst">Save</button>
          </form>
          {s.log.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-[0.78rem] text-plum-700">
              {s.log.map((l, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {l.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-[#2f6b4f]" aria-hidden="true" /> : <AlertTriangle className="h-3.5 w-3.5 text-[#b4533c]" aria-hidden="true" />}
                  {l.step}: {l.ok ? "sent" : "not sent yet"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </li>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ form?: string; q?: string; view?: string; msg?: string; sent?: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { form: rawForm, q: rawQ, view, msg, sent } = await searchParams;
  const files = view === "files";
  const shopView = view === "shop";
  const other = files || shopView;
  const form = rawForm && FORMS[rawForm] ? rawForm : "";
  const q = (rawQ ?? "").trim().toLowerCase();

  const all = await listSubmissions();
  const by = (f: string) => all.filter((s) => s.form === f);
  const counts = Object.fromEntries(formNames.map((f) => [f, { total: by(f).length, fresh: by(f).filter((s) => s.status === "New").length }]));

  let rows = form ? by(form) : all;
  if (q) rows = rows.filter((s) => [s.name, s.email, s.phone, s.notes, ...Object.values(s.data)].join(" ").toLowerCase().includes(q));
  const back = `/admin${form || q ? "?" : ""}${new URLSearchParams({ ...(form ? { form } : {}), ...(q ? { q } : {}) }).toString()}`;

  // Overview numbers
  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now.getTime() - (13 - i) * 864e5);
    return { full: dayKey(d), label: d.toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" }), n: 0 };
  });
  for (const s of all) {
    const k = dayKey(new Date(s.createdAt));
    const d = days.find((x) => x.full === k);
    if (d) d.n++;
  }
  const week = days.slice(-7).reduce((a, d) => a + d.n, 0);
  const followUps = all.filter((s) => s.status === "New").slice(0, 6);
  const pilot = by("pilot-application");
  const pilotSeats = Number(funnel.pilot.seats) || 0;
  const pilotFollowed = pilot.filter((s) => s.status !== "New").length;
  const pilotPaid = pilot.filter((s) => s.status === "Paid" || s.status === "Accepted").length;
  const optin = by("hair-love-optin");
  const SOURCES: [RegExp, string][] = [[/tiktok/i, "TikTok"], [/insta|ig\b/i, "Instagram"], [/facebook|fb\b/i, "Facebook"], [/google/i, "Google"], [/friend|referr?al|told me/i, "A friend"], [/client/i, "Current client"], [/event|banner|qr/i, "Events"]];
  const sourceOf = (s: Submission) => {
    const raw = [s.data["utm-source"], s.data["heard-from"], s.data.referrer].filter(Boolean).join(" ");
    return SOURCES.find(([re]) => re.test(raw))?.[1] ?? (raw ? "Other" : "Direct / unknown");
  };
  const srcCounts = Object.entries(all.reduce<Record<string, number>>((m, s) => ((m[sourceOf(s)] = (m[sourceOf(s)] ?? 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const FULL: Record<string, string> = { Sun: "Sunday", Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday" };
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => ({ label, n: 0 }));
  for (const s of all) {
    const wd = new Date(s.createdAt).toLocaleDateString("en-US", { timeZone: TZ, weekday: "short" });
    const w = weekdays.find((x) => x.label === wd);
    if (w) w.n++;
  }
  const bestDay = weekdays.reduce((a, b) => (b.n > a.n ? b : a), weekdays[0]);
  const hour = Number(now.toLocaleString("en-US", { timeZone: TZ, hour: "numeric", hour12: false }));
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const portrait = img("iisha-portrait");
  const ready = {
    saving: backend().kind === "blobs",
    email: emailMode() !== "off",
    square: !!process.env.SQUARE_ACCESS_TOKEN,
  };
  const [live, liveServices] = other ? [null, []] : await Promise.all([getHours(), getServices()]);

  const NavItem = ({ f, text, n }: { f: string; text: string; n?: number }) => {
    const Icon = f === "__files" ? FolderOpen : f === "__shop" ? Store : f ? ICONS[f] ?? Inbox : LayoutDashboard;
    const active = f === "__files" ? files : f === "__shop" ? shopView : !other && form === f;
    return (
      <Link href={f === "__files" ? "/admin?view=files" : f === "__shop" ? "/admin?view=shop" : f ? `/admin?form=${f}` : "/admin"} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9rem] [@media(min-width:1024px)_and_(max-height:860px)]:min-h-9 transition ${active ? "bg-amethyst text-bone shadow-[0_8px_20px_-8px_rgba(110,63,134,0.9)]" : "text-bone/75 hover:bg-white/8 hover:text-bone"}`}>
        <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} aria-hidden="true" />
        <span className="flex-1 truncate">{text}</span>
        {n ? <span className={`rounded-full px-2 text-[0.7rem] tabular-nums ${active ? "bg-bone/25" : "bg-white/10"}`}>{n}</span> : null}
      </Link>
    );
  };

  const Kpi = ({ f, title, sub, value, ring, ringLabel, tone }: { f: string; title: string; sub: string; value: number; ring: number; ringLabel: string; tone: "plum" | "amethyst" | "light" }) => {
    const dark = tone !== "light";
    const bg = tone === "plum" ? "bg-[linear-gradient(135deg,#3a1d45_0%,#24132a_60%)]" : tone === "amethyst" ? "bg-[linear-gradient(135deg,#8a55a6_0%,#6E3F86_55%,#4d2a5e_100%)]" : "bg-white";
    return (
      <Link href={`/admin?form=${f}`} className={`group relative flex items-center justify-between gap-3 overflow-hidden rounded-[1.4rem] p-5 transition hover:-translate-y-0.5 ${bg} ${dark ? "text-bone shadow-[0_22px_40px_-24px_rgba(36,19,42,0.9)]" : `${card} text-plum-900`}`}>
        {dark && <span aria-hidden="true" className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl" />}
        <span className="relative min-w-0">
          <span className={`block text-[0.78rem] font-medium ${dark ? "text-bone/75" : "text-plum-700"}`}>{title}</span>
          <span className="mt-1 block text-[2.3rem] font-light leading-none tabular-nums">{value}</span>
          <span className={`mt-2 block truncate text-[0.75rem] ${dark ? "text-bone/60" : "text-plum-700/80"}`}>{sub}</span>
        </span>
        <Ring id={f} value={ring} label={ringLabel} size={58} stroke={6} glow={dark} {...(tone === "amethyst" ? { from: "#F8F4EE", to: "#cdb8dc" } : dark ? {} : { track: "rgba(110,63,134,0.12)", from: "#9b72b0", to: "#6E3F86", text: "text-plum-900" })} />
      </Link>
    );
  };

  return (
    <div className="min-h-dvh bg-[#f3eef2] bg-[radial-gradient(60rem_30rem_at_100%_-10%,rgba(110,63,134,0.12),transparent),radial-gradient(40rem_24rem_at_-10%_110%,rgba(184,149,90,0.10),transparent)] text-ink lg:p-4">
      <div className="mx-auto grid max-w-[96rem] grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[15.5rem_minmax(0,1fr)] 2xl:grid-cols-[15.5rem_minmax(0,1fr)_19rem]">
        {/* Sidebar */}
        <aside className="sticky top-0 z-30 min-w-0 bg-plum-950 text-bone lg:top-4 lg:flex lg:h-[calc(100dvh-2rem)] lg:flex-col lg:overflow-y-auto lg:rounded-[1.6rem] lg:p-4 lg:[scrollbar-width:thin]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-2 lg:py-2">
            <Link href="/admin" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#8a55a6,#6E3F86)] text-bone shadow-[0_6px_18px_-6px_rgba(155,114,176,0.9)]"><ICMark className="h-7 w-auto" title="" /></span>
              <span>
                <span className="block font-display text-[1.2rem] leading-none">I.C. Beauty</span>
                <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.22em] text-brass-soft">Owner dashboard</span>
              </span>
            </Link>
          </div>
          <div className="relative z-10 px-4 pb-3 lg:hidden">
            <Suspense>
              <MobileMenu current={files ? "__files" : shopView ? "__shop" : form} items={[{ form: "", label: "Overview" }, { form: "__shop", label: "Shop & orders" }, { form: "__files", label: "Deliverables" }, ...formNames.map((f) => ({ form: f, label: FORMS[f].tab, count: counts[f].total, fresh: counts[f].fresh }))]} />
            </Suspense>
          </div>
          <nav aria-label="Dashboard" className="hidden lg:mt-6 lg:flex lg:flex-col lg:gap-1 [@media(min-width:1024px)_and_(max-height:860px)]:mt-3">
            <NavItem f="" text="Overview" />
            <NavItem f="__shop" text="Shop & orders" />
            <NavItem f="__files" text="Deliverables" />
            <p className="mt-4 hidden px-3 text-[0.62rem] uppercase tracking-[0.22em] text-bone/40 lg:block [@media(min-width:1024px)_and_(max-height:860px)]:mt-2">Your people</p>
            {formNames.map((f) => <NavItem key={f} f={f} text={FORMS[f].tab} n={counts[f].total} />)}
          </nav>
          <div className="hidden space-y-1 border-t border-white/10 pt-3 lg:mt-auto lg:block">
            <a href="/" target="_blank" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.9rem] [@media(min-width:1024px)_and_(max-height:860px)]:min-h-9 text-bone/75 hover:bg-white/8 hover:text-bone"><Globe className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" /> View website</a>
            <form method="post" action="/api/admin/logout">
              <button className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-[0.9rem] [@media(min-width:1024px)_and_(max-height:860px)]:min-h-9 text-[#e8a4a0] hover:bg-white/8"><LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" /> Sign out</button>
            </form>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 px-4 pb-16 pt-4 lg:px-2 lg:pt-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-[2rem] leading-tight text-plum-900">{files ? "Deliverables" : shopView ? "Shop & orders" : form ? FORMS[form].label : `${greet}, Iisha`}</h1>
              <p className="text-[0.9rem] text-plum-700">
                {files ? "Your files from Couture House, plus anything you upload" : shopView ? "Website orders, product stock, and clicks to your storefronts" : form ? `${counts[form].total} total · ${counts[form].fresh} waiting on you` : now.toLocaleDateString("en-US", { timeZone: TZ, weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            <div className={`items-center gap-2 ${other ? "hidden" : "flex"}`}>
              <form className={`flex min-w-0 flex-1 items-center gap-2 rounded-full bg-white px-4 sm:w-72 sm:flex-none ${card}`} role="search">
                {form && <input type="hidden" name="form" value={form} />}
                <Search className="h-4 w-4 shrink-0 text-plum-700" aria-hidden="true" />
                <input name="q" defaultValue={rawQ} placeholder="Search people…" aria-label="Search people" className="min-h-11 w-full bg-transparent text-[0.95rem] outline-none" />
              </form>
              <a href={`/api/admin/export${form ? `?form=${form}` : ""}`} title="Download as a spreadsheet (CSV)" className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-plum-900 px-4 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-bone hover:bg-amethyst">
                <Download className="h-4 w-4" aria-hidden="true" /> <span className="hidden sm:inline">Export</span>
              </a>
            </div>
          </div>

          {sent && (
            <p role="status" className={`mt-5 flex items-start gap-2 rounded-2xl px-4 py-3 text-[0.9rem] ${sent === "ok" ? "bg-[#e3efe8] text-[#24603f]" : "bg-[#f8e6e1] text-[#8a3a26]"}`}>
              {sent === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
              {{ ok: "Sent from your Gmail. You'll find it in your Sent folder.", notconnected: "Not sent: your Gmail isn't connected yet.", failed: "Not sent: Gmail didn't accept it. Check the app password in Netlify.", empty: "Add a subject and a message first.", missing: "That person couldn't be found." }[sent] ?? "Done."}
            </p>
          )}
          {!other && msg && (
            <p role="status" className="mt-5 flex items-start gap-2 rounded-2xl bg-[#e3efe8] px-4 py-3 text-[0.9rem] text-[#24603f]">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {msg}
            </p>
          )}
          {files && <DeliverablesView msg={msg} />}
          {shopView && <ShopView msg={msg} />}

          {!other && !form && !q && (
            <>
              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Totals">
                <Kpi f="pilot-application" tone="plum" title="30-Day applications" value={counts["pilot-application"].total} sub={`${counts["pilot-application"].fresh} waiting on you`} ring={pilot.length ? pilotFollowed / pilot.length : 0} ringLabel={`${pilot.length ? Math.round((pilotFollowed / pilot.length) * 100) : 0}%`} />
                <Kpi f="hair-love-optin" tone="amethyst" title="Checklist downloads" value={optin.length} sub={`${optin.filter((s) => now.getTime() - +new Date(s.createdAt) < 7 * 864e5).length} this week`} ring={optin.length ? optin.filter((s) => s.status !== "New").length / optin.length : 0} ringLabel={`${optin.length ? Math.round((optin.filter((s) => s.status !== "New").length / optin.length) * 100) : 0}%`} />
                <Kpi f="scalp-check" tone="light" title="Scalp Checks" value={counts["scalp-check"].total} sub={`${counts["scalp-check"].fresh} new results`} ring={counts["scalp-check"].total ? 1 - counts["scalp-check"].fresh / counts["scalp-check"].total : 0} ringLabel={`${counts["scalp-check"].fresh}`} />
                <Kpi f="circle-join" tone="light" title="Circle founding list" value={counts["circle-join"].total} sub="H.A.I.R. Circle" ring={counts["circle-join"].total ? 1 : 0} ringLabel={`${counts["circle-join"].total}`} />
              </section>
              <p className="mt-2 text-[0.75rem] text-plum-700/80">Rings show how many you&apos;ve already followed up with.</p>

              <section className={`${card} mt-5 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6`} aria-label="Hours, services and prices">
                <div className="flex min-w-0 items-start gap-3">
                  {live?.live ? <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#2f6b4f]" aria-hidden="true" /> : <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-brass-deep" aria-hidden="true" />}
                  <div className="min-w-0">
                    <h2 className="font-display text-[1.3rem] leading-tight text-plum-900">Hours, services &amp; prices</h2>
                    <p className="text-[0.88rem] text-plum-700">
                      {live?.live
                        ? `Coming from your Square account: your hours${liveServices.length ? ` and ${liveServices.length} bookable service${liveServices.length === 1 ? "" : "s"}` : ""}. Change them in Square and the website follows.`
                        : ready.square
                          ? "Square is connected, but no business hours came through. Check Square → Settings → Locations → Business hours."
                          : "Not linked to Square yet. The website shows the hours saved with it until Square is connected."}
                    </p>
                  </div>
                </div>
                {ready.square && (
                  <div className="flex shrink-0 flex-wrap gap-2">
                  <Link href="/admin?view=shop" className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full border border-plum-800/15 px-5 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-plum-900 transition hover:border-amethyst sm:w-auto"><Store className="h-4 w-4" aria-hidden="true" /> Shop &amp; orders</Link>
                  <form method="post" action="/api/admin/square-refresh" className="w-full sm:w-auto">
                    <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-plum-900 px-5 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-bone transition hover:bg-amethyst sm:w-auto">Refresh from Square</button>
                  </form>
                  </div>
                )}
              </section>

              <section className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className={`${card} p-5 sm:p-6`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-[1.45rem] leading-tight text-plum-900">New people<span className="hidden sm:inline">, last 14 days</span><span className="sm:hidden">, last 7 days</span></h2>
                      <p className="text-[0.85rem] text-plum-700">{week} this week<span className="hidden sm:inline"> · every form on your website</span></p>
                    </div>
                    <span className="shrink-0 whitespace-nowrap rounded-full bg-mist px-3 py-1 text-[0.75rem] text-plum-800">{all.length} all time</span>
                  </div>
                  <div className="mt-4 sm:hidden"><AreaChart days={days.slice(-7)} compact /></div>
                  <div className="mt-4 hidden sm:block"><AreaChart days={days} /></div>
                </div>
                <div className={`${card} flex flex-col p-5 sm:p-6`}>
                  <h2 className="font-display text-[1.45rem] leading-tight text-plum-900">30-Day program</h2>
                  <p className="text-[0.85rem] text-plum-700">{funnel.pilot.when} founding group</p>
                  <div className="flex flex-1 items-center justify-center py-5">
                    <Ring
                      id="pilot-big"
                      glow
                      from="#9b72b0"
                      to="#DCC394"
                      value={pilotSeats ? pilotPaid / pilotSeats : pilot.length ? pilotFollowed / pilot.length : 0}
                      label={pilotSeats ? `${pilotPaid}/${pilotSeats}` : `${pilot.length}`}
                      size={150}
                      stroke={14}
                      track="rgba(110,63,134,0.10)"
                      text="text-plum-900 text-[1.6rem]! font-display"
                    />
                  </div>
                  <ul className="grid grid-cols-2 gap-3 text-[0.82rem]">
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amethyst" />{pilotSeats ? "Seats filled" : "Applications"}</li>
                    <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-amethyst/20" />{pilotFollowed} followed up</li>
                  </ul>
                  <Link href="/admin?form=pilot-application" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-plum-900/15 text-[0.76rem] font-medium uppercase tracking-[0.12em] text-plum-900 hover:border-amethyst hover:text-amethyst">See applicants <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                </div>
              </section>

              <section className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
                <div className={`${card} p-5 sm:p-6`}>
                  <h2 className="font-display text-[1.45rem] leading-tight text-plum-900">Where they come from</h2>
                  <p className="text-[0.85rem] text-plum-700">So you know which posts and Lives are working</p>
                  {srcCounts.length === 0 ? (
                    <p className="mt-6 text-[0.9rem] text-plum-700">Shows up after your first sign-ups.</p>
                  ) : (
                    <ul className="mt-5 space-y-3.5">
                      {srcCounts.map(([name, n], i) => (
                        <li key={name} className="grid grid-cols-[minmax(0,1fr)_auto_2.6rem] items-center gap-2 text-[0.9rem] sm:grid-cols-[8rem_1fr_2.6rem] sm:gap-3">
                          <span className="truncate text-plum-900">{name}</span>
                          <DotBar value={n / all.length} tone={i === 0 ? "bg-amethyst" : i === 1 ? "bg-orchid" : "bg-brass"} />
                          <span className="text-right tabular-nums text-plum-700">{Math.round((n / all.length) * 100)}%</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className={`${card} p-5 sm:p-6`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-[1.45rem] leading-tight text-plum-900">Busiest days</h2>
                      <p className="text-[0.85rem] text-plum-700">{bestDay.n ? `Most people sign up on ${FULL[bestDay.label]}s. A great night to go Live.` : "Which days bring the most sign-ups"}</p>
                    </div>
                  </div>
                  <div className="mt-5"><Bars items={weekdays} /></div>
                </div>
              </section>

              <section className="mt-5">
                <div className="flex items-end justify-between">
                  <h2 className="font-display text-[1.45rem] text-plum-900">Waiting on you</h2>
                  <span className="text-[0.82rem] text-plum-700">{all.filter((s) => s.status === "New").length} new</span>
                </div>
                {followUps.length === 0 ? (
                  <p className={`${card} mt-3 p-6 text-plum-700`}>You&apos;re all caught up. New sign-ups appear here the moment they come in.</p>
                ) : (
                  <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-3 md:grid-cols-2">
                    {followUps.map((s) => {
                      const Icon = ICONS[s.form] ?? Inbox;
                      return (
                        <li key={s.id} className={`${card} p-4`}>
                          <div className="flex items-center gap-3">
                            <Avatar s={s} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-plum-900">{s.name || s.email}</p>
                              <p className="flex items-center gap-1.5 truncate text-[0.8rem] text-plum-700"><Icon className="h-3.5 w-3.5 text-amethyst" aria-hidden="true" />{FORMS[s.form]?.tab} · {when(s.createdAt)}</p>
                            </div>
                            <Link href={`/admin?form=${s.form}#${s.id}`} className="text-[0.75rem] font-medium uppercase tracking-[0.1em] text-amethyst hover:underline">Open</Link>
                          </div>
                          <div className="mt-3"><Contact s={s} /></div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>

              <h2 className="mt-8 font-display text-[1.45rem] text-plum-900">Everyone, newest first</h2>
            </>
          )}

          {other ? null : rows.length === 0 ? (
            <p className={`${card} mt-4 p-6 text-plum-700`}>{q ? "No one matches that search." : "No one here yet. They'll appear the moment someone fills out the form."}</p>
          ) : (
            <ul className="mt-4 space-y-3">{rows.map((s) => <Person key={s.id} s={s} back={back} showForm={!form} connected={emailMode() !== "off"} />)}</ul>
          )}
        </main>

        {/* Right panel */}
        <aside className="hidden space-y-4 pt-2 2xl:block">
          <div className={`${card} overflow-hidden`}>
            <div className="h-20 bg-[linear-gradient(135deg,#8a55a6,#24132a)]" />
            <div className="-mt-11 px-5 pb-5 text-center">
              {portrait && (
                <span className="relative mx-auto block h-[5.5rem] w-[5.5rem] overflow-hidden rounded-full ring-4 ring-white">
                  <Image src={portrait} alt="Iisha C. Silver" fill sizes="88px" className="origin-[70%_25%] scale-[1.6] object-cover" style={{ objectPosition: "72% 22%" }} />
                </span>
              )}
              <p className="mt-3 font-display text-[1.4rem] leading-tight text-plum-900">Iisha C. Silver</p>
              <p className="text-[0.8rem] text-plum-700">Founder · I.C. Beauty</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { h: "/", t: "Website", I: Globe },
                  { h: "/book", t: "Booking", I: CalendarCheck },
                  { h: links.discoveryForm, t: "Jotform", I: ExternalLink },
                ].map(({ h, t, I }) => (
                  <a key={t} href={h} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 rounded-2xl bg-mist py-3 text-[0.72rem] text-plum-900 transition hover:bg-amethyst hover:text-bone">
                    <I className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden="true" /> {t}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className={`${card} p-5`}>
            <p className="font-display text-[1.2rem] text-plum-900">Website status</p>
            <ul className="mt-3 space-y-2.5 text-[0.86rem]">
              {[
                { ok: ready.saving, t: "Sign-ups saving", off: "Preview storage" },
                { ok: ready.email, t: emailMode() === "gmail" ? "Emails sending from your Gmail" : "Confirmation & alert emails", off: "Gmail not connected yet" },
                { ok: ready.square, t: "Adding people to Square", off: "Square not connected yet" },
                { ok: !!live?.live, t: "Hours & prices from Square", off: "Hours saved on the site" },
              ].map((r) => (
                <li key={r.t} className="flex items-start gap-2.5">
                  {r.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2f6b4f]" aria-hidden="true" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-brass-deep" aria-hidden="true" />}
                  <span className="text-plum-900">{r.ok ? r.t : r.off}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={`${card} p-5`}>
            <p className="font-display text-[1.2rem] text-plum-900">Newest people</p>
            <ul className="mt-3 space-y-3">
              {all.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <Link href={`/admin?form=${s.form}#${s.id}`} className="flex items-center gap-3 rounded-xl hover:bg-bone">
                    <Avatar s={s} size="h-9 w-9 text-[0.75rem]" />
                    <span className="min-w-0">
                      <span className="block truncate text-[0.9rem] text-plum-900">{s.name || s.email}</span>
                      <span className="block truncate text-[0.75rem] text-plum-700">{FORMS[s.form]?.tab}</span>
                    </span>
                  </Link>
                </li>
              ))}
              {all.length === 0 && <li className="text-[0.86rem] text-plum-700">No one yet.</li>}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
