"use client";

import { createContext, createElement, useContext, useEffect, useState } from "react";
import { demoMember } from "@/lib/portal/data";

/** The signed-in community member's first name, provided by the My Journey layout. */
const MemberNameCtx = createContext<string | null>(null);
export function MemberNameProvider({ name, children }: { name: string; children: React.ReactNode }) {
  return createElement(MemberNameCtx.Provider, { value: name }, children);
}

/** The member's first name: the signed-in member, else the one entered earlier in this session, else the demo member. */
export function useMemberName() {
  const signedIn = useContext(MemberNameCtx);
  const [name, setName] = useState(demoMember.firstName);
  useEffect(() => {
    if (signedIn) return;
    try {
      const n = sessionStorage.getItem("icb-first-name")?.trim();
      if (n) setName(n);
    } catch {}
  }, [signedIn]);
  return signedIn ?? name;
}
