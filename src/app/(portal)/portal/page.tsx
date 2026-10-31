import type { Metadata } from "next";
import { Dashboard } from "@/components/portal/Dashboard";
export const metadata: Metadata = { title: "Home" };
export default function PortalHome() {
  return <Dashboard />;
}
