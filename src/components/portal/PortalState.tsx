"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { habitSeed, habits, treatments, checkIns, type HabitKey } from "@/lib/portal/data";

/** Demo session state for the member portal. Memory only (resets on refresh). // TODO: Supabase */
type State = {
  completed: Set<number>;
  reflections: Record<number, string>;
  habitGrid: Record<HabitKey, boolean[]>;
  homeCare: Record<string, boolean[]>;
  thisWeek: { scalp: number; breakage: number; routine: number; feeling: number };
  checkInSaved: boolean;
};
type Ctx = State & {
  toggleComplete: (week: number) => void;
  saveReflection: (week: number, text: string) => void;
  toggleHabit: (key: HabitKey, day: number) => void;
  toggleHomeCare: (id: string, i: number) => void;
  setRating: (k: keyof State["thisWeek"], v: number) => void;
  saveCheckIn: () => void;
  habitPercent: number;
  streak: number;
};

const PortalCtx = createContext<Ctx | null>(null);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const last = checkIns[checkIns.length - 1];
  const [completed, setCompleted] = useState<Set<number>>(() => new Set([1, 2]));
  const [reflections, setReflections] = useState<Record<number, string>>({
    1: "That my hair 'just doesn't grow.' It does. I was breaking it at the same spots.",
  });
  const [habitGrid, setHabitGrid] = useState<Record<HabitKey, boolean[]>>(() =>
    Object.fromEntries(Object.entries(habitSeed).map(([k, v]) => [k, [...v]])) as Record<HabitKey, boolean[]>,
  );
  const [homeCare, setHomeCare] = useState<Record<string, boolean[]>>(() =>
    Object.fromEntries(treatments.map((t) => [t.id, t.homeCare.map((h) => h.done)])),
  );
  const [thisWeek, setThisWeek] = useState({ scalp: last.scalp, breakage: last.breakage, routine: last.routine, feeling: last.feeling });
  const [checkInSaved, setCheckInSaved] = useState(false);

  const toggleComplete = useCallback((week: number) => {
    setCompleted((s) => {
      const n = new Set(s);
      if (n.has(week)) n.delete(week);
      else n.add(week);
      return n;
    });
  }, []);
  const saveReflection = useCallback((week: number, text: string) => setReflections((r) => ({ ...r, [week]: text })), []);
  const toggleHabit = useCallback((key: HabitKey, day: number) => {
    setHabitGrid((g) => ({ ...g, [key]: g[key].map((v, i) => (i === day ? !v : v)) }));
  }, []);
  const toggleHomeCare = useCallback((id: string, i: number) => {
    setHomeCare((h) => ({ ...h, [id]: h[id].map((v, j) => (j === i ? !v : v)) }));
  }, []);
  const setRating = useCallback((k: keyof State["thisWeek"], v: number) => {
    setThisWeek((w) => ({ ...w, [k]: v }));
    setCheckInSaved(false);
  }, []);
  const saveCheckIn = useCallback(() => setCheckInSaved(true), []);

  const { habitPercent, streak } = useMemo(() => {
    const total = habits.length * 7;
    const done = Object.values(habitGrid).reduce((a, row) => a + row.filter(Boolean).length, 0);
    // streak = consecutive days (from Monday) where at least 3 habits were done
    let s = 0;
    for (let d = 0; d < 7; d++) {
      const count = Object.values(habitGrid).filter((row) => row[d]).length;
      if (count >= 3) s++;
      else break;
    }
    return { habitPercent: Math.round((done / total) * 100), streak: s };
  }, [habitGrid]);

  const value: Ctx = {
    completed, reflections, habitGrid, homeCare, thisWeek, checkInSaved,
    toggleComplete, saveReflection, toggleHabit, toggleHomeCare, setRating, saveCheckIn,
    habitPercent, streak,
  };
  return <PortalCtx.Provider value={value}>{children}</PortalCtx.Provider>;
}

export function usePortal() {
  const c = useContext(PortalCtx);
  if (!c) throw new Error("usePortal must be used inside <PortalProvider>");
  return c;
}
