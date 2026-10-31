# Funnel 2: "The H.A.I.R. Circle" (low-cost monthly membership + member portal)

*Couture House Co. for I.C. Beauty · built 2026-10-31 · status: demo, awaiting approval*

Same topic as Funnel 1 (hair + scalp wellness, the H.A.I.R. Wellness Method), but instead of a one-time digital product, people subscribe to an **experience that gets new value every week**, inside a private portal where they track their own progress, use what they bought, and (for clients) track their treatments with Iisha. It replaces her current "It's a WIN WIN" membership ($13.99/mo on Stan).

## The flow

```
TikTok / IG / Funnel 1 emails / in-salon QR  ──►  /circle           (membership sales page; short links /join, /membership)
                                                     │  "Peek inside" → /portal (live demo)
                                                     ▼
                                                /circle/join       (Monthly or Annual · Continue with Google or email · 14-day free trial)
                                                     ▼
                                                /circle/welcome    ("Do these 3 things today" → Open my portal)
                                                     ▼
                                                /portal            Home · Lessons · Progress · My care · Downloads
```

### What's inside the portal (built, working in demo mode)
| Area | What the member does | Why it keeps them paying |
|---|---|---|
| **Home** | This week's lesson, progress rings, today's habits, day streak, next session, what unlocks Monday | One glance shows progress and the next action (habit loop) |
| **Lessons** | A new lesson every Monday (12-week curriculum built): video, 3 takeaways, action step, worksheet, private reflection journal, mark complete | Weekly new value is the #1 retention driver; locked "unlocks Monday" cards create anticipation |
| **Progress** | Weekly self-ratings (4 metrics), trend chart, red-flags score trend, 7-day habit grid, photo check-ins | Visible progress counters the #2 cancellation reason ("not worth the cost") |
| **My care** | Session notes from Iisha, home-care plan as a checklist, next appointment, request a session, text Iisha | For clients in treatment: the portal becomes part of the service and is almost impossible to cancel |
| **Downloads** | Every guide and worksheet unlocked so far | Tangible library that grows each week |

The **Week 3 Wash Day Blueprint** worksheet is a real designed PDF. The other weekly worksheets show "Worksheet to design" markers, and I create them as each lesson is recorded (covered by the Care Plan).

## Pricing recommendation (Iisha decides; the pages show markers until she does)
- **Monthly: $19/month** after a 14-day free trial. Her current $13.99 membership offered tips and check-ins only. The Circle adds a full portal, weekly lessons, worksheets and tracking, so $19 is still "less than a bottle of conditioner" and an easy yes from a TikTok viewer.
- **Annual: $190/year** (two months free). Annual members churn at roughly one-third the rate of monthly members.
- **Founding members** (first 50, or everyone who joins before the February pilot): lock $14.99/month for life. This rewards early adopters and gives a real reason to join now.
- **Current WIN WIN members:** move them over at their current $13.99 with a personal note from Iisha.

## Retention plan (what the research says moves the needle)
Typical paid-community churn is **4–8% a month** (about 5.8% average). The top drivers are low engagement (32% of cancellations), "not worth the cost" (27%) and content going stale (19%).
1. **The first two weeks decide everything.** The welcome page gives 3 prescribed first actions. Emails C1–C4 below repeat them, and a text on day 3 checks in.
2. **Weekly live touchpoint.** Communities with at least one live event a week report about 2x better retention. Make the Monday lesson drop an event (a 5-minute TikTok Live or IG story), and hold the monthly live Q&A.
3. **Re-engage the quiet ones.** Members with no portal activity in 14+ days get a personal "I miss you" text from Iisha. Outreach typically recovers 10–20% of them.
4. **Push annual billing** at day 10 of the trial and at month 3.
5. **Trial length.** Trials of 17–32 days convert best (about 42% median, vs. about 37% for 5–9 days). 14 days works; if trial-to-paid is under 35% after 60 days, test a 30-day trial.

## Trial-to-paid email sequence
- **C1, day 0:** *Welcome to the Circle. Here's your Week 1* (the 3 first actions + portal link)
- **C2, day 2:** *Did you take your baseline photos?* (why the baseline matters; a screenshot of the Progress page)
- **C3, day 5:** *Your habit streak* (how small habits compound; Iisha's own wash-day story)
- **C4, day 7 (Monday drop):** *New lesson unlocked: Reading Your Scalp*
- **C5, day 10:** *Save with annual* (the annual offer, framed as two months free)
- **C6, day 12:** *Your trial ends in 2 days* (what's coming in weeks 3–6; no surprise charges)
- **C7, day 14:** *You're officially in the Circle* (thank you + this week's lesson)

**SMS (consented members only):** day 3 check-in; every Monday "New lesson is live"; the night before the monthly Q&A.

## Going live (the swap from demo to real; the UI does not change)
All portal screens read from one data layer: `src/lib/portal/data.ts` (content) + `src/components/portal/PortalState.tsx` (member state).
1. **Supabase**: tables for members, lessons, progress check-ins, habits, reflections, photos (private storage bucket), treatments and home-care items, with row-level security so each member only sees their own data.
2. **Google sign-in** (Supabase Auth) + **Iisha's approval step**: new signups land as "pending". Paying trial members are auto-approved, and Iisha approves the link to her client records.
3. **Square Subscriptions**: monthly and annual plans with a 14-day trial; Square webhooks set member status (trialing / active / past due / canceled).
4. **Admin side for Iisha** (part of the Phase 2 admin portal in the contract): add session notes and home-care plans, see members' check-ins and photos before appointments, publish weekly lessons.

## Owed by Iisha
- [ ] Approve the name (**The H.A.I.R. Circle**) or choose another
- [ ] Monthly / annual / founding prices (`src/lib/portal/data.ts` → `membership`)
- [ ] Approve the 12-week curriculum and record Weeks 1–4 first (10–16 min each; phone video is fine)
- [ ] Confirm the monthly live Q&A and the "cancel anytime" terms
- [ ] Tell us how she wants clients' session notes written (we'll make a 60-second template)

## Sources
- [Membership community churn benchmarks (RetentionCheck, 2026)](https://retentioncheck.com/churn-benchmarks/membership-communities)
- [Trial-to-paid conversion benchmarks (PricePush, 2026)](https://pricepush.app/blog/trial-to-paid-conversion-rate-benchmarks)
- [The first thirty days decide whether a member stays (MemberGate)](https://www.membergate.com/tips/3/The-first-thirty-days-decide-whether-a-member-stays)
- [Membership retention strategies (Membership.io)](https://membership.io/blog/membership-retention-strategies)
