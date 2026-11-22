/**
 * Owner dashboard → Masterclass tab: the H.A.I.R. Shift free gift (cheat sheet).
 * Iisha shows the QR on a slide in her Zoom deck, so only people on the call get the link.
 * The download asks for name + email (dashboard tab "Gift downloads"); a matching registration here is marked Attended.
 * This panel shows how many people downloaded it and links to the gift page and the PDF.
 */
import { Gift, QrCode, Download } from "lucide-react";
import { getGiftCount } from "@/lib/server/tracking";
import { GIFT_KEY, GIFT_PAGE, GIFT_PDF, giftUrl } from "@/lib/server/masterclassGift";
import { TZ } from "./ui";

const card = "rounded-[1.4rem] bg-white shadow-[0_1px_2px_rgba(36,19,42,0.05),0_18px_40px_-28px_rgba(36,19,42,0.35)]";
const ghost = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-plum-800/15 px-5 text-[0.74rem] font-medium uppercase tracking-[0.12em] text-plum-900 hover:border-amethyst";

export async function MasterclassGift() {
  const gift = await getGiftCount(GIFT_KEY);
  const last = gift.last ? new Date(gift.last).toLocaleString("en-US", { timeZone: TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "";
  return (
    <section id="gift" className={`${card} mt-5 scroll-mt-24 p-5 sm:p-6`} aria-labelledby="gift-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow inline-flex items-center gap-2 text-amethyst"><Gift className="h-4 w-4" aria-hidden="true" strokeWidth={1.6} /> Masterclass free gift</p>
          <h2 id="gift-title" className="mt-1 font-display text-[1.5rem] leading-tight text-plum-900">The H.A.I.R. Shift: Your Hair Decision Cheat Sheet</h2>
          <p className="mt-1 max-w-xl text-[0.88rem] text-plum-700">
            Show the QR slide during your Zoom. Only people on the call see it, so only participants get the download. Each person enters their name and email first: they appear under <a href="/admin?form=masterclass-gift" className="underline underline-offset-2">Gift downloads</a>, get a copy by email, and anyone who registered here is marked Attended automatically.
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-bone px-4 py-2"><dt className="text-[0.7rem] uppercase tracking-[0.14em] text-plum-700">Downloads</dt><dd className="text-[1.6rem] font-light tabular-nums text-plum-900">{gift.total}</dd></div>
          <div className="rounded-2xl bg-bone px-4 py-2"><dt className="text-[0.7rem] uppercase tracking-[0.14em] text-plum-700">From the QR</dt><dd className="text-[1.6rem] font-light tabular-nums text-plum-900">{gift.qr}</dd></div>
        </dl>
      </div>
      {last && <p className="mt-2 text-[0.78rem] text-plum-700/80">Last download {last}.</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`${GIFT_PAGE}?src=page`} target="_blank" className={ghost}><Gift className="h-4 w-4" aria-hidden="true" /> Open the gift page</a>
        <a href={GIFT_PDF} target="_blank" className={ghost}><Download className="h-4 w-4" aria-hidden="true" /> The PDF (to print)</a>
      </div>
      <p className="mt-3 flex items-start gap-2 text-[0.78rem] text-plum-700/80"><QrCode className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> The QR on your slide opens {giftUrl("qr").replace(/^https?:\/\//, "")}</p>
    </section>
  );
}
