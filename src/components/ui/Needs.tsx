/**
 * Owed-asset marker (project rule). Quiet styling so the design reads elegant in review,
 * but still easy to grep before launch: `grep -rn "data-needs" .next` / `grep -rn "Needs" src`.
 */
export function Needs({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" }) {
  return (
    <span
      data-needs
      className={`inline-flex items-center gap-1.5 rounded-sm border border-dashed px-2 py-0.5 font-sans text-[0.62rem] font-medium uppercase tracking-[0.16em] ${
        tone === "dark" ? "border-brass-deep/50 text-plum-800" : "border-brass/60 text-brass-soft"
      }`}
    >
      {children}
    </span>
  );
}
