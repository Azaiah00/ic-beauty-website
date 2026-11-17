/**
 * THE H.A.I.R. CIRCLE COMMUNITY: shared types (safe to import from client and server code).
 * Storage, sign-in and payments sit behind src/lib/server/community/*, so going live is a backend-only change.
 */

export type PlanKey = "free" | "circle" | "inner";
export type Role = "owner" | "admin" | "moderator" | "member";
export type MemberState = "pending" | "active" | "paused" | "past_due" | "canceled" | "removed";
export type Billing = "monthly" | "annual";

export type Member = {
  id: string;
  name: string;
  /** When set, the display name is unconfirmed and renders a <Needs> marker next to it. */
  nameNeeds?: string;
  email: string;
  role: Role;
  plan: PlanKey;
  state: MemberState;
  points: number;
  joinedAt: string;
  lastSeenAt: string;
  city?: string;
  bio?: string;
  hairGoal?: string;
  showPlan: boolean;
  timeZone?: string;
  photo?: string;
  isClient?: boolean;
  badges: string[];
  billing?: Billing;
  trialEndsAt?: string;
  /** Paid access runs until this date (renewal date, or the last day after a cancellation). */
  periodEndsAt?: string;
  pastDueSince?: string;
  /** A comped plan: "Gift Inner Circle until <date>". */
  gift?: { plan: PlanKey; until: string };
  /** Courses the team gave this member for free. */
  grantedCourses: string[];
  /** When the weekly curriculum drip started for this member (the team can move it). */
  curriculumStart?: string;
  answers?: Record<string, string>;
  teamNotes?: string;
  planHistory: { at: string; plan: PlanKey; by: string; note?: string }[];
  checklist: { intro?: boolean; watch?: boolean; goal?: boolean; download?: boolean };
  emailPrefs?: Record<string, boolean>;
  exitSurvey?: { at: string; joined: string; leaving: string; kept: string };
};

export type PostRule = "everyone" | "circle" | "inner" | "team";
export type Category = {
  id: string;
  name: string;
  description: string;
  /** Who can post here. */
  post: PostRule;
  /** Who can see it. Everyone else sees a locked teaser. */
  view: "everyone" | "inner";
  order: number;
  /** Shown at the top of the category (the education-only note). */
  note?: string;
};

export type Poll = { options: { id: string; text: string; votes: string[] }[] };
export type Report = { by: string; reason: string; at: string };

export type Post = {
  id: string;
  authorId: string;
  categoryId: string;
  title: string;
  /** Light formatting only: **bold**, *italic*, "- " lists and [links](https://…). Rendered safely, never as raw HTML. */
  body: string;
  images: string[];
  video?: string;
  poll?: Poll;
  likes: string[];
  pinned?: boolean;
  hidden?: boolean;
  spotlightUntil?: string;
  reports: Report[];
  ritual?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  parentId?: string;
  body: string;
  likes: string[];
  createdAt: string;
  hidden?: boolean;
};

export type CourseAccess =
  | { kind: "open" }
  | { kind: "plan"; plans: PlanKey[] }
  | { kind: "level"; level: number; orPlans?: PlanKey[] }
  | { kind: "buy"; priceKey: string; includedIn?: PlanKey[] }
  | { kind: "drip"; plans: PlanKey[]; everyDays: number }
  | { kind: "private" };

export type Lesson = {
  id: string;
  title: string;
  minutes?: number;
  summary: string;
  takeaways: string[];
  action: string;
  reflection: string;
  /** YouTube / Vimeo link. Empty shows the poster with a "Video coming from Iisha" marker. */
  video?: string;
  /** Key in /public/images. */
  poster?: string;
  downloads: { title: string; file?: string }[];
  link?: { label: string; href: string };
};

export type Module = { id: string; title: string; lessons: Lesson[] };

