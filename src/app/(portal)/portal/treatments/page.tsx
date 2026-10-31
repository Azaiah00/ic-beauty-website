import type { Metadata } from "next";
import { shareMeta } from "@/lib/share";
import { Care } from "@/components/portal/Care";
export const metadata: Metadata = { ...shareMeta("/portal/treatments"), title: "My care" };
export default function CarePage() {
  return <Care />;
}
