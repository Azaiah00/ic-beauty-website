/**
 * /api/gift/hair-shift  The H.A.I.R. Shift cheat-sheet download (masterclass free gift).
 *   POST name, email, src, t, bot-field  (the form on /masterclass/gift)
 *     1. records the download under the dashboard tab "Gift downloads" (+ Square tag, + an email with the link)
 *     2. if the email matches a masterclass registration, marks that registration "Attended"
 *     3. counts the download by source (qr / email / page), then 303s to the PDF
 *   GET  sends people back to the page, so the download always goes through the email form.
 */
import { listSubmissions, updateSubmission } from "@/lib/server/store";
import { recordSubmission } from "@/lib/server/submit";
import { countGift } from "@/lib/server/tracking";
import { tooFast } from "@/lib/server/spam";
import { seeOther } from "@/lib/server/redirect";
import { GIFT_KEY, GIFT_PAGE, GIFT_PDF } from "@/lib/server/masterclassGift";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SRC = new Set(["qr", "email", "page"]);

export async function GET(req: Request) {
  const src = new URL(req.url).searchParams.get("src") ?? "";
  return seeOther(`${GIFT_PAGE}?src=${SRC.has(src) ? src : "page"}`);
}

export async function POST(req: Request) {
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return seeOther(`${GIFT_PAGE}?err=form`);
  }
  const s = String(fd.get("src") ?? "");
  const src = SRC.has(s) ? s : "page";
  const name = String(fd.get("name") ?? "").trim().slice(0, 120);
  const email = String(fd.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const retry = (err: string) => seeOther(`${GIFT_PAGE}?src=${src}&err=${err}&name=${encodeURIComponent(name)}`);

  // Bots: the hidden field filled in, or the form sent faster than a person could type. Act like it worked.
  if (String(fd.get("bot-field") ?? "") || tooFast(fd.get("t"), 1500)) return seeOther(GIFT_PDF);
  if (!name) return retry("name");

  const r = await recordSubmission("masterclass-gift", { name, email, source: src === "qr" ? "Zoom QR" : src === "email" ? "Email link" : "Gift page" });
  if (!r.ok) return retry(r.status === 422 ? "email" : "save");

  if (r.id) {
    // Downloading the gift means they were on the call: mark the matching registration "Attended".
    try {
      const reg = (await listSubmissions("masterclass")).find((m) => m.email.toLowerCase() === email && (m.status === "Registered" || m.status === "Contacted" || m.status === "No-show"));
      if (reg) {
        await updateSubmission("masterclass", reg.id, (cur) => ({
          ...cur,
          status: "Attended",
          log: [...cur.log, { at: new Date().toISOString(), step: "Marked Attended (downloaded the gift)", ok: true, detail: `was ${cur.status}` }],
        }));
      }
    } catch (e) {
      console.error("[gift] attended mark failed", e);
    }
    await countGift(GIFT_KEY, src).catch(() => null);
  }
  return seeOther(GIFT_PDF);
}
