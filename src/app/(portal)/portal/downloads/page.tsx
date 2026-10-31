import type { Metadata } from "next";
import { Downloads } from "@/components/portal/Care";
export const metadata: Metadata = { title: "Downloads" };
export default function DownloadsPage() {
  return <Downloads />;
}
