"use client";

import { useEffect, useState } from "react";
import { demoMember } from "@/lib/portal/data";

/** The member's first name: the one entered earlier in this session (opt-in / application), else the demo member. */
export function useMemberName() {
  const [name, setName] = useState(demoMember.firstName);
  useEffect(() => {
    try {
      const n = sessionStorage.getItem("icb-first-name")?.trim();
      if (n) setName(n);
    } catch {}
  }, []);
  return name;
}
