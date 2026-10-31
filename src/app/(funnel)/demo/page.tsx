import type { Metadata } from "next";
import { DemoHub } from "@/components/demo/DemoHub";
import { shareMeta } from "@/lib/share";

export const metadata: Metadata = {
  ...shareMeta("/demo"),
  title: "Demo walkthrough",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoHub />;
}
