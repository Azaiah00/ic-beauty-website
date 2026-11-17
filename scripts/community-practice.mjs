/**
 * The owner practice script, run in a real browser (Playwright driving the installed Edge or Chrome).
 * It walks through the QA list in the build prompt, takes the screenshots for docs/community/OWNER-GUIDE.md,
 * and checks every key page at 375 / 768 / 1024 / 1440.
 *
 *   npm i --no-save playwright-core
 *   npm run dev                                   (in another terminal)
 *   node scripts/community-practice.mjs http://localhost:3002
 *
 * It starts and ends by resetting the demo data. The dashboard password is read from ADMIN_PASSWORD
 * (the environment, then .env.development.local, then .env.local). Run it against a local dev server only.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const BASE = (process.argv[2] ?? "http://localhost:3002").replace(/\/$/, "");
const SHOTS = path.join("docs", "community", "screenshots");
fs.mkdirSync(path.join(SHOTS, "qa"), { recursive: true });

function adminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  for (const f of [".env.development.local", ".env.local"]) {
    const m = fs.existsSync(f) && /^ADMIN_PASSWORD=(.+)$/m.exec(fs.readFileSync(f, "utf8"));
    if (m) return m[1].trim();
  }
  throw new Error("ADMIN_PASSWORD not found");
}

const results = [];
const check = (label, ok, detail = "") => {
  results.push({ label, ok: !!ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
};
const errors = [];

const browser = await chromium.launch({ channel: fs.existsSync("C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe") ? "msedge" : "chrome" });

async function as(persona, viewport = { width: 1280, height: 900 }) {
  const ctx = await browser.newContext({ viewport, baseURL: BASE });
  if (persona) {
    // Team personas are only available to someone signed in to the owner dashboard.
    if (["iisha", "team-admin", "azaiah", "fred"].includes(persona)) await ctx.request.post("/api/admin/login", { form: { password: adminPassword() } });
    const r = await ctx.request.post("/api/community/login", { data: { id: persona } });
    if (!r.ok()) throw new Error(`could not sign in as ${persona}`);
  }
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errors.push(`${persona ?? "guest"} ${page.url()}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && !/favicon|Failed to load resource/.test(m.text()) && errors.push(`${persona ?? "guest"} ${page.url()}: ${m.text().replace(/s+/g, " ").slice(0, 900)}`));
  return { ctx, page, api: (action, data) => ctx.request.post(`/api/community/${action}`, { data }) };
}
const text = (page) => page.locator("body").innerText();
const shot = async (page, name, opts = {}) => {
  await page.evaluate(() => document.querySelectorAll("nextjs-portal").forEach((el) => el.remove())); // the dev-only badge
  return page.screenshot({ path: path.join(SHOTS, `${name}.png`), ...opts });
};

// ───────────── Owner dashboard: sign in, choose who is using it ─────────────
const admin = await as(null, { width: 1440, height: 1000 });
const A = admin.page;
await A.goto("/admin/login");
await A.fill("#pw", adminPassword());
await A.click('button[type="submit"]');
await A.waitForURL(/\/admin(\?|$)/);
const who = (id, back = "/admin?view=community") => admin.ctx.request.post("/api/community/who", { form: { id, back } });
await who("iisha");
// Start from a clean demo.
await admin.ctx.request.post("/api/community/demo.reset", { form: { _as: "dashboard", back: "/admin?view=community" } });
const submitIn = async (selector) => {
  await Promise.all([A.waitForURL(/[?&](msg|err)=/), A.locator(selector).first().click()]);
  return new URL(A.url()).searchParams;
};

await A.goto("/admin?view=community");
check("Dashboard: Community home loads with “What needs you today”", /What needs you today/i.test(await text(A)));
await shot(A, "community-home");

// 1. Approve Aaliyah → she sees the welcome checklist
await A.goto("/admin?view=community-members&filter=pending");
await shot(A, "members-approve");
let sp = await submitIn('li#aaliyah form[action="/api/community/member.approve"] button');
check("1. Approve Aaliyah from the dashboard", sp.has("msg") && sp.has("undo"), sp.get("msg") ?? sp.get("err"));
const aaliyah = await as("aaliyah");
await aaliyah.page.goto("/community/welcome");
check("1. As Aaliyah: the Start Here welcome checklist shows", /Start Here/.test(await text(aaliyah.page)) && /Introduce yourself/.test(await text(aaliyah.page)));
await shot(aaliyah.page, "qa/1-aaliyah-welcome");
await aaliyah.page.goto("/community/messages");
check("1. As Aaliyah: Iisha's welcome message is in her inbox", /Iisha/.test(await text(aaliyah.page)));

// 6. (before the plan change) Kendra earns likes until Level 3 → Wash Day Blueprint unlocks + notification
const kendra = await as("kendra");
await kendra.page.goto("/community/classroom/wash-day-blueprint");
check("6. As Kendra (Level 2): Wash Day Blueprint is locked with the level message", /Level 3/.test(await text(kendra.page)) && !(await kendra.page.locator('a[href^="/community/classroom/wash-day-blueprint/"]').count()));
await shot(kendra.page, "qa/6-kendra-locked");
const monique = await as("monique");
await monique.page.goto("/community/post/kendra-cleanse-poll");
await monique.page.locator('button[aria-label^="Like “How often is everyone cleansing?”"]').first().click();
await monique.page.waitForTimeout(1200);
const likes = [
  ["gloria", "post.like", { id: "kendra-cleanse-poll" }], ["lauren", "post.like", { id: "kendra-cleanse-poll" }], ["yvonne", "post.like", { id: "kendra-cleanse-poll" }],
  ["monique", "post.like", { id: "kendra-intro" }], ["nia", "post.like", { id: "kendra-intro" }], ["renee", "post.like", { id: "kendra-intro" }],
  ["monique", "comment.like", { post: "ask-white-bulb", id: "c03" }], ["nia", "comment.like", { post: "ask-white-bulb", id: "c03" }],
  ["monique", "comment.like", { post: "tasha-shedding-count", id: "c10" }], ["gloria", "comment.like", { post: "tasha-shedding-count", id: "c10" }],
];
for (const [p, action, data] of likes) {
  const s = await as(p);
  const r = await s.api(action, data);
  if (!r.ok()) check(`6. like by ${p}`, false, await r.text());
  await s.ctx.close();
}
await kendra.page.goto("/community/classroom/wash-day-blueprint");
check("6. As Kendra after 11 likes: Level 3 reached, Wash Day Blueprint opens", (await kendra.page.locator('a[href^="/community/classroom/wash-day-blueprint/"]').count()) > 0);
await kendra.page.goto("/community/notifications");
check("6. As Kendra: the level-up notification appears", /You reached Level 3/.test(await text(kendra.page)));
await shot(kendra.page, "qa/6-kendra-level-3");

// 2. Move Kendra to Circle → curriculum and My Journey unlock
await kendra.page.goto("/portal");
check("2. Before: My Journey is locked for Kendra (Free)", /included with/i.test(await text(kendra.page)));
await A.goto("/admin?view=community-members&q=kendra");
await A.locator("li#kendra details:has(> summary:text-is('Change plan')) > summary").click();
await A.locator('li#kendra form[action="/api/community/member.plan"] input[name="plan"][value="circle"]').check();
await shot(A, "members-change-plan");
sp = await submitIn('li#kendra form[action="/api/community/member.plan"] button');
check("2. Move Kendra to Circle from the dashboard", /Circle/.test(sp.get("msg") ?? ""), sp.get("msg") ?? sp.get("err"));
await kendra.page.goto("/community/classroom/circle-curriculum");
check("2. As Kendra: the Circle curriculum is open", (await kendra.page.locator('a[href="/community/classroom/circle-curriculum/week-1"]').count()) > 0);
await kendra.page.goto("/portal");
check("2. As Kendra: My Journey opens", !/included with/i.test(await text(kendra.page)) && /Kendra/.test(await text(kendra.page)));
await shot(kendra.page, "qa/2-kendra-my-journey");

// 3. Patrice: access back on, then off → paused page
await A.goto("/admin?view=community-members&filter=paused");
sp = await submitIn('li#patrice form[action="/api/community/member.restore"] button');
check("3. Turn Patrice's access back on", sp.has("msg"), sp.get("msg") ?? sp.get("err"));
const patrice = await as("patrice");
await patrice.page.goto("/community");
check("3. As Patrice (access on): the feed opens", new URL(patrice.page.url()).pathname === "/community");
await A.goto("/admin?view=community-members&q=patrice");
await A.locator("li#patrice summary:text-is('Turn access off')").click();
await shot(A, "members-access-off");
sp = await submitIn('li#patrice form[action="/api/community/member.pause"] button');
check("3. Turn Patrice's access off", sp.has("msg"), sp.get("msg") ?? sp.get("err"));
await patrice.page.goto("/community");
check("3. As Patrice (access off): only the friendly paused page shows", new URL(patrice.page.url()).pathname === "/community/paused" && /Your access is paused/.test(await text(patrice.page)));
await shot(patrice.page, "qa/3-patrice-paused");

// 4. Team Admin → moderator → admin (owner only). As Azaiah the buttons are disabled.
const roleBtn = (role) => `li#team-admin form:has(input[name="role"][value="${role}"]) button`;
const openRole = async () => {
  await A.goto("/admin?view=community-members&filter=team");
  await A.locator("li#team-admin summary:text-is('Team role')").click();
};
await openRole();
sp = await submitIn(roleBtn("moderator"));
check("4. As Iisha: make the Team Admin a moderator", /moderator/.test(sp.get("msg") ?? ""), sp.get("msg") ?? sp.get("err"));
await openRole();
sp = await submitIn(roleBtn("admin"));
check("4. As Iisha: make the Team Admin an admin again", /admin/.test(sp.get("msg") ?? ""), sp.get("msg") ?? sp.get("err"));
await who("azaiah");
await openRole();
check("4. As Azaiah: the team-role buttons are disabled", await A.locator(roleBtn("moderator")).first().isDisabled());
check("4. As Azaiah: “Only Iisha can do this” is shown", /Only Iisha can do this/.test(await text(A)));
await shot(A, "qa/4-azaiah-role-disabled");
const refused = await admin.ctx.request.post("/api/community/member.role", { data: { _as: "dashboard", id: "team-admin", role: "moderator" } });
check("4. As Azaiah: the server refuses the role change with 403", refused.status() === 403, (await refused.json()).message);
await who("iisha");

// 5. Gift Nia Radiance Rewired → it opens for her
const nia = await as("nia");
await nia.page.goto("/community/classroom/radiance-rewired");
check("5. Before: Radiance Rewired is locked for Nia", (await nia.page.locator('a[href="/community/classroom/radiance-rewired/start"]').count()) === 0);
await A.goto("/admin?view=community-members&q=nia");
await A.locator("li#nia summary:text-is('Give a course')").click();
await A.locator('li#nia form[action="/api/community/member.grant"] select[name="course"]').selectOption("radiance-rewired");
sp = await submitIn('li#nia form[action="/api/community/member.grant"] button');
check("5. Gift Nia Radiance Rewired", sp.has("msg"), sp.get("msg") ?? sp.get("err"));
await nia.page.goto("/community/classroom/radiance-rewired");
check("5. As Nia: Radiance Rewired opens", (await nia.page.locator('a[href="/community/classroom/radiance-rewired/start"]').count()) > 0);
await shot(nia.page, "qa/5-nia-radiance-open");

// 7. Simone sees her access-until date; Brianna sees the past-due banner
const simone = await as("simone");
await simone.page.goto("/community/settings");
check("7. As Simone (canceled): the access-until date shows", /You have access until/.test(await text(simone.page)) && /Your membership is canceled/.test(await text(simone.page)));
await shot(simone.page, "qa/7-simone-canceled");
const brianna = await as("brianna");
await brianna.page.goto("/community");
check("7. As Brianna (past due): the payment banner shows", /payment didn.t go through/.test(await text(brianna.page)));
await shot(brianna.page, "qa/7-brianna-past-due");

// Guide screenshots: announcement + add an event
const iisha = await as("iisha");
await iisha.page.goto("/community?compose=1&category=announcements");
await iisha.page.waitForSelector("dialog[open]");
await shot(iisha.page, "announcement");
await A.goto("/admin?view=community-calendar#new");
await shot(A, "add-event");

// 8. Undo the last 3 changes from the activity log
await A.goto("/admin?view=community-log");
await shot(A, "activity-undo");
const undone = [];
for (let i = 0; i < 3; i++) {
  await A.goto("/admin?view=community-log");
  sp = await submitIn('form[action="/api/community/audit.undo"] button');
  undone.push(sp.get("msg") ?? sp.get("err"));
}
check("8. Undo the last 3 changes from the activity log", undone.every((m) => /Undone/.test(m ?? "")), undone.join(" | "));
await nia.page.goto("/community/classroom/radiance-rewired");
check("8. After Undo: Nia's gift is taken back", (await nia.page.locator('a[href="/community/classroom/radiance-rewired/start"]').count()) === 0);

// ───────────── Keyboard + modal checks ─────────────
const tasha = await as("tasha");
const T = tasha.page;
await T.goto("/community");
await T.locator('article h2 a[href^="/community/post/"]').first().click();
await T.waitForSelector("dialog[open]");
check("Feed: a post opens as a modal over the feed", /\/community\/post\//.test(T.url()));
check("Modal: keyboard focus is inside the dialog", await T.evaluate(() => !!document.activeElement?.closest("dialog")));
await T.keyboard.press("Escape");
await T.waitForURL((u) => u.pathname === "/community");
check("Modal: Esc closes it and returns to the feed", (await T.locator("dialog[open]").count()) === 0);
await T.getByRole("button", { name: /Share a win/ }).click();
await T.waitForSelector("dialog[open]");
let escaped = "";
for (let i = 0; i < 30; i++) {
  await T.keyboard.press("Tab");
  // Focus may pass through the browser's own toolbar (document.body), but never a page element behind the sheet.
  escaped ||= await T.evaluate(() => { const el = document.activeElement; return !el || el === document.body || el.closest("dialog") ? "" : el.tagName + " " + (el.textContent || "").trim().slice(0, 30); });
}
check("Composer: Tab never reaches the page behind the sheet (focus trap)", !escaped, escaped);
await T.keyboard.press("Escape");
check("Composer: Esc closes it", (await T.locator("dialog[open]").count()) === 0);
check("Toasts: an aria-live region is present", (await T.locator('[aria-live="polite"][role="status"]').count()) > 0);
for (const id of ["growth-cycle", "shed-or-broken", "build-your-wash-day"]) {
  await T.goto(`/community/labs/${id}`);
  await T.waitForTimeout(1500);
  check(`Labs: ${id} loads for Tasha`, (await T.locator("main h1").count()) > 0 && !/Something went wrong/.test(await text(T)));
  await shot(T, `qa/lab-${id}`);
}

// ───────────── Responsive: 375 / 768 / 1024 / 1440 ─────────────
const PAGES = ["/community", "/community/post/episode-1", "/community/classroom", "/community/classroom/circle-curriculum", "/community/classroom/circle-curriculum/week-1", "/community/calendar", "/community/members", "/community/members/monique", "/community/leaderboards", "/community/labs", "/community/labs/growth-cycle", "/community/notifications", "/community/messages", "/community/settings", "/community/upgrade", "/community/checkout/inner", "/community/welcome", "/community/about", "/portal"];
const ADMIN_PAGES = ["community", "community-members", "community-posts", "community-classroom", "community-calendar", "community-plans", "community-settings", "community-log"].map((v) => `/admin?view=${v}`);
const small = [];
for (const width of [375, 768, 1024, 1440]) {
  const overflow = [];
  for (const [who_, list] of [["tasha", PAGES], ["admin", ADMIN_PAGES], ["guest", ["/community/about", "/community/login", "/community/join"]]]) {
    const page = who_ === "admin" ? A : who_ === "tasha" ? T : (await as(null)).page;
    await page.setViewportSize({ width, height: 900 });
    for (const url of list) {
      await page.goto(url);
      await page.waitForTimeout(250);
      const m = await page.evaluate(() => {
        const de = document.documentElement;
        const tiny = [...document.querySelectorAll("main a, main button, main summary, main select, main input:not([type=hidden]):not(.sr-only), nav a")]
          .filter((el) => { const r = el.getBoundingClientRect(); const lab = el.closest("label")?.getBoundingClientRect(); const h = Math.max(r.height, lab?.height ?? 0); return r.width > 0 && h > 0 && h < 43.5 && !el.closest("p, li > span, dd, blockquote") && getComputedStyle(el).display !== "inline"; })
          .map((el) => `${el.tagName.toLowerCase()} “${(el.textContent || el.getAttribute("aria-label") || el.getAttribute("name") || "").trim().slice(0, 30)}” ${Math.round(el.getBoundingClientRect().height)}px`);
        return { over: de.scrollWidth - de.clientWidth, tiny };
      });
      if (m.over > 1) overflow.push(`${url} (+${m.over}px)`);
      if (width === 375) for (const t of m.tiny) small.push(`${url}: ${t}`);
    }
    if (width === 375 && who_ === "tasha") {
      await page.goto("/community");
      check("375px: bottom tab bar shows on mobile", await page.locator('nav[aria-label="Community"]').isVisible());
      await shot(page, "qa/mobile-375-feed");
      await page.goto("/community/classroom");
      await shot(page, "qa/mobile-375-classroom");
    }
    if (width === 375 && who_ === "admin") {
      await page.goto("/admin?view=community-members");
      await shot(page, "qa/mobile-375-dashboard-members");
    }
    if (width === 1440 && who_ === "tasha") {
      await page.goto("/community");
      await shot(page, "qa/desktop-1440-feed");
      await page.goto("/community/classroom");
      await shot(page, "qa/desktop-1440-classroom");
      await page.goto("/community/about");
      await shot(page, "qa/desktop-1440-about", { fullPage: true });
    }
  }
  check(`${width}px: no horizontal scroll on ${PAGES.length + ADMIN_PAGES.length + 3} pages`, overflow.length === 0, overflow.join(", "));
}
check("375px: tap targets are at least 44px", small.length === 0, [...new Set(small)].slice(0, 25).join(" · "));

// 9. Reset demo data
await A.setViewportSize({ width: 1440, height: 1000 });
await A.goto("/admin?view=community-settings");
await A.locator("summary:text-is('Reset demo data')").click();
sp = await submitIn('form[action="/api/community/demo.reset"] button');
check("9. Reset demo data from Settings", /starting point/.test(sp.get("msg") ?? ""), sp.get("msg") ?? sp.get("err"));
await A.goto("/admin?view=community-members&filter=pending");
check("9. After reset: Aaliyah is waiting for approval again", (await A.locator("li#aaliyah").count()) === 1);

check("No JavaScript errors in the browser console", errors.length === 0, [...new Set(errors)].slice(0, 8).join(" | "));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
process.exit(failed.length ? 1 : 0);
