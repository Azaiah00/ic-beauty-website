"use client";

/** Detects the browser's time zone and saves it once, quietly, when the member hasn't chosen one yet. */
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { act } from "@/components/community/client";

export function TimeZoneSync({ saved }: { saved?: string }) {
  const router = useRouter();
  useEffect(() => {
    if (saved) return;
    let tz = "";
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz || sessionStorage.getItem("icb-tz-sent")) return;
      sessionStorage.setItem("icb-tz-sent", "1");
    } catch {
      return;
    }
    act("profile.save", { timeZone: tz }).then((r) => r.ok && router.refresh());
  }, [saved, router]);
  return null;
}
