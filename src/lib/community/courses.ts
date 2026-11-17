/**
 * Classroom helpers shared by pages and the service layer.
 * Courses with a `source` read their lessons from the file that already owns them (the 12-week curriculum in
 * src/lib/portal/data.ts, Iisha's verbatim 30-day copy in src/lib/funnel.ts), so nothing is stored twice.
 */
import { lessons as portalLessons } from "@/lib/portal/data";
import { pilotWeeks } from "@/lib/funnel";
import { PLANS } from "./config";
import type { Course, Lesson, Module, Settings } from "./types";

function sourceModules(source: Course["source"]): Module[] {
  if (source === "portal-lessons") {
    const toLesson = (l: (typeof portalLessons)[number]): Lesson => ({
      id: `week-${l.week}`,
      title: `Week ${l.week}: ${l.title}`,
      minutes: l.minutes,
      summary: l.summary,
      takeaways: [...l.takeaways],
      action: l.action,
      reflection: l.reflection,
      poster: l.poster,
      downloads: [{ title: l.worksheet.title, file: l.worksheet.file }],
    });
    return [
      { id: "weeks-1-4", title: "Weeks 1 to 4: Foundations", lessons: portalLessons.slice(0, 4).map(toLesson) },
      { id: "weeks-5-8", title: "Weeks 5 to 8: Daily care", lessons: portalLessons.slice(4, 8).map(toLesson) },
      { id: "weeks-9-12", title: "Weeks 9 to 12: Make it yours", lessons: portalLessons.slice(8, 12).map(toLesson) },
    ];
  }
  if (source === "pilot-weeks") {
    return [
      {
        id: "four-weeks",
        title: "Four weeks, four phases",
        // Iisha's wording, word for word (funnel.pilotWeeks). Never edit here.
        lessons: pilotWeeks.map((w, i) => ({ id: `week-${i + 1}`, title: `${w.week} · ${w.theme}: ${w.title}`, summary: w.body, takeaways: [w.phase], action: "", reflection: "", downloads: [] })),
      },
    ];
  }
  return [];
}

/** A stored course with its lessons filled in and the team's edits applied. */
export function hydrate(c: Course): Course {
  const modules = (c.source ? sourceModules(c.source) : c.modules).map((m) => ({
    ...m,
    lessons: m.lessons.map((l) => ({ ...l, ...(c.source === "pilot-weeks" ? {} : c.overrides?.[l.id]) })),
  }));
  return { ...c, modules };
}

export const flatLessons = (c: Course) => c.modules.flatMap((m) => m.lessons);

/** The short label on a course card. */
export function accessChip(c: Course, s: Settings): { text: string; needs?: string } {
  const a = c.access;
  if (c.apply) return { text: c.apply.label };
  if (!c.published) return { text: "Not published (team only)" };
  switch (a.kind) {
    case "open":
      return { text: "Open to everyone" };
    case "level":
      return { text: `Level ${a.level} unlock` };
    case "plan":
      return { text: a.plans.includes("circle") ? `Included in ${s.plans.circle.name.replace(" Member", "")}` : (s.plans.inner.name ?? PLANS.inner.name) };
    case "drip":
      return { text: a.everyDays === 7 ? "New lesson every Monday" : `New lesson every ${a.everyDays} days` };
    case "buy": {
      const price = s.prices[a.priceKey];
      return price ? { text: `Buy · ${price}` } : { text: "Buy", needs: "Price" };
    }
    case "private":
      return { text: "Hidden (team only)" };
  }
}

/** Plain words for the dashboard's access dropdown. */
export const ACCESS_CHOICES = [
  { value: "open", label: "Everyone can see it" },
  { value: "level", label: "Free after reaching a level" },
  { value: "circle", label: "Circle members" },
  { value: "inner", label: "Inner Circle members" },
  { value: "buy", label: "Sell it" },
  { value: "drip", label: "New lesson every few days" },
  { value: "private", label: "Hidden (only team)" },
] as const;

export function accessChoice(c: Course): (typeof ACCESS_CHOICES)[number]["value"] {
  const a = c.access;
  if (a.kind === "plan") return a.plans.includes("circle") ? "circle" : "inner";
  return a.kind;
}

/** Turns a watch link into an embeddable player address (YouTube and Vimeo only). */
export function embedUrl(url: string | undefined): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}
