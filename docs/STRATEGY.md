# I.C. Beauty: Strategy behind the rebuild
*Couture House Co. · prepared 2026-10-20*

## 1. Audit of the current site (icbeautyinyou.com, Square Online)
| Problem | Evidence | Fix in the rebuild |
|---|---|---|
| No clear positioning | The hero says "Services that we offer…" over a dark group photo. The method, speaking, and stylist education are invisible. | The H1 is her own line, "Where hair, health & education connect," and the method branches into the three arms. |
| Broken or empty pages | `/faq` is empty. "Terms and Policies" holds only a heading. "Educational Corner" leaves the site for stan.store. | 16 FAQs written in her voice, a full policies page, and an on-site Library and Hub. |
| Booking is a maze | "Schedule Your Appointment" goes to the *shop*. Linktree's "Book Phase 1" points back to the homepage. Phase 2 is a Jotform. Sound therapy runs through Calendly. | One `/book` flow (Phase 1 request form with real lead capture), Phase 2 intake linked in context, and one config line to plug in her scheduler. |
| Her offers are scattered across 6 tools | Square, Stan, Linktree, Calendly, Jotform, Optimal Health Systems, Solex, and Amazon | **The Hub** plus `/links` put every product, download, affiliate, and tool on her domain. This builds SEO, keeps traffic, and drops Linktree. |
| Zero search footprint | A web search for her name or business returns nothing relevant. Only meta tags and no schema exist. | Full entity graph (LocalBusiness + Person + DefinedTerm method), unique metadata per page, 6 cornerstone AEO articles, llms.txt, and a sitemap. |
| Mismatched socials | The site footer links @giftedhands804, while her active IG is @i.c.beautybrand. | Unified handles in `site.ts`, used site-wide and in `sameAs`. |
| Compliance exposure | Phrases like "treatment plan" and "heal" sit next to alopecia with no disclaimer. | A Virginia-safe vocabulary (assess / support / educate / refer), a referral red-flag list, and a disclaimer on every page. |

## 2. Her notebook, decoded
**Page 1: "What will ICB.com become?"**
- *"Show up authentic bc that's what I'm teaching."* This is why her real photo leads the site and the copy uses her own words throughout.
- **Signature intellectual property:** *The H.A.I.R. Wellness Method, Healthy Awareness Is Rare.* It gets its own page, its own schema entity, and one canonical definition sentence.
- The method branches into three arms: **Client Programs → Stylist Education → Corporate Speaking.** That branching is the homepage architecture, drawn as animated lines.
- *"Position self as the educator, speaker + creator of the Method."* Person schema, the About page, speaking talks, and author boxes on every article do this.
- *"Possible homepage → I.C. Beauty: Where hair, health + Education connect."* This is the H1.
- *"Introduce the H.A.I.R. Wellness Method: new approach to understanding, maintaining, and teaching healthy hair practices."* This is the method definition, verbatim.

**Page 2: "3 Pages"**
1. **Explore Client Programs**: personalized hair wellness + self-care education → `/client-programs`
2. **Professional Education**: for other stylists → `/professional-education`
3. **Speaking & Workshops**: organizations, HBCUs, professional audiences → `/speaking`
- *"But how will I build the options for everything else?? Need hub for supplements, digital products… hopefully condensing cost as well."* That is **The Hub** (`/hub`) plus `/links`. It replaces Linktree, and the Stan checkout can follow later (see §5).
- *"Remember: Embrace, Understand, Confidently Care."* This is the promise behind the four phases, set as an italic line under the method.

## 3. What the best in the niche do, and how we beat them
- **Philip Kingsley:** a hair quiz as the lead magnet, shop-by-concern, credentials stacked. *We built the Scalp Self-Check (7 questions → Awareness Profile → booking, with stylist and organizer routing).*
- **Bridgette Hill (Root Cause Scalp Analysis™):** a trademarked method page and dated progress photos. Her personal site is a JS shell AI can't read. *We built a method page, a Week 1 → Year 1 progress journey, and fully server-rendered pages.*
- **Dr. Kari Williams:** a separate "train with me" funnel plus a certification directory. *We built Professional Education with a waitlist and a future "H.A.I.R. Method Certified Stylist" track.*
- **Lisa Nichols / Mel Robbins:** speaker pages with talks, formats, "reasons to book," a one-sheet, and an inquiry form. *We built the same structure, aimed at HBCUs, sororities, churches, and ERGs.*
- **Awwwards wellness winners (Beauty In Stem, Institute of Health, Function Health):** one typographic voice, one signature motion system, scroll storytelling. *Our direction (revised with the client) is quiet luxury: Iisha front and center in arched editorial frames, hyper-realistic studio imagery, and restrained curtain-reveal motion.*
- **Local gap (Richmond):** Divine Designs HLS (women 40+, labs) and Destani Trichology (Chesterfield, strong reviews) don't teach stylists, don't speak, have no method IP, and aren't built around textured hair or Black women. Iisha can own all of that.

