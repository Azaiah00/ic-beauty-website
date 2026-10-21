# DESIGN.md: I.C. Beauty, "Quiet Luxury"

Elegant first, with hints of artistry. Never use a color, font, or spacing value outside these tokens. Tokens live in `src/app/globals.css` (`@theme`).

## Idea
A calm, high-end hair-wellness studio translated to the web. That means bone paper, deep plum anchors, and hairline brass rules, with **Iisha herself** at the center. The artistry comes from composition (arched frames, an offset brass outline, editorial serif type, generous whitespace), not from effects.

## Color
| Token | Hex | Use |
|---|---|---|
| ink | #1B1220 | headings on light |
| plum-950 | #1D1022 | dark sections, footer, CTA band |
| plum-900 | #24132A | primary buttons, dark cards |
| plum-800 | #3A1D45 | deep accents |
| plum-700 | #5C4D60 | body text on light (neutral plum-grey) |
| amethyst | #6E3F86 | italic accent words, links, eyebrow labels |
| orchid / lilac | #9B72B0 / #CDB8DC | text on dark |
| mist | #F1EBF3 | soft tinted panels (hero backdrop) |
| bone | #F8F4EE | primary ground |
| paper | #FDFBF8 | alternate ground |
| sand | #ECE4D8 | placeholder frames |
| brass / brass-soft / brass-deep | #B8955A / #DCC394 / #7D6232 | **hairlines, numerals, tiny accents only** |

Rules: primary CTA = plum pill (on light) or bone pill (on dark). Brass is never a fill, only a line or a detail. Body text is plum-700, never pure purple.

## Type
- **Display:** Cormorant Garamond 300–600, with italic for one or two accent words per heading (`.italic-accent`, amethyst).
- **Text & labels:** Jost. Labels use `.eyebrow` (uppercase, 0.28em tracking, 0.72rem). Buttons are uppercase at 0.16em tracking.
- Scale: `text-mega`, `text-display`, `text-title`, `text-lede`.
- Roman numerals in italic Cormorant number the sequences (I, II, III).

## Shape
- `.arch` frames (fully rounded top) carry portraits and key images, often with an **offset 1px brass outline**.
- `rounded-card` (1.25rem) for panels. Hairline dividers `border-plum-800/10` between list items.

## Imagery
- **Real photo of Iisha first** (`iisha-portrait`: her I.C. logo in plum on the wall behind her).
- Placeholders are hyper-realistic editorial photography in the same palette (bone walls, plum velvet, brushed gold). The practitioner is never shown face-on.
- No illustrations, no abstract textures, no handwriting.

## Motion (subtle, elegant)
1. **Hero:** text rises in on pure CSS, and the portrait slowly settles from 1.07× scale (LCP-safe).
2. **Curtain unveil:** images reveal bottom-up with a slow settle as they enter.
3. **Gentle parallax** on key images (desktop only, ±3–5%).
4. **Soft rise** for text blocks, and the **italic motto marquee**.

Stack: GSAP ScrollTrigger (lazy-loaded after hydration) plus Lenis (desktop only). `prefers-reduced-motion` disables everything and shows all content.

## Scrollbar
Bone track with a plum-to-amethyst thumb (brand rule: never the default grey).

## Voice
Warm, direct, a little playful, and Brooklyn-confident, in her own phrases. Compliance wording: *assess, support, educate, refer.* Never *diagnose, treat, cure.*
