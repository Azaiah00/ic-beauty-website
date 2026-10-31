import type { Metadata } from "next";
import { shareMeta } from "@/lib/share";
import { Progress } from "@/components/portal/Progress";
export const metadata: Metadata = { ...shareMeta("/portal/progress"), title: "My progress" };
export default function ProgressPage() {
  return <Progress />;
}
