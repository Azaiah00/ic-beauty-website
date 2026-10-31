# Funnel 1 — "Hair Love": free checklist → $7.99 guide → 30-day pilot

*Couture House Co. for I.C. Beauty · built 2026-10-31 · status: awaiting approval*

## The flow

```
TikTok Live / IG bio / Reels  ──►  /hair-love            (free checklist opt-in: first name, email, optional mobile)
   short links: /free  /hairlove  /checklist
                                   │
                                   ▼
                              /hair-love/welcome    (instant download of both PDFs + Iisha video + $7.99 Radiance Rewired + pilot invite)
                                   │                         │
                                   │                         └─►  /shop/radiance-rewired   (on-site product page)
                                   ▼
                              /hair-love/30-days    (pilot sales page + founding-seat application)   short links: /30days  /pilot
                                   │
                                   ▼
                              /hair-love/reserved   (application received; Iisha replies with a Square payment link)

Email + SMS nurture (below) runs in the background and pulls leads back to /30-days and /shop.
```

**Why this shape** (from the reference funnel + research):
- **One job per page.** The funnel pages have no site navigation, no popups and one primary action. The reference (Contrarian Thinking) repeats a single "Apply" CTA five times down one page, and we do the same on /30-days.
- **Checklist lead magnet.** Checklists and cheat sheets are among the highest-converting free downloads (benchmarks of about 24–42% opt-in on warm traffic, vs. 4–8% for long guides), and it's the free download Iisha already had.
- **Short form.** Opt-in rates drop with each extra field, so phone is *optional* and SMS consent only appears once a number is typed.
- **Bonus on the opt-in** (The Scalp-Calm Kitchen) raises perceived value with zero added friction.
- **Low-cost offer on the thank-you page** ($7.99 Radiance Rewired): about 8–15% of warm traffic buys a $7–$27 offer when it directly follows the free item. It turns leads into *buyers*, and buyers are far more likely to buy again.
- **Application, not checkout, for the pilot.** Beta cohorts convert best with a short application (≈5 questions), founding-member pricing, limited seats and a feedback-for-discount exchange. It also lets Iisha pick a pilot group that will produce the feedback videos she wants before full launch.
- **Video slot** on /welcome and /30-days ("watch with sound"), the same as the reference's top-of-page video. Kie promo video first (after approval), then Iisha's own.

## Where leads go right now
All three forms submit to **Netlify Forms** (`hair-love-optin`, `pilot-application`, `product-request`). Every opt-in records `utm-source / utm-medium / utm-campaign / utm-content` (or the referrer), so you can see which Live or post produced each lead.

**Use these links on TikTok so you can track them:**
- Live: `icbeautyinyou.com/hair-love?utm_source=tiktok&utm_medium=live&utm_campaign=feb_pilot`
- Bio: `icbeautyinyou.com/hair-love?utm_source=tiktok&utm_medium=bio`
- Instagram bio: `icbeautyinyou.com/hair-love?utm_source=instagram&utm_medium=bio`
- Said out loud on Live: **icbeautyinyou.com/free**

### Needed to make the nurture automatic (choose one)
Netlify Forms captures leads but does not send sequences. Connect an email + SMS platform:
1. **Square Marketing (recommended for now).** She already uses Square, and it covers both email and text. Zapier/Make: Netlify form → Square customer + tag.
2. **Kit (ConvertKit)** or **Flodesk** for email, plus Square or SimpleTexting for SMS: better automation and segmentation as the list grows.

When payments move to Square (Phase 2), `src/lib/products.ts` → `checkoutUrl` and `src/lib/funnel.ts` → `coreCheckout` / `vipCheckout` take the Square links, and every button switches from "request" to "buy" with no page changes.

---

## Email sequence (write once, runs forever)
Sender: **Iisha from I.C. Beauty** · reply-to icbeautyinyou@gmail.com · every email has one link and one ask.

**E1, immediately** · Subject: *Your Red Flags checklist (+ a bonus)*
> Hey {first_name}, it's Iisha. Here's your **Hair Health Red Flags** checklist, and as promised, **The Scalp-Calm Kitchen** food guide too. [Download both →]
> Do one thing today: take the checklist. Five minutes, honest answers, then count your boxes.
> Hit reply and tell me your number. I read every one.
> — Iisha · *Healthy Awareness Is Rare*

**E2, day 1** · Subject: *What your number actually means*
> If you scored 0–1, your hair is happy. 2–3 means it's whispering. 4 or more means your hair and body are asking for a plan.
> Most of the women I work with score 4+ the first time. Not because they're doing it wrong, but because nobody ever taught them how to read their hair.
> Start with one change this week: **cleanse before you oil.** [See the other two quick wins (page 5) →]

