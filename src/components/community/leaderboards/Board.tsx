/** One leaderboard table: top 10, with the viewer's own rank pinned underneath when they're further down. */
import Link from "next/link";
import { MemberAvatar, card } from "@/components/community/ui";
import type { Member } from "@/lib/community/types";

type Row = { member: Member; points: number };

export function Board({ title, sub, rows, me, windowed }: { title: string; sub: string; rows: Row[]; me: Member; windowed: boolean }) {
  const top = rows.slice(0, 10);
  const mine = rows.findIndex((r) => r.member.id === me.id);
  const line = (r: Row, rank: number, pinned = false) => (
    <li key={r.member.id + (pinned ? "-me" : "")} className={`flex min-h-12 items-center gap-3 rounded-xl px-2 ${r.member.id === me.id ? "bg-lilac/40" : ""}`}>
      <span className={`w-6 shrink-0 text-right tabular-nums ${rank <= 3 ? "font-medium text-brass-deep" : "text-plum-700"}`}><span className="sr-only">Rank </span>{rank}</span>
      <MemberAvatar m={r.member} size={34} />
      <Link href={`/community/members/${r.member.id}`} className="min-w-0 flex-1 truncate py-2 text-plum-900 hover:text-amethyst">
        {r.member.name}
        {r.member.id === me.id && <span className="text-plum-700"> (you)</span>}
      </Link>
      <span className="shrink-0 tabular-nums text-plum-800">{windowed ? "+" : ""}{r.points}<span className="sr-only"> points</span></span>
    </li>
  );
  return (
    <section className={`${card} p-4 sm:p-5`} aria-label={`${title} leaderboard`}>
      <h2 className="font-display text-[1.5rem] leading-tight text-plum-900">{title}</h2>
      <p className="text-[0.84rem] text-plum-700">{sub}</p>
      {top.length === 0 ? (
        <p className="mt-4 text-plum-700">No points yet in this window. Share a win and be the first.</p>
      ) : (
        <ol className="mt-3 space-y-0.5">{top.map((r, i) => line(r, i + 1))}</ol>
      )}
      {me.role === "member" && mine >= 10 && (
        <ol className="mt-2 border-t border-dashed border-plum-800/20 pt-2" aria-label="Your rank">{line(rows[mine], mine + 1, true)}</ol>
      )}
      {me.role === "member" && mine < 0 && top.length > 0 && <p className="mt-3 border-t border-dashed border-plum-800/20 pt-3 text-[0.86rem] text-plum-700">You&apos;re not on this board yet. One like on a post or comment puts you here.</p>}
    </section>
  );
}
