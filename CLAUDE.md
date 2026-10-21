# CLAUDE.md: working in this repo

- Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4 (CSS-first `@theme` in `src/app/globals.css`), GSAP + ScrollTrigger (lazy via `src/lib/gsap.ts`), Lenis, lucide-react. Fonts are self-hosted via `next/font/local` (`src/app/fonts.ts`): Cormorant Garamond (display) and Jost (text/labels).
- **Facts live in `src/lib/site.ts`. Never hard-code NAP, hours, links, or prices in components.** Prices that aren't verified render a `<Needs>` marker.
- Content lives in `src/lib/content.ts` and `src/lib/articles.ts`. Pages are server components; only interactive pieces are client components.
- Motion: use `useLazyGsap(ref, ({ gsap, ScrollTrigger }) => {...})` from `src/components/motion/useLazyGsap.ts`. Never import `gsap` statically in a component (it would land in the critical bundle). Every animation must check reduced motion (the hook does) and have a static fallback.
- Scroll entrances: add `data-reveal` (or `data-reveal="fade"`) to below-the-fold text; `<PhotoSlot>` auto-applies the curtain unveil (`data-reveal="image"`). Pass `parallax={6}` for a gentle drift. Never use it above the fold; use the `.rise` CSS class plus `style={{"--d": n}}` instead (hero images use `priority`, which applies `.settle`).
- Brand mark: `<ICMark/>` is a CSS mask over `currentColor`. Don't inline the SVG path (it bloats the HTML). No handwriting or illustration elements (client direction: elegant, photo-led).
- Images: `img("key")` from `src/lib/images.ts` resolves `/public/images/key.(jpg|webp|png)` or returns undefined, and `<PhotoSlot>` shows a placeholder when it's undefined.
- Forms: Netlify Forms via `submitForm()` in `src/lib/forms.ts`. Any new form or field must also be added to `public/__forms.html`.
- SEO: every page exports `metadata` with a unique title, description, and canonical, and renders JSON-LD through `<JsonLd data={graph(...)}/>`. Keep `METHOD_DEFINITION` verbatim everywhere (entity consistency for GEO).
- Compliance (Virginia, non-physician): copy may say *assess / support / educate / refer*. It must never say *diagnose / treat / cure / regrow guaranteed*. Affiliate links need the disclosure next to them.
- Before shipping, run `npx tsc --noEmit && npm run build`. Check 375/768/1024/1440 widths and `grep -rn "NEEDS" src`.
