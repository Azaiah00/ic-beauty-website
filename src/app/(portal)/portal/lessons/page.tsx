import type { Metadata } from "next";
import { LessonList } from "@/components/portal/Lessons";
export const metadata: Metadata = { title: "Lessons" };
export default function LessonsPage() {
  return <LessonList />;
}
