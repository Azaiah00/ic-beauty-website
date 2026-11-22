/**
 * The H.A.I.R. Shift Masterclass gift (Iisha's "Your Hair Decision Cheat Sheet", Nov 2026).
 * - Private page: /masterclass/gift (noindex, not in the sitemap or menus). Reached from the QR on Iisha's Zoom slide
 *   (?src=qr); ?src=email is kept in case she ever emails the link.
 * - Download: /api/gift/hair-shift counts the click, then hands over the PDF in /public/downloads.
 * Iisha shares it by putting the QR (to ?src=qr) on a slide in her Zoom deck (decided 2026-11-22: no follow-up email).
 */
import { SITE_URL } from "@/lib/site";

export const GIFT_KEY = "hair-shift-cheat-sheet";
export const GIFT_PDF = "/downloads/the-hair-shift-hair-decision-cheat-sheet.pdf";
export const GIFT_PAGE = "/masterclass/gift";
export const giftUrl = (src: "email" | "qr") => `${SITE_URL}${GIFT_PAGE}?src=${src}`;
