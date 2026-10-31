"use client";
import { useEffect, useState } from "react";
import { DEMO_KEY, isDemoActive } from "@/lib/demo";

/** True when presenter demo mode is on for this tab. ?demo=1 turns it on, ?demo=0 turns it off. */
export function useDemo() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("demo");
      if (q === "1") sessionStorage.setItem(DEMO_KEY, "1");
      if (q === "0") sessionStorage.removeItem(DEMO_KEY);
    } catch {}
    setOn(isDemoActive());
    const sync = () => setOn(isDemoActive());
    window.addEventListener("icb-demo-change", sync);
    return () => window.removeEventListener("icb-demo-change", sync);
  }, []);
  return on;
}

export function setDemo(on: boolean) {
  try {
    if (on) sessionStorage.setItem(DEMO_KEY, "1");
    else sessionStorage.removeItem(DEMO_KEY);
  } catch {}
  window.dispatchEvent(new Event("icb-demo-change"));
}
