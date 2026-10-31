import type { Metadata } from "next";
import { shareMeta } from "@/lib/share";
import { LessonList } from "@/components/portal/Lessons";
export const metadata: Metadata = { ...shareMeta("/portal/lessons"), title: "Lessons" };
export default function LessonsPage() {
  return <LessonList />;
}
