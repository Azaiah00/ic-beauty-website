/** Activity log (6.8): every change the team made, newest first, with Undo for 24 hours where it can be reversed. */
import { UNDO_HOURS } from "@/lib/community/config";
import type { Member } from "@/lib/community/types";
import { canUndo } from "@/lib/server/community/core";
import { db } from "@/lib/server/community/store";
import { Act, EmptyNote, StatePill, Tip, btnGhost, card, when } from "./shared";

export async function CommunityLog(_: { actor: Member }) {
  const now = new Date();
  const entries = (await db.audit()).slice(0, 200);
  return (
    <>
      <Tip>A record of every change, with who made it and when. Made a mistake? Tap Undo. It works for {UNDO_HOURS} hours after a change.</Tip>
      {entries.length === 0 ? (
        <EmptyNote>No changes yet. The first time you approve someone or change a plan, it shows up here with an Undo button.</EmptyNote>
      ) : (
        <ol className={`${card} mt-5 divide-y divide-plum-800/8`}>
          {entries.map((e) => (
            <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
              <p className="min-w-0 flex-1 text-[0.95rem] text-plum-900">
                <span className={e.undoneAt ? "text-plum-700 line-through" : ""}>{e.text}</span>
                <span className="text-plum-700"> · {when(e.at)}</span>
              </p>
              {e.undoneAt ? (
                <StatePill>Undone</StatePill>
              ) : canUndo(e, now) ? (
                <Act action="audit.undo" back="/admin?view=community-log">
                  <input type="hidden" name="id" value={e.id} />
                  <button className={`${btnGhost}`} aria-label={`Undo: ${e.text}`}>Undo</button>
                </Act>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
