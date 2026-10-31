import type { Metadata } from "next";
import { shareMeta } from "@/lib/share";
import { Dashboard } from "@/components/portal/Dashboard";
export const metadata: Metadata = { ...shareMeta("/portal"), title: "Home" };
export default function PortalHome() {
  return <Dashboard />;
}
