/** Minimal line-style social glyphs (lucide dropped brand icons). 24×24, stroke = currentColor. */
type P = React.SVGProps<SVGSVGElement>;
const base = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const InstagramIcon = (p: P) => (
  <svg {...base} {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.4" cy="6.6" r="0.6" fill="currentColor" /></svg>
);
export const FacebookIcon = (p: P) => (
  <svg {...base} {...p}><path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" /></svg>
);
export const YoutubeIcon = (p: P) => (
  <svg {...base} {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="3.5" /><path d="m10.5 9.5 4 2.5-4 2.5z" fill="currentColor" /></svg>
);
export const TikTokIcon = (p: P) => (
  <svg {...base} {...p}><path d="M14 3v11.2a3.8 3.8 0 1 1-3.8-3.8" /><path d="M14 3c.4 2.6 2.3 4.5 5 4.8" /></svg>
);
