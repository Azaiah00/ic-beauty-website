import type { Metadata } from "next";
import { DemoHub } from "@/components/demo/DemoHub";

export const metadata: Metadata = {
  title: "Demo walkthrough",
  robots: { index: false, follow: false },
};

export default function DemoPage() {
  return <DemoHub />;
}
