import type { Metadata } from "next";
import { shareMeta } from "@/lib/share";
import { Downloads } from "@/components/portal/Care";
export const metadata: Metadata = { ...shareMeta("/portal/downloads"), title: "Downloads" };
export default function DownloadsPage() {
  return <Downloads />;
}
