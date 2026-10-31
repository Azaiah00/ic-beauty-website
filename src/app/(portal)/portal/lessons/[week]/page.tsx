import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LessonDetail } from "@/components/portal/Lessons";
import { lessons } from "@/lib/portal/data";

export function generateStaticParams() {
  return lessons.map((l) => ({ week: String(l.week) }));
}
export async function generateMetadata({ params }: { params: Promise<{ week: string }> }): Promise<Metadata> {
  const l = lessons[Number((await params).week) - 1];
  return { title: l ? `Week ${l.week}: ${l.title}` : "Lesson" };
}
export default async function LessonPage({ params }: { params: Promise<{ week: string }> }) {
  const l = lessons[Number((await params).week) - 1];
  if (!l) notFound();
  return <LessonDetail lesson={l} />;
}
