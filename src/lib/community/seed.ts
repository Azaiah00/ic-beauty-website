/**
 * DEMO SEED DATA for The H.A.I.R. Circle Community.
 *
 * Every member below except Iisha is FICTIONAL, and every post is sample copy so the team can practice.
 * Dates are relative to the moment the demo is created (or reset), so "joined today" stays true.
 * Reset any time from the owner dashboard → Community → Settings → Reset demo data.
 */
import { business, METHOD_DEFINITION } from "@/lib/site";
import { funnel } from "@/lib/funnel";
import { EDUCATION_NOTE, defaultSettings, firstName } from "./config";
import type { AuditEntry, Comment, CommunityEvent, Course, Lesson, Member, Message, Notification, PlanKey, Post, Progress, Purchase } from "./types";

export function buildSeed(now: Date) {
  const ago = (days: number, hours = 0) => new Date(+now - days * 864e5 - hours * 36e5).toISOString();
  const ahead = (days: number) => new Date(+now + days * 864e5).toISOString();
  /** A date `days` from now at a fixed UTC hour (24 = 7 pm Eastern in winter). */
  const at = (days: number, utcHour: number) => {
    const d = new Date(+now + days * 864e5);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), utcHour)).toISOString();
  };
  const nextWeekday = (weekday: number) => ((weekday - now.getUTCDay() + 7) % 7) || 7;

  // ───────────────────────────── People ─────────────────────────────
  const m = (id: string, name: string, plan: PlanKey, points: number, joinedDays: number, extra: Partial<Member> = {}): Member => ({
    id, name, email: `${id}@example.com`, role: "member", plan, state: "active", points,
    joinedAt: ago(joinedDays), lastSeenAt: ago(0, 3), showPlan: true, badges: [], grantedCourses: [],
    planHistory: [{ at: ago(joinedDays), plan, by: "Joined" }], checklist: { intro: true, watch: true, goal: true, download: true },
    ...extra,
  });

  const members: Member[] = [
    m("iisha", business.owner.name, "inner", 0, 60, { role: "owner", email: business.email, photo: "/images/iisha-portrait.jpg", city: "Henrico, VA", bio: `${business.owner.title}. Creator of The H.A.I.R. Wellness Method.`, lastSeenAt: ago(0, 0.1) }),
    m("team-admin", "Team Admin (Iisha's daughter)", "inner", 0, 58, { role: "admin", nameNeeds: "Daughter's name", city: "Henrico, VA" }),
    m("azaiah", "Azaiah (Couture House)", "inner", 0, 58, { role: "admin", bio: "Couture House Co. Here to help with anything technical." }),
    m("fred", "Fred (Couture House)", "inner", 0, 58, { role: "admin", bio: "Couture House Co." }),

    m("tasha", "Tasha Jones", "circle", 34, 35, { city: "Richmond, VA", isClient: true, billing: "monthly", periodEndsAt: ahead(12), curriculumStart: ago(16), lastSeenAt: ago(0, 0.2), bio: "Natural for six years. Learning to listen before I fix.", hairGoal: "Stop the breakage at my temples.", answers: { goal: "Stop the breakage at my temples.", found: "I'm a client", client: "Yes" } }),
    m("monique", "Monique Harris", "inner", 190, 50, { city: "Baltimore, MD", billing: "annual", periodEndsAt: ahead(200), curriculumStart: ago(50), badges: ["spotlight"], lastSeenAt: ago(0, 0.3), bio: "Relaxed hair, low-tension styles, big water drinker now.", hairGoal: "A calm scalp all winter." }),
    m("kendra", "Kendra Lewis", "free", 9, 12, { city: "Washington, DC", lastSeenAt: ago(0, 5), bio: "Found Iisha on TikTok and stayed for the honesty.", hairGoal: "Understand my shedding." }),
    m("aaliyah", "Aaliyah Brooks", "free", 0, 0, { state: "pending", city: "Norfolk, VA", checklist: {}, lastSeenAt: ago(0, 1), answers: { goal: "Grow out my edges after years of tight ponytails.", found: "Instagram", client: "Not yet" } }),
    m("denise", "Denise Carter", "free", 0, 0, { state: "pending", city: "Durham, NC", checklist: {}, lastSeenAt: ago(0, 6), joinedAt: ago(0, 6), answers: { goal: "Find a wash day routine I can keep.", found: "TikTok", client: "Not yet" } }),
    m("renee", "Renee Washington", "circle", 12, 9, { city: "Alexandria, VA", billing: "monthly", trialEndsAt: ahead(5), periodEndsAt: ahead(5), curriculumStart: ago(9), lastSeenAt: ago(0, 8), hairGoal: "Less shedding on wash day." }),
    m("brianna", "Brianna Scott", "circle", 70, 44, { state: "past_due", city: "Charlotte, NC", billing: "monthly", pastDueSince: ago(2), periodEndsAt: ago(2), curriculumStart: ago(44), lastSeenAt: ago(1), hairGoal: "Healthier braid breaks." }),
    m("gloria", "Gloria Mitchell", "inner", 540, 58, { city: "Silver Spring, MD", billing: "annual", periodEndsAt: ahead(250), curriculumStart: ago(58), badges: ["founding"], lastSeenAt: ago(0, 2), bio: "Sixty-one and still learning my hair. Founding member.", hairGoal: "Keep what I have strong." }),
    m("jasmine", "Jasmine Reed", "free", 2, 40, { city: "Raleigh, NC", lastSeenAt: ago(21), checklist: { intro: true } }),
    m("patrice", "Patrice Coleman", "circle", 25, 38, { state: "paused", city: "Hampton, VA", billing: "monthly", curriculumStart: ago(38), lastSeenAt: ago(6), teamNotes: "Asked to pause while she travels. Turn back on when she messages." }),
    m("simone", "Simone Ellis", "circle", 40, 47, { state: "canceled", city: "Greensboro, NC", billing: "monthly", periodEndsAt: ahead(11), curriculumStart: ago(47), lastSeenAt: ago(3), exitSurvey: { at: ago(4), joined: "To learn a routine", leaving: "Budget this season", kept: "A lower-cost option" } }),
    m("crystal", "Crystal Barnes", "free", 1, 5, { state: "removed", city: "Unknown", lastSeenAt: ago(4), teamNotes: "Removed for spam (selling in the feed)." }),
    m("yvonne", "Yvonne Turner", "inner", 88, 30, { city: "Chesapeake, VA", billing: "monthly", periodEndsAt: ahead(1), curriculumStart: ago(30), lastSeenAt: ago(0, 9), hairGoal: "Calm my scalp flares." }),
    m("nia", "Nia Robinson", "free", 22, 26, { city: "Richmond, VA", lastSeenAt: ago(0, 4), bio: "Mom of two. Wash day used to take my whole Sunday.", hairGoal: "A two-hour wash day." }),
    m("lauren", "Lauren Price", "circle", 15, 20, { city: "Arlington, VA", showPlan: false, billing: "monthly", periodEndsAt: ahead(10), curriculumStart: ago(20), lastSeenAt: ago(1, 2) }),
    m("angela", "Angela Foster", "free", 3, 18, { city: "Columbia, MD", grantedCourses: ["radiance-rewired"], lastSeenAt: ago(16) }),
  ];
  const name = (id: string) => members.find((x) => x.id === id)!.name;

  // ───────────────────────────── Posts (all DEMO COPY) ─────────────────────────────
  const p = (id: string, authorId: string, categoryId: string, daysAgo: number, title: string, body: string, extra: Partial<Post> = {}): Post => ({
    id, authorId, categoryId, title, body, images: [], likes: [], reports: [],
    createdAt: ago(daysAgo), updatedAt: ago(daysAgo), lastActivityAt: ago(Math.max(0, daysAgo - 0.5)), ...extra,
  });
  const L = (...ids: string[]) => ids;
  const mondayAgo = (now.getUTCDay() + 6) % 7;
  const wednesdayAgo = (now.getUTCDay() + 4) % 7;
  const fridayAgo = (now.getUTCDay() + 2) % 7;

  const posts: Post[] = [
    // DEMO COPY — replace with Iisha's real posts
    p("welcome", "iisha", "start-here", 58, "Welcome to the Circle. Read this first.", "I'm so glad you're here. This is a place to learn your hair, ask honest questions and cheer each other on.\n\n**A few house rules:**\n- Be kind. We lift each other up here.\n- Share your own experience. No selling.\n- This is education and encouragement, not medical advice.\n- What's shared in the Circle stays in the Circle.\n\nHealthy awareness is rare. You just chose it.", { pinned: true, likes: L("tasha", "monique", "gloria", "kendra", "nia", "yvonne", "lauren", "renee") }),
    // DEMO COPY — replace with Iisha's real posts
    p("start-here", "iisha", "start-here", 57, "Start Here: introduce yourself", "New? Tap **Write a post**, choose *Start Here*, and tell us:\n- Your name and where you're joining from\n- Where your hair is right now\n- Your biggest hair goal\n\nThen open the Classroom and watch *Welcome to the Circle*. That's your first win.", { pinned: true, likes: L("tasha", "gloria", "nia", "angela", "kendra") }),
    // DEMO COPY — replace with Iisha's real posts
    p("monday-drop", "iisha", "announcements", mondayAgo + 0.3, "This week's lesson is live", "A new lesson just opened in the Classroom. Watch it, do the action step, then come back and tell us **one thing** you're taking with you.", { ritual: "monday-drop", likes: L("tasha", "monique", "renee", "lauren") }),
    // DEMO COPY — replace with Iisha's real posts
    p("monthly-theme", "iisha", "announcements", now.getUTCDate() - 1 + 0.4, "This month's theme: listen before you fix", "Before we buy another product this month, we're slowing down and paying attention. What is your hair showing you? Pick one small habit and share it below so we can cheer you on.", { ritual: "monthly-theme", likes: L("gloria", "monique", "yvonne", "tasha", "nia") }),
    // DEMO COPY — replace with Iisha's real posts
    p("episode-1", "iisha", "general", 6, "Episode 1: Whose belief are you borrowing?", "In Episode 1 I asked a question that stopped a lot of you: *whose belief about your hair are you borrowing?* Grandma's, a stylist's, a magazine's?\n\nTell me one thing you were told about your hair growing up that you're ready to question.", { likes: L("tasha", "monique", "gloria", "kendra", "nia", "jasmine", "renee", "yvonne", "lauren"), video: "" }),
    // DEMO COPY — replace with Iisha's real posts
    p("live-topic-poll", "iisha", "general", 3, "What should our next Community Live cover?", "Vote below and I'll build the next Live around the winner.", { poll: { options: [{ id: "a", text: "Shedding vs. breakage", votes: L("kendra", "renee", "tasha", "nia") }, { id: "b", text: "Building a wash day rhythm", votes: L("jasmine", "lauren", "angela") }, { id: "c", text: "Low-tension protective styles", votes: L("brianna", "monique", "gloria", "yvonne", "simone") }, { id: "d", text: "Food and your scalp", votes: L("gloria") }] }, likes: L("kendra", "nia", "monique") }),
    // DEMO COPY — replace with Iisha's real posts
    p("wash-day-wednesday", "iisha", "wash-day", wednesdayAgo + 0.4, "Wash Day Wednesday check-in", "How did wash day go this week? Tell us what you did, what felt lighter, and what you'd change next time.", { ritual: "wash-day-wednesday", likes: L("nia", "tasha", "lauren") }),
    // DEMO COPY — replace with Iisha's real posts
    p("friday-wins", "iisha", "wins", fridayAgo + 0.4, "Friday Wins: what went right this week?", "Big or small, it counts. Drank your water, kept your satin on, said something kind about your hair. Share your win below.", { ritual: "friday-wins", likes: L("monique", "gloria", "tasha", "nia", "kendra") }),

    p("monique-spotlight", "monique", "wins", 4, "Three months of low-tension styles", "I used to think a style wasn't \"done\" unless it was tight. Three months of looser installs and resting between them, and my scalp is calm for the first time in years. No product did that. A habit did.", { spotlightUntil: ahead(5), images: ["/images/client-portrait.jpg"], likes: L("iisha", "gloria", "tasha", "nia", "kendra", "yvonne", "lauren", "renee", "brianna") }),
    p("tasha-shedding-count", "tasha", "wins", 2, "I finally counted my shedding on wash day", "Lesson 2 said to actually count instead of panicking. It looked like so much in the comb, but it was about a week's worth of normal shedding in one go. I breathed for the first time in months.", { likes: L("iisha", "monique", "kendra", "renee", "nia", "gloria") }),
    p("simone-edges", "simone", "wins", 9, "One edge habit swapped", "I stopped brushing my edges down every single morning. That's it. That's the win.", { likes: L("gloria", "tasha", "monique") }),
    p("nia-wash-day", "nia", "wash-day", 5, "My wash day went from four hours to two", "The Wash Day Blueprint finally got me to plan it instead of winging it. Cleanse first, fewer products, and I section before I start. Sunday is mine again.", { images: ["/images/funnel-routine.jpg"], likes: L("iisha", "tasha", "kendra", "lauren", "jasmine", "monique") }),
    p("kendra-cleanse-poll", "kendra", "wash-day", 8, "How often is everyone cleansing?", "I've been stretching to three weeks and I think my scalp is telling me that's too long. Curious what works for you all.", { poll: { options: [{ id: "a", text: "Every 7 to 10 days", votes: L("tasha", "nia", "monique", "gloria", "lauren") }, { id: "b", text: "Every 2 weeks", votes: L("renee", "yvonne", "brianna") }, { id: "c", text: "Every 3 weeks or longer", votes: L("jasmine") }] }, likes: L("tasha", "nia", "renee") }),
    p("kendra-intro", "kendra", "start-here", 12, "Hi, I'm Kendra from DC", "Found Iisha on TikTok at 1 am and here I am. My hair right now: shoulder length, natural, shedding more than I'd like. My goal is to understand what's normal before I spend another dollar on products.", { likes: L("iisha", "tasha", "gloria") }),
    p("angela-intro", "angela", "start-here", 17, "Hello from Maryland", "I'm Angela. Relaxed hair, busy schedule, and I just picked up Radiance Rewired. Looking forward to learning with you all.", { likes: L("iisha", "gloria") }),
    p("jasmine-satin", "jasmine", "general", 22, "Satin bonnet or satin pillowcase?", "Mine slides off by 2 am every night. What's everyone using?", { likes: L("nia", "kendra") }),

    p("ask-white-bulb", "tasha", "ask-iisha", 7, "Tiny white bulb at the end of the strand?", "Some of the hairs in my comb have a little white dot at one end. Is that the root? Should I be worried?", { likes: L("kendra", "renee", "nia", "lauren") }),
    p("ask-shed-or-break", "renee", "ask-iisha", 3, "Shedding or breakage: how do I tell on my own?", "I see short pieces on my bathroom sink and long ones in the shower. I'm in week 2 and still not sure which is which.", { likes: L("kendra", "tasha") }),
    p("ask-oil-before", "lauren", "ask-iisha", 2, "Is it okay to oil my scalp before I cleanse?", "My mother always greased my scalp first. The lesson says clean scalp first. Can I still do a pre-wash oil?", { likes: L("nia") }),
    p("ask-braid-rest", "brianna", "ask-iisha", 4, "How long should I rest between braid installs?", "I usually go right from one set into the next. How much of a break does my scalp need?", { likes: L("monique", "simone", "yvonne") }),

    p("gloria-salmon-bowl", "gloria", "scalp-wellness", 6, "Scalp-Calm Kitchen: I made the salmon bowl", "Made the bowl from The Scalp-Calm Kitchen twice this week. Easy, filling, and my grocery list finally has some color on it. Anyone else cooking from the guide?", { images: ["/images/lm-food-cover.jpg"], likes: L("iisha", "yvonne", "monique", "tasha") }),
    p("yvonne-flare-journal", "yvonne", "scalp-wellness", 3, "Flare journal, day 9", "Nine days of writing down what I eat, how I sleep and how my scalp feels. I'm starting to see my own patterns. I'm taking the journal to my dermatologist next month.", { likes: L("iisha", "gloria", "monique") }),

    p("lounge-coaching-notes", "monique", "inner-lounge", 5, "My notes from this month's coaching call", "Three things I wrote down: rotate where the tension sits, protein at every meal, and stop apologizing for my hair. Anyone want to be accountability partners until the next call?", { likes: L("gloria", "yvonne", "iisha") }),
    p("lounge-review-booked", "gloria", "inner-lounge", 2, "Booked my quarterly 1:1 review", "Booked mine for next week. I'm bringing my baseline photos and my list of questions.", { likes: L("monique", "iisha") }),

    p("spam-crystal", "crystal", "general", 4, "DM me for a product that fixes everything", "Message me. I have something that works for everybody. Limited stock.", { reports: [{ by: "tasha", reason: "Selling in the feed", at: ago(4) }, { by: "gloria", reason: "Spam", at: ago(3.8) }] }),
  ];

  const c = (id: string, postId: string, authorId: string, daysAgo: number, body: string, extra: Partial<Comment> = {}): Comment => ({ id, postId, authorId, body, likes: [], createdAt: ago(daysAgo), ...extra });
  const comments: Comment[] = [
    // DEMO COPY — replace with Iisha's real replies
    c("c01", "ask-white-bulb", "iisha", 6.8, "Great eye, Tasha. That little white bulb usually means the hair completed its cycle and shed on its own, which is a normal part of how hair grows. A strand that snapped along the length won't have one. Keep noticing, and bring it to our next check-in.", { likes: L("tasha", "kendra", "renee", "nia", "monique") }),
    c("c02", "ask-white-bulb", "tasha", 6.7, "Thank you! That makes me feel so much better.", { parentId: "c01", likes: L("iisha") }),
    c("c03", "ask-white-bulb", "kendra", 6.5, "I didn't know this either. Reading every answer in here.", { likes: L("tasha") }),
    c("c04", "episode-1", "gloria", 5.8, "\"Good hair\" was a whole phrase in my house. I'm sixty-one and just now putting it down.", { likes: L("iisha", "monique", "tasha", "nia", "kendra", "yvonne") }),
    c("c05", "episode-1", "kendra", 5.6, "That trimming makes it grow faster. I believed it for twenty years.", { likes: L("gloria", "nia", "tasha") }),
    c("c06", "episode-1", "iisha", 5.5, "Gloria, thank you for saying that out loud. That's the work.", { parentId: "c04", likes: L("gloria", "monique") }),
    c("c07", "episode-1", "tasha", 5.2, "That my hair \"just doesn't grow.\" It does. I was breaking it in the same spots.", { likes: L("iisha", "monique", "gloria") }),
    c("c08", "monique-spotlight", "iisha", 3.8, "This is what consistency looks like. So proud of you, Monique.", { likes: L("monique", "gloria", "tasha") }),
    c("c09", "monique-spotlight", "nia", 3.5, "\"A habit did.\" Writing that on my mirror.", { likes: L("monique", "kendra") }),
    c("c10", "tasha-shedding-count", "kendra", 1.8, "Okay, I'm counting this Sunday. You've convinced me.", { likes: L("tasha", "renee") }),
    c("c11", "tasha-shedding-count", "iisha", 1.6, "Awareness over panic. That's the whole method in one wash day.", { likes: L("tasha", "monique", "kendra") }),
    c("c12", "nia-wash-day", "kendra", 4.6, "Two hours? Teach me. Which part saved the most time?", { likes: L("nia") }),
    c("c13", "nia-wash-day", "nia", 4.5, "Sectioning before I start, and not using five products. @Kendra Lewis the Blueprint unlocks at Level 3, you're close!", { parentId: "c12", likes: L("kendra", "tasha") }),
    c("c14", "kendra-cleanse-poll", "monique", 7.5, "Every week for me now. My scalp is skin, so I care for it like skin.", { likes: L("kendra", "gloria") }),
    c("c15", "kendra-intro", "iisha", 11.8, "Welcome, Kendra. Understanding first, products second. You're in the right place.", { likes: L("kendra") }),
    c("c16", "kendra-intro", "tasha", 11.5, "Welcome! The Red Flags self-check in the Classroom is a great first step.", { likes: L("kendra") }),
    c("c17", "wash-day-wednesday", "nia", Math.max(0.1, wednesdayAgo), "Cleansed, conditioned, done in under two hours again.", { likes: L("iisha", "tasha") }),
    c("c18", "friday-wins", "kendra", Math.max(0.1, fridayAgo), "Wore my bonnet five nights in a row.", { likes: L("iisha", "gloria", "nia") }),
    c("c19", "friday-wins", "gloria", Math.max(0.1, fridayAgo - 0.1), "Said no to a style that would have hurt.", { likes: L("iisha", "monique", "tasha", "kendra") }),
    c("c20", "gloria-salmon-bowl", "yvonne", 5.5, "Making it tonight. The grocery list in the back is my favorite page.", { likes: L("gloria") }),
    c("c21", "jasmine-satin", "nia", 21.5, "Pillowcase as a backup. The bonnet always escapes.", { likes: L("jasmine", "kendra") }),
    c("c22", "ask-braid-rest", "monique", 3.6, "Following. I used to go back to back too.", { likes: L("brianna") }),
    c("c23", "lounge-coaching-notes", "gloria", 4.5, "I'm in. Let's check in every Sunday.", { likes: L("monique") }),
    c("c24", "monday-drop", "tasha", Math.max(0.1, mondayAgo), "Watching tonight after the kids are down.", { likes: L("iisha") }),
  ];
  for (const post of posts) {
    const last = comments.filter((x) => x.postId === post.id).map((x) => x.createdAt).sort().pop();
    if (last && last > post.lastActivityAt) post.lastActivityAt = last;
  }

  // ───────────────────────────── Classroom ─────────────────────────────
  const lesson = (id: string, title: string, summary: string, extra: Partial<Lesson> = {}): Lesson => ({ id, title, summary, takeaways: [], action: "", reflection: "", downloads: [], ...extra });
  const courses: Course[] = [
    {
      id: "start-here", title: "Start Here: Welcome to the Circle", promise: "Four short lessons to find your way around and get your first win.", cover: "funnel-community", access: { kind: "open" }, published: true, order: 1, discussIn: "start-here",
      modules: [{
        id: "welcome", title: "Your first week",
        // DEMO COPY — replace with Iisha's real lessons and videos
        lessons: [
          lesson("welcome", "Welcome to the Circle", "A hello from Iisha, what this community is for, and how to get the most from your first week.", { minutes: 4, poster: "iisha-portrait", takeaways: ["This is a place to learn, not to be perfect", "One small win in your first 48 hours", "Ask questions out loud. Someone else needs the answer too"], action: "Introduce yourself in Start Here.", reflection: "What made you join today?" }),
          lesson("how-it-works", "How the community works", "The feed, the Classroom, the Calendar, and how points and levels open new things for you.", { minutes: 5, poster: "classroom", takeaways: ["Every like you receive is a point", "Levels unlock extras, like the Wash Day Blueprint at Level 3", "Lives and rituals happen on the same days each week"], action: "Like or comment on one post that speaks to you.", reflection: "Which part of the community are you most curious about?" }),
          lesson("the-method", "Meet The H.A.I.R. Wellness Method", METHOD_DEFINITION, { minutes: 6, poster: "consultation", takeaways: ["H: History", "A: Analysis", "I: Inside-out plan", "R: Restore & retain"], action: "Write down one thing from your hair history that still shapes your routine.", reflection: "Which of the four phases do you need most right now?", link: { label: "Read more about the method", href: "/the-hair-method" } }),
          lesson("first-win", "Your first win", "Set your hair goal and take the free self-check so you know your starting line.", { minutes: 3, poster: "lm-checklist-cover", takeaways: ["A goal you can say in one sentence", "Your baseline is a starting line, not a grade", "Come back and share it"], action: "Set your hair goal in your profile.", reflection: "What would feel like progress 30 days from now?", downloads: [{ title: funnel.leadMagnet.title, file: funnel.leadMagnet.file }] }),
        ],
      }],
    },
    {
      id: "red-flags", title: "Hair Health Red Flags Self-Check", promise: funnel.leadMagnet.subtitle, cover: "lm-checklist-cover", access: { kind: "open" }, published: true, order: 2, discussIn: "scalp-wellness",
      modules: [{ id: "self-check", title: "The self-check", lessons: [
        lesson("self-check", "Take the self-check", `Set aside five quiet minutes and go through the ${funnel.leadMagnet.items}-point checklist honestly. Tally your score, then share what surprised you. ${EDUCATION_NOTE}`, { minutes: 5, poster: "lm-checklist-cover", takeaways: ["Your hair has been talking", "A score is information, not a judgment", "Some signs are a reason to see a dermatologist"], action: "Download the checklist and tally your score.", reflection: "Which sign has your hair been showing you the longest?", downloads: [{ title: funnel.leadMagnet.title, file: funnel.leadMagnet.file }] }),
      ] }],
    },
    {
      id: "scalp-calm-kitchen", title: funnel.bonus.title, promise: "Six food groups, a build-a-plate guide, three recipes, a grocery list and a 14-day flare journal.", cover: "lm-food-cover", access: { kind: "open" }, published: true, order: 3, discussIn: "scalp-wellness",
      modules: [{ id: "guide", title: "The guide", lessons: [
        lesson("the-guide", "Cook from the guide", `Download the ${funnel.bonus.pages}-page food guide and start with one recipe this week. ${EDUCATION_NOTE}`, { minutes: 6, poster: "lm-food-cover", takeaways: ["Protein at every meal", "Color on your plate", "Notice patterns before cutting food groups"], action: "Start the 14-day flare journal.", reflection: "How does your scalp feel on your most stressful, least-nourished days?", downloads: [{ title: funnel.bonus.title, file: funnel.bonus.file }] }),
      ] }],
    },
    {
      id: "masterclass-replay", title: "H.A.I.R. Shift Masterclass Replay", promise: "Think Differently. Care Differently. The replay posts here after the live class.", cover: "classroom", access: { kind: "open" }, published: true, order: 4, discussIn: "general",
      modules: [{ id: "replay", title: "The replay", lessons: [
        lesson("replay", "Replay posts after the live class", "The H.A.I.R. Shift Masterclass is a free live class with Iisha. The replay will appear on this page afterward. Until then, save your seat.", { poster: "classroom", link: { label: "Details & registration", href: "/masterclass" } }),
      ] }],
    },
    {
      id: "wash-day-blueprint", title: "Wash Day Blueprint", promise: "Plan a wash day that fits your scalp and your schedule.", cover: "funnel-routine", access: { kind: "level", level: 3, orPlans: ["circle", "inner"] }, published: true, order: 5, discussIn: "wash-day",
      modules: [{ id: "blueprint", title: "The blueprint", lessons: [
        // DEMO COPY — built from Lesson 3, "Wash Day, Reimagined". Replace with Iisha's videos.
        lesson("cleanse-first", "Clean scalp first", "Cleanse before you oil, condition with intention, and build a rhythm that works for you.", { minutes: 6, poster: "funnel-routine", takeaways: ["Clean scalp first, then oils and stylers", "Fewer products, used on purpose", "Your scalp is skin, so treat it like skin"], action: "Write down every product you used on your last wash day.", reflection: "What makes wash day feel heavy for you?" }),
        lesson("your-rhythm", "Find your rhythm", "Rhythm beats perfection. Pick a cadence you will actually keep.", { minutes: 5, poster: "scalp-ritual", takeaways: ["Rhythm beats perfection", "Plan the day before, not the day of", "Section before you start"], action: "Choose your wash day and put it on your calendar.", reflection: "What would make wash day lighter?" }),
        lesson("plan-it", "Plan your next two wash days", "Use the Wash Day Blueprint worksheet to plan your next two wash days, step by step.", { minutes: 4, poster: "product-shelf", takeaways: ["Two planned wash days", "A short product list", "A routine you can repeat"], action: "Fill in the Wash Day Blueprint.", reflection: "What will you stop doing on wash day?", downloads: [{ title: "Wash Day Blueprint", file: "/downloads/wash-day-blueprint.pdf" }] }),
      ] }],
    },
    { id: "circle-curriculum", title: "The H.A.I.R. Circle Curriculum", promise: "Twelve weeks of the H.A.I.R. Wellness Method, one lesson every Monday.", cover: "portal-preview", access: { kind: "drip", plans: ["circle", "inner"], everyDays: 7 }, published: true, order: 6, source: "portal-lessons", modules: [], discussIn: "general" },
    {
      id: "radiance-rewired", title: funnel.tripwire.name, promise: funnel.tripwire.tagline, cover: "lm-food-cover", access: { kind: "buy", priceKey: "radiance-rewired", includedIn: ["inner"] }, published: true, order: 7, discussIn: "scalp-wellness",
      modules: [{ id: "guide", title: "The guide", lessons: [
        // DEMO COPY — lesson content comes from Iisha's guide
        lesson("start", "Start here", `${funnel.tripwire.name}: ${funnel.tripwire.tagline} How to use this guide alongside your routine. ${EDUCATION_NOTE}`, { poster: "lm-food-cover", link: { label: "About this guide", href: funnel.tripwire.href } }),
      ] }],
    },
    // Iisha's next paid program: she names it, prices it and publishes it from the dashboard. Nothing invented here.
    { id: "next-program", title: "Next program", titleNeeds: "Program name", promise: "", cover: "studio", access: { kind: "buy", priceKey: "next-program" }, published: false, order: 8, modules: [{ id: "module-1", title: "Module 1", lessons: [] }] },
    { id: "love-story", title: funnel.pilot.name, promise: `${funnel.pilot.format}. ${funnel.pilot.when}.`, cover: "funnel-hero-woman", access: { kind: "open" }, published: true, order: 9, source: "pilot-weeks", modules: [], apply: { label: "Applications open", href: "/hair-love/30-days" } },
    {
      id: "inner-vault", title: "Inner Circle Coaching Vault", promise: "Every small-group coaching call, ready to rewatch.", cover: "consultation", access: { kind: "plan", plans: ["inner"] }, published: true, order: 10, discussIn: "inner-lounge",
      modules: [{ id: "replays", title: "Coaching replays", lessons: [
        // DEMO COPY — sample replays. Real recordings come from Iisha.
        lesson("replay-1", "Coaching replay (sample): rotating tension", "Sample replay. The recording appears here after each coaching call.", { minutes: 58, poster: "consultation" }),
        lesson("replay-2", "Coaching replay (sample): reading your scalp", "Sample replay. The recording appears here after each coaching call.", { minutes: 61, poster: "scalp-closeup" }),
        lesson("replay-3", "Coaching replay (sample): winter routines", "Sample replay. The recording appears here after each coaching call.", { minutes: 55, poster: "studio" }),
      ] }],
    },
  ];

  // ───────────────────────────── Progress + points ─────────────────────────────
  const done = (keys: string[], days: number) => Object.fromEntries(keys.map((k, i) => [k, { doneAt: ago(days - i) }]));
  const startHere = ["start-here/welcome", "start-here/how-it-works", "start-here/the-method", "start-here/first-win"];
  const lessonsDone: Record<string, Progress["lessons"]> = {
    tasha: { ...done(startHere, 34), ...done(["red-flags/self-check"], 30), "circle-curriculum/week-1": { doneAt: ago(14), note: "That my hair 'just doesn't grow.' It does. I was breaking it at the same spots." }, "circle-curriculum/week-2": { doneAt: ago(8) } },
    monique: { ...done(startHere, 49), ...done(Array.from({ length: 7 }, (_, i) => `circle-curriculum/week-${i + 1}`), 45), ...done(["inner-vault/replay-1", "wash-day-blueprint/cleanse-first", "wash-day-blueprint/your-rhythm", "wash-day-blueprint/plan-it"], 20) },
    gloria: { ...done(startHere, 57), ...done(Array.from({ length: 8 }, (_, i) => `circle-curriculum/week-${i + 1}`), 52), ...done(["inner-vault/replay-1", "inner-vault/replay-2", "scalp-calm-kitchen/the-guide"], 12) },
    kendra: done(["start-here/welcome", "start-here/how-it-works", "red-flags/self-check"], 11),
    nia: { ...done(startHere, 25), ...done(["wash-day-blueprint/cleanse-first", "wash-day-blueprint/your-rhythm"], 6) },
    renee: { ...done(["start-here/welcome"], 9), "circle-curriculum/week-1": { doneAt: ago(6) } },
    brianna: { ...done(startHere, 43), ...done(Array.from({ length: 5 }, (_, i) => `circle-curriculum/week-${i + 1}`), 40) },
    yvonne: { ...done(startHere, 29), ...done(["circle-curriculum/week-1", "circle-curriculum/week-2", "circle-curriculum/week-3", "scalp-calm-kitchen/the-guide"], 25) },
    lauren: { ...done(["start-here/welcome", "start-here/how-it-works"], 19), "circle-curriculum/week-1": { doneAt: ago(15) }, "circle-curriculum/week-2": { doneAt: ago(9) } },
    simone: { ...done(startHere, 46), ...done(["circle-curriculum/week-1", "circle-curriculum/week-2", "circle-curriculum/week-3", "circle-curriculum/week-4"], 40) },
    patrice: done(["start-here/welcome", "circle-curriculum/week-1", "circle-curriculum/week-2"], 30),
    angela: done(["start-here/welcome"], 17),
    jasmine: done(["start-here/welcome"], 39),
  };
  // Points are spread over time so the 7-day, 30-day and all-time leaderboards each tell a different story.
  const recent: Record<string, [number, number]> = { tasha: [9, 22], monique: [14, 60], kendra: [5, 9], gloria: [11, 70], nia: [8, 20], renee: [6, 12], yvonne: [7, 40], lauren: [3, 12], brianna: [2, 18], simone: [0, 6], angela: [0, 3], jasmine: [0, 0] };
  const progress: Progress[] = members.filter((x) => x.role === "member").map((x) => {
    const [week, month] = recent[x.id] ?? [0, 0];
    const older = Math.max(0, x.points - month);
    const pointLog = [
      ...(older ? [{ at: ago(40), n: older, why: "Earlier activity" }] : []),
      ...(month - week > 0 ? [{ at: ago(15), n: month - week, why: "Likes on posts and comments" }] : []),
      ...(week ? [{ at: ago(2), n: week, why: "Likes on posts and comments" }] : []),
    ];
    return { memberId: x.id, lessons: lessonsDone[x.id] ?? {}, labs: (x.id === "monique" ? { "growth-cycle": { doneAt: ago(10), score: 3 } } : {}) as Progress["labs"], checkins: [], pointLog };
  });

  // ───────────────────────────── Calendar (sample dates) ─────────────────────────────
  const events: CommunityEvent[] = [
    { id: "community-live", title: "Community Live with Iisha", host: business.owner.name, start: at(9, 24), minutes: 45, repeat: "monthly", plans: ["free", "circle", "inner"], description: "Our monthly open Live for every member. Bring your questions and your wins.", zoom: "https://zoom.us/j/sample-community-live", sample: true },
    { id: "live-qa", title: "Live Q&A with Iisha", host: business.owner.name, start: at(16, 24), minutes: 60, repeat: "monthly", plans: ["circle", "inner"], description: "Circle members ask, Iisha answers live. The replay is added to the Classroom afterward.", zoom: "https://zoom.us/j/sample-live-qa", sample: true },
    { id: "inner-coaching", title: "Inner Circle Coaching Call", host: business.owner.name, start: at(23, 24), minutes: 60, repeat: "monthly", plans: ["inner"], description: "A small-group coaching call for Inner Circle members. Cameras on if you can.", zoom: "https://zoom.us/j/sample-inner-coaching", replay: "/community/classroom/inner-vault", sample: true },
    { id: "wash-day-wednesday", title: "Wash Day Wednesday", host: "The whole Circle", start: at(nextWeekday(3), 17), minutes: 0, repeat: "weekly", plans: ["free", "circle", "inner"], description: "Not a call. A check-in thread in the feed, every Wednesday. Share how wash day went.", async: true, link: { label: "Open the thread", href: "/community?category=wash-day" }, sample: true },
    { id: "masterclass", title: "H.A.I.R. Shift Masterclass", host: business.owner.name, start: "", minutes: 0, plans: ["free", "circle", "inner"], description: "Think Differently. Care Differently. A free live class with Iisha.", link: { label: "Details & registration", href: "/masterclass" } },
  ];

  // ───────────────────────────── Notifications, messages, purchases, activity ─────────────────────────────
  let seq = 0;
  const n = (memberId: string, kind: Notification["kind"], daysAgo: number, text: string, href: string, read = false, actors?: string[]): Notification => ({ id: `n${String(++seq).padStart(3, "0")}`, memberId, kind, text, href, at: ago(daysAgo), read, actors });
  const team = ["iisha", "team-admin", "azaiah", "fred"];
  const notifications: Notification[] = [
    n("tasha", "reply", 6.8, "Iisha answered your question: “Tiny white bulb at the end of the strand?”", "/community/post/ask-white-bulb", true, ["iisha"]),
    n("tasha", "like", 1.5, "Iisha, Monique and 4 others liked “I finally counted my shedding on wash day”", "/community/post/tasha-shedding-count", false, ["iisha", "monique", "kendra", "renee", "nia", "gloria"]),
    n("tasha", "lesson", mondayAgo + 0.3, "New lesson unlocked: Week 3: Wash Day, Reimagined", "/community/classroom/circle-curriculum/week-3"),
    n("tasha", "event", 0.1, "Community Live with Iisha is coming up. Add it to your calendar.", "/community/calendar"),
    n("kendra", "mention", 4.5, "Nia mentioned you in a comment", "/community/post/nia-wash-day", false, ["nia"]),
    n("kendra", "like", 5, "Gloria, Nia and Tasha liked your comment", "/community/post/episode-1", true, ["gloria", "nia", "tasha"]),
    n("kendra", "reply", 11.8, "Iisha replied to “Hi, I'm Kendra from DC”", "/community/post/kendra-intro", true, ["iisha"]),
    n("nia", "level", 6, "You reached Level 3, Nourished. The Wash Day Blueprint is unlocked!", "/community/classroom/wash-day-blueprint", true),
    n("nia", "like", 4, "Iisha, Tasha and 4 others liked “My wash day went from four hours to two”", "/community/post/nia-wash-day", false, ["iisha", "tasha", "kendra", "lauren", "jasmine", "monique"]),
    n("monique", "team", 3.9, "Iisha featured your post as this week's Spotlight", "/community/post/monique-spotlight", false, ["iisha"]),
    n("monique", "reply", 4.5, "Gloria replied to “My notes from this month's coaching call”", "/community/post/lounge-coaching-notes", true, ["gloria"]),
    n("renee", "nudge", 4, "How's your first week going? Reply to Iisha.", "/community/messages"),
    n("renee", "lesson", mondayAgo + 0.3, "New lesson unlocked: Week 2: Reading Your Scalp", "/community/classroom/circle-curriculum/week-2"),
    n("brianna", "plan", 2, "Your last payment didn't go through. Your access stays on for 7 days while you update it.", "/community/settings#plan"),
    n("simone", "plan", 4, "Your membership is canceled. You keep Circle access until your period ends.", "/community/settings#plan", true),
    n("gloria", "like", 5, "Iisha, Monique and 4 others liked your comment", "/community/post/episode-1", false, ["iisha", "monique", "tasha", "nia", "kendra", "yvonne"]),
    n("yvonne", "event", 0.2, "Inner Circle Coaching Call is on the calendar.", "/community/calendar"),
    n("lauren", "lesson", mondayAgo + 0.3, "New lesson unlocked: Week 3: Wash Day, Reimagined", "/community/classroom/circle-curriculum/week-3"),
    ...team.flatMap((t) => [
      n(t, "team", 0.05, "Aaliyah Brooks asked to join the community", "/admin?view=community-members&filter=pending"),
      n(t, "team", 0.25, "Denise Carter asked to join the community", "/admin?view=community-members&filter=pending"),
      n(t, "team", 3.8, "A post by Crystal Barnes was reported twice", "/admin?view=community-posts"),
      n(t, "team", 2, "Brianna Scott's payment didn't go through", "/admin?view=community-members&filter=all&q=brianna", true),
    ]),
  ];

  const msg = (threadId: string, fromId: string, daysAgo: number, body: string, readBy: string[]): Message => ({ id: `m${String(++seq).padStart(3, "0")}`, threadId, fromId, body, at: ago(daysAgo), readBy });
  const welcome = (id: string) => defaultSettings(now).welcomeMessage.replace("{first}", firstName(name(id)));
  const messages: Message[] = [
    // DEMO COPY — sample conversations
    msg("team:tasha", "iisha", 34.9, welcome("tasha"), ["iisha", "tasha"]),
    msg("team:tasha", "tasha", 3, "Hi Iisha! Should I bring my baseline photos to my Progress Check-In?", ["tasha", "iisha"]),
    msg("team:tasha", "iisha", 2.8, "Yes, bring them. We'll look at your temples together and set your next 30 days.", ["iisha"]),
    msg("team:monique", "iisha", 49.9, welcome("monique"), ["iisha", "monique"]),
    msg("team:monique", "monique", 6, "I'd love to book my quarterly 1:1 review. What days do you have?", ["monique", "iisha"]),
    msg("team:monique", "team-admin", 5.8, "Hi Monique! I'm sending you Iisha's open times today.", ["team-admin", "monique"]),
    msg("team:renee", "iisha", 8.9, welcome("renee"), ["iisha", "renee"]),
    msg("team:renee", "iisha", 4, "How's your first week going, Renee? Tell me one thing you noticed about your scalp.", ["iisha"]),
    msg("team:kendra", "iisha", 11.9, welcome("kendra"), ["iisha", "kendra"]),
    msg("team:nia", "iisha", 25.9, welcome("nia"), ["iisha", "nia"]),
    msg("team:gloria", "iisha", 57.9, welcome("gloria"), ["iisha", "gloria"]),
    msg("team:gloria", "gloria", 1, "Thank you for the Lounge. It's my favorite room.", ["gloria"]),
    msg("team:brianna", "team-admin", 1.9, "Hi Brianna, your last payment didn't go through. No rush, your access stays on this week. Message us if you need help updating it.", ["team-admin"]),
    msg("dm:gloria:monique", "gloria", 4.4, "Sunday check-ins, 6 pm? I'll message you first.", ["gloria", "monique"]),
    msg("dm:gloria:monique", "monique", 4.3, "Perfect. Putting it in my calendar now.", ["monique"]),
  ];

  const purchases: Purchase[] = [
    { id: "pu01", memberId: "angela", kind: "course", ref: "radiance-rewired", label: funnel.tripwire.name, amount: funnel.tripwire.price, at: ago(17), demo: true },
    { id: "pu02", memberId: "yvonne", kind: "course", ref: "love-story", label: `${funnel.pilot.name} (founding seat)`, amount: funnel.pilot.corePrice, at: ago(10), demo: true },
    ...["tasha", "monique", "gloria", "brianna", "lauren", "yvonne", "simone", "patrice"].map((id, i): Purchase => {
      const x = members.find((y) => y.id === id)!;
      return { id: `pu1${i}`, memberId: id, kind: "plan", ref: x.plan, label: defaultSettings(now).plans[x.plan].name, amount: defaultSettings(now).plans[x.plan][x.billing ?? "monthly"], billing: x.billing, at: x.joinedAt, demo: true };
    }),
  ];

  const a = (daysAgo: number, actorId: string, text: string, targetId?: string): AuditEntry => ({ id: `${ago(daysAgo).replace(/[-:.TZ]/g, "").slice(0, 17)}-seed${++seq}`, at: ago(daysAgo), actorId, actorName: firstName(name(actorId)), text, targetId });
  const audit: AuditEntry[] = [
    a(6, "iisha", "Iisha turned access off for Patrice Coleman", "patrice"),
    a(4, "team-admin", "Team Admin removed Crystal Barnes from the community", "crystal"),
    a(3.9, "iisha", "Iisha featured Monique Harris's post as Spotlight", "monique-spotlight"),
    a(1.9, "team-admin", "Team Admin messaged Brianna Scott", "brianna"),
  ];

  const settings = defaultSettings(now);
  // Mark the rituals already posted above so they aren't posted twice this week.
  const dayKey = (d: number) => ago(d).slice(0, 10);
  settings.ritualLog = [`monday-drop:${dayKey(mondayAgo)}`, `wash-day-wednesday:${dayKey(wednesdayAgo)}`, `friday-wins:${dayKey(fridayAgo)}`, `monthly-theme:${ago(0).slice(0, 7)}-01`];

  return { settings, members, posts, comments, courses, progress, events, notifications, messages, purchases, audit };
}

export const PERSONAS = ["aaliyah", "kendra", "nia", "tasha", "renee", "brianna", "patrice", "simone", "monique", "team-admin", "azaiah", "iisha"];