## 4. SEO / GEO / AEO build
- **Entity graph** (`src/lib/schema.ts`): HairSalon + HealthAndBeautyBusiness (NAP, geo pin, hours, area served, offer catalog) ↔ Person (Iisha, knowsAbout) ↔ DefinedTerm (the method) ↔ Course (stylist classes) ↔ Article (author = Iisha) ↔ FAQPage ↔ BreadcrumbList.
- **One canonical method sentence**, repeated verbatim on Home, the Method page, the Library, and llms.txt, so AI engines attribute the method to her.
- **AEO articles**: each opens with a question-led H1, then a 40–60 word "short answer" box, then depth, dermatology sources (AAD), a "when to see a dermatologist" box, an author box, and a last-reviewed date.
- **Local keywords** in titles: hair loss specialist Richmond VA, trichologist Richmond VA, Henrico, Black hair loss specialist Virginia, traction alopecia, stylist education Richmond, hair wellness speaker HBCU.
- **Technical**: all 28 routes are static. Robots allow GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, and Google-Extended. There is a sitemap, llms.txt, canonical URLs on every page, OG images, and 301s from the old Square URLs.
- **Facts as of 2026** (from research): Google retired FAQ rich results for all sites on May 7, 2026, and Course Info in June 2025. We still ship FAQPage and Course markup because it helps understanding and non-Google engines, but it is not a SERP-feature promise. Google says no special schema or llms.txt is needed for AI Overviews, so llms.txt is hygiene and the content quality is the lever.

## 5. Upsells built into the architecture (Couture House revenue)
1. **Booking portal** (Phase 2): a client and admin portal with a progress-photo timeline, replacing Square + Calendly + Jotform.
2. **Own the checkout**: move Stan digital products and the membership onto Stripe on-site (saves Stan fees and keeps buyers on her domain).
3. **H.A.I.R. Method Certified Stylist** course and a directory (her biggest long-term revenue line).
4. **Monthly content retainer**: 2 Library articles a month, GBP posts, and review-request automation.
5. **Speaker kit**: one-sheet PDF, sizzle reel edit, and event pages with Event schema.

## Sources
- [AAD: Black hair, tips for everyday care](https://www.aad.org/public/everyday-care/hair-scalp-care/hair/care-african-american)
- [AAD: Hairstyles that pull can lead to hair loss](https://www.aad.org/public/diseases/hair-loss/causes/hairstyles)
- [AAD: Hair loss, who gets and causes](https://www.aad.org/public/diseases/hair-loss/causes/18-causes)
- [AAD: Do you have hair loss or hair shedding?](https://www.aad.org/public/diseases/hair-loss/insider/shedding)
- [Google: AI optimization guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [FAQ rich results deprecated (May 2026)](https://www.techwyse.com/news/ai-search/google-faq-rich-results-deprecated-2026)
- [Va. Code §54.1-2900](https://law.lis.virginia.gov/vacode/title54.1/chapter29/section54.1-2900/) · [§54.1-700](https://law.lis.virginia.gov/vacode/title54.1/chapter7/section54.1-700/)
- [FTC Health Products Compliance Guidance](https://www.ftc.gov/business-guidance/resources/health-products-compliance-guidance)
- Competitors: [Divine Designs HLS](https://www.divinedesignshls.com/) · [Destani Trichology](https://destanitrichology.com/) · Benchmarks: [Philip Kingsley](https://www.philipkingsley.com/) · [Root Cause Scalp Analysis](https://rootcausescalpanalysis.com/) · [Dr. Kari Williams](https://www.drkariwilliams.com/) · [Mel Robbins Speaking](https://www.melrobbins.com/speaking/)
- GitHub: [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) · [darkroomengineering/satus](https://github.com/darkroomengineering/satus) · [greensock/GSAP](https://github.com/greensock/GSAP) · [google/schema-dts](https://github.com/google/schema-dts) · [AnswerDotAI/llms-txt](https://github.com/AnswerDotAI/llms-txt)
