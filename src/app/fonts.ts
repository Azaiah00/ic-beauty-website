import localFont from "next/font/local";

/** Self-hosted. Display: Cormorant Garamond (elegant high-contrast serif). Text & labels: Jost (refined geometric sans). */
export const cormorant = localFont({
  src: [
    { path: "../fonts/cormorant-garamond-latin-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/cormorant-garamond-latin-400-italic.woff2", weight: "400", style: "italic" },
    { path: "../fonts/cormorant-garamond-latin-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-cormorant",
  display: "swap",
  preload: true,
  adjustFontFallback: "Times New Roman",
  fallback: ["Georgia", "serif"],
});

export const jost = localFont({
  src: [{ path: "../fonts/jost-latin-wght-normal.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-jost",
  display: "swap",
  preload: true,
  adjustFontFallback: "Arial",
});
