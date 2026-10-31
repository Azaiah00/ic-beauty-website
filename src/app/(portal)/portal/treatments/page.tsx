import type { Metadata } from "next";
import { Care } from "@/components/portal/Care";
export const metadata: Metadata = { title: "My care" };
export default function CarePage() {
  return <Care />;
}