**E3, day 2** · Subject: *The part of hair care nobody talks about*
> Your hair is built from what your body can absorb, and your gut decides a lot of that. If you checked anything under *Body & Gut*, read this next.
> **Radiance Rewired** ($7.99) walks you through the gut–hair connection and the food and lifestyle shifts that help. [Get Radiance Rewired →]

**E4, day 4** · Subject: *Why I called it "Healthy Awareness Is Rare"*
> Story email: Iisha's Brooklyn roots, the client who changed how she works, and why awareness, not products, is the turning point.
> Soft CTA: *I'm opening a small founding group in February. Details soon.*

**E5, day 6** · Subject: *30 days to a new love story with your hair*
> The announcement: what the 30 days are (Embrace → Understand → Nourish → Confidently care), the two options, founding-member pricing, and the February pilot.
> [See the program + apply →] `/hair-love/30-days`

**E6, day 8** · Subject: *"Do I need to buy a bunch of products?"*
> Objection email answering the FAQ: time (2–3 hrs/week, with replays), virtual, no product requirement, education not medical treatment. [Apply for a founding seat →]

**E7, day 10** · Subject: *Founding seats are almost gone* (send **only** when true)
> Real scarcity only: seats left and the application deadline. Last call. [Apply →]

**After E7:** move the lead to the weekly newsletter (one tip + one link). Re-send E5–E7 before each new cohort.

**Branching:** if someone **buys Radiance Rewired**, skip E3 and send a thank-you plus a "how did it land?" check-in on day 5. If someone **applies**, stop the sequence and switch to the onboarding emails.

## SMS (only to people who checked the SMS consent box; up to 4 per month)
- **S1, immediately:** *I.C. Beauty: Hi {first_name}! Your Red Flags checklist is in your email. Take it today, it's 5 min. Reply with your score! Reply STOP to opt out.*
- **S2, day 6:** *I.C. Beauty: Founding seats for my 30-day H.A.I.R. program are open: icbeautyinyou.com/30days. Questions? Just reply. — Iisha*
- **S3, 48 hours before applications close:** *I.C. Beauty: Last call for February founding seats → icbeautyinyou.com/30days*
- **S4, the night before each TikTok Live:** *I.C. Beauty: I'm live tomorrow at {time} talking {topic}. Come hang with me.*

## Metrics to watch (first 30 days)
| Step | Healthy target (warm social traffic) |
|---|---|
| /hair-love visit → opt-in | 25–40% |
| Opt-in → Radiance Rewired request/purchase | 5–15% |
| Opt-in → /30-days visit | 30%+ (via the welcome page + E5) |
| /30-days visit → application | 5–10% |
| Email open rate (welcome emails) | 40–60% |

## Owed by Iisha before launch
- [ ] Pilot **start date**, **seat count**, **Core price**, **VIP price** (`src/lib/funnel.ts`). The pages show markers until these are set.
- [ ] Approve the **4-week outline** and the **VIP inclusions** (1:1 session, product plan, priority Q&A, 30-day follow-up).
- [ ] **Radiance Rewired** original file (to recreate in the new design), plus Custom Sound Therapy and membership details.
- [ ] Her **welcome video** (or approve the Kie promo as a placeholder).
- [ ] Choose the **email/SMS platform** (above) so E1–E7 and S1–S4 can be loaded.
- [ ] Approve the two recreated downloads (the checklist and The Scalp-Calm Kitchen).

## Sources
- Lead magnet + opt-in benchmarks: [Subpage, Lead Magnet Conversion Rates 2026](https://subpage.co/lead-magnet-conversion-benchmarks-2026/) · [Leadpages, Landing Page Benchmarks 2026](https://leadpages.com/blog/landing-page-conversion-benchmarks-2026)
- Tripwire pricing + take rates: [CartFlows, Tripwire Funnel (2026)](https://cartflows.com/blog/tripwire-funnel/)
- Beta cohort method: [Pocketsflow, How to Run a Beta Cohort](https://www.pocketsflow.com/blog/how-to-run-a-beta-cohort)
- Reference funnel analyzed: Contrarian Thinking, Growth Accelerator Workshop (single-page VSL → application flow)
- Food guide: [National Psoriasis Foundation, Mediterranean diet](https://psoriasis.org/episode-172-transcript) · [Rotterdam Study on diet and seborrheic dermatitis](https://repub.eur.nl/pub/111397)
