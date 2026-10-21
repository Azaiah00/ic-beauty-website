# I.C. Beauty: icbeautyinyou.com (rebuild)

**Client:** Iisha C. Silver, I.C. Beauty LLC, 8030 W Broad St, Suite 117, Henrico, VA 23294 · (804) 397-3340 · icbeautyinyou@gmail.com
**Built by:** Couture House Co. (Fred & Azaiah)
**Direction:** *Quiet luxury.* Elegant editorial design with real photos of Iisha front and center, hyper-realistic placeholder imagery, and subtle motion. Where hair, health & education connect. Home of **The H.A.I.R. Wellness Method™** (Healthy Awareness Is Rare).

The site follows Iisha's notebook. One signature method branches into three revenue arms (**Client Programs → Professional Education → Speaking & Workshops**). A single **Hub** replaces Linktree, Stan, the Square store links, and the affiliate links.

---

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (all 28 routes are static)
```

Node 20+ is required (`.nvmrc` = 20).

## Deploy (Netlify)

1. Push to GitHub, then in Netlify choose **Add new site → Import from Git**.
2. Netlify detects Next.js automatically and installs `@netlify/plugin-nextjs`. **Do not set a publish directory.** `netlify.toml` already pins Node 20.
3. Add the environment variable `NEXT_PUBLIC_SITE_URL=https://www.icbeautyinyou.com`.
4. **Forms:** go to Netlify → Forms → enable form detection. Six forms are declared in `public/__forms.html`: `discovery-call`, `speaking-inquiry`, `class-waitlist`, `contact`, `newsletter`, `scalp-check`. Add an email notification for each one to icbeautyinyou@gmail.com. To send automatic emails to visitors (the Scalp Self-Check results and the newsletter welcome), connect Netlify Forms to her email platform through Zapier or Make.
5. **DNS cut-over.** Her current site is Square Online on the same domain, so complete these steps *before* switching DNS:
   - Move the Square store to a subdomain (for example `shop.icbeautyinyou.com`) and update `links.shop` in `src/lib/site.ts`.
   - Paste her Square Appointments or Calendly booking URL into `links.phase1Scheduler`. Every "Book" button switches over automatically. Until then, Phase 1 requests come in through the `/book` form.
   - Old URLs already 301-redirect: `/road-to-hair-recovery → /client-programs`, `/classes → /professional-education`, `/privacy-policy → /policies`.
6. After launch: submit `https://www.icbeautyinyou.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools. Then update her Instagram and TikTok bio link to **`/links`**.

## Images

**Iisha's real photo:** `public/images/iisha-portrait.jpg`. This is her white-coat portrait (from the Bare Roots shoot). The Bare Roots wall sign was digitally removed and replaced with her I.C. Beauty logo in plum, and the coat embroidery was corrected from "Haha Silver" to "Iisha Silver". It's used in the home hero, Meet Iisha, About, Speaking, the Professional Education quote, and the /links avatar.

**Hyper-realistic placeholders (Kie.ai):** studio, consultation, client-portrait, scalp-closeup, classroom, speaker, product-shelf, parent-child, scalp-ritual. The practitioner is never shown face-on, so no one is presented as Iisha. To regenerate:

```bash
# KIE_API_KEY=... lives in .env.local (never committed)
node --env-file=.env.local scripts/generate-images.mjs            # all missing
node --env-file=.env.local scripts/generate-images.mjs studio     # one
```

**Real photos always win.** Drop a file into `public/images/` with one of these names and it replaces the placeholder (jpg, webp, or png):

| File name | Where it shows |
|---|---|
| `iisha-portrait` | Home hero, Meet Iisha, About, Speaking, /links avatar |
| `iisha-hero` | About hero (overrides the portrait) |
| `iisha-speaking` | Speaking hero |
| `iisha-teaching` | Professional Education hero (overrides classroom) |
| `studio`, `consultation`, `scalp-ritual`, `scalp-closeup`, `classroom`, `speaker`, `product-shelf`, `parent-child` | Replace any placeholder with her real studio, client, and class photos (same name) |
| `studio-1` … `studio-5` | About "Inside the studio" gallery |
| `progress-1` … `progress-4` | Home progress journey: Week 1, Week 8, Month 6, Year 1 (client consent required) |

## Where things live

- `src/lib/site.ts` holds **every verified fact** (NAP, hours, links, disclaimer, the canonical method definition). Edit facts here only.
- `src/lib/content.ts` holds the method phases, offers, classes, talks, Hub items, retail, and FAQs.
- `src/lib/articles.ts` holds the Hair Wellness Library (AEO articles with sources).
- `src/lib/schema.ts` builds the JSON-LD `@graph` (HairSalon + HealthAndBeautyBusiness, Person, DefinedTerm method, Course, FAQPage, Article, Breadcrumbs).
- `src/app/llms.txt/route.ts`, `sitemap.ts`, and `robots.ts` handle GEO hygiene. AI crawlers are explicitly allowed.
- `src/components/motion/*` holds smooth scroll + scroll reveals (curtain image unveils, gentle parallax), the marquee, and the growth-cycle explainer.
- `src/components/sections/MethodSteps.tsx` holds the four H.A.I.R. phases (sticky arched image + unfolding steps).
- `public/brand/` holds Iisha's logo traced to vector (`ic-mark-crop.svg`).

Before launch, run `grep -rn "NEEDS\|Needs" src` to find every owed asset. The full list is in `CLIENT-ASSETS-OWED.md`.