export type Course = {
  id: string;
  title: string;
  /** When set, the title is unconfirmed and renders a <Needs> marker. */
  titleNeeds?: string;
  promise: string;
  /** Key in /public/images. */
  cover: string;
  access: CourseAccess;
  published: boolean;
  order: number;
  modules: Module[];
  /** Lessons that come from an existing file instead of being stored twice. */
  source?: "portal-lessons" | "pilot-weeks";
  /** The team's edits to individual lessons (by lesson id). */
  overrides?: Record<string, Partial<Lesson>>;
  /** A program that takes applications instead of unlocking in the classroom. */
  apply?: { label: string; href: string };
  /** Where "Discuss this lesson" posts go. */
  discussIn?: string;
};

export type CommunityEvent = {
  id: string;
  title: string;
  host: string;
  /** ISO start. Empty = no date shown (the masterclass card). */
  start: string;
  minutes: number;
  repeat?: "weekly" | "monthly";
  plans: PlanKey[];
  description: string;
  zoom?: string;
  replay?: string;
  /** A thread, not a call. */
  async?: boolean;
  link?: { label: string; href: string };
  sample?: boolean;
};

export type Notification = {
  id: string;
  memberId: string;
  kind: "reply" | "mention" | "like" | "approval" | "plan" | "lesson" | "event" | "level" | "message" | "nudge" | "team";
  text: string;
  href: string;
  at: string;
  read: boolean;
  /** Who did it (for batching: "Tasha and 3 others liked…"). */
  actors?: string[];
  /** Notifications with the same group are merged into one line. */
  group?: string;
};

export type Message = { id: string; threadId: string; fromId: string; body: string; at: string; readBy: string[] };

export type Undo = { coll: "members" | "posts" | "courses" | "events" | "settings" | "comments"; id: string; before: unknown | null };
export type AuditEntry = {
  id: string;
  at: string;
  actorId: string;
  actorName: string;
  /** Plain sentence: "Iisha moved Tasha Jones to Inner Circle". */
  text: string;
  targetId?: string;
  undo?: Undo[];
  undoneAt?: string;
  /** The permission needed to undo this (same as the one needed to do it). */
  needs?: string;
};

export type Purchase = { id: string; memberId: string; kind: "plan" | "course"; ref: string; label: string; amount: string; billing?: Billing; at: string; demo: boolean };

export type Progress = {
  memberId: string;
  /** key = `${courseId}/${lessonId}` */
  lessons: Record<string, { doneAt?: string; note?: string }>;
  labs: Record<string, { doneAt: string; score: number }>;
  checkins: string[];
  /** Every point earned, so the 7-day and 30-day leaderboards can be computed. */
  pointLog: { at: string; n: number; why: string }[];
};

export type PlanConfig = {
  key: PlanKey;
  name: string;
  tagline: string;
  /** Display prices. Empty = not confirmed yet, renders a <Needs> marker. */
  monthly: string;
  annual: string;
  trialDays: number;
  benefits: string[];
  /** 0 = no cap. */
  seatCap?: number;
};

export type Ritual = {
  id: string;
  title: string;
  body: string;
  categoryId: string;
  /** 0 = Sunday … 6 = Saturday. Ignored when monthlyDay is set. */
  weekday?: number;
  monthlyDay?: number;
  enabled: boolean;
};

export type Question = { id: string; label: string; choices?: string[] };

export type Settings = {
  name: string;
  promise: string;
  cover: string;
  questions: Question[];
  guidelines: string;
  welcomeMessage: string;
  autoApprove: { free: boolean; paid: boolean };
  points: { lesson: boolean; checkin: boolean; lab: boolean };
  levelNames: string[];
  rituals: Ritual[];
  ritualLog: string[];
  categories: Category[];
  plans: Record<PlanKey, PlanConfig>;
  /** priceKey → display price. Empty = <Needs>. */
  prices: Record<string, string>;
  digest: boolean;
  lastBroadcastAt?: string;
  seededAt: string;
};

export type Decision = { ok: true } | { ok: false; status: number; message: string };
export type Result = { ok: boolean; status: number; message?: string; data?: unknown; auditId?: string; goto?: string };
