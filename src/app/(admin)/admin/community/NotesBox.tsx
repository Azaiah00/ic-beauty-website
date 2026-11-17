"use client";

/** Private team notes about a member. Saves by itself when you click away. */
import { useState } from "react";
import { act } from "@/components/community/client";

export function NotesBox({ id, initial }: { id: string; initial: string }) {
  const [saved, setSaved] = useState(initial);
  const [status, setStatus] = useState("");
  return (
    <div>
      <label className="block text-[0.72rem] font-medium uppercase tracking-[0.14em] text-plum-700">
        Private team notes (members never see these)
        <textarea
          defaultValue={initial}
          rows={3}
          placeholder="Called Tuesday, traveling until March…"
          className="mt-1.5 block w-full rounded-xl border border-plum-800/15 bg-white px-3 py-2 text-[0.95rem] normal-case tracking-normal text-ink focus:border-amethyst focus:outline-none"
          onBlur={async (e) => {
            const notes = e.target.value;
            if (notes === saved) return;
            setStatus("Saving…");
            const r = await act("member.note", { id, notes, _as: "dashboard" });
            if (r.ok) setSaved(notes);
            setStatus(r.ok ? "Saved" : r.message ?? "Couldn't save. Please try again.");
          }}
        />
      </label>
      <p aria-live="polite" className="mt-1 min-h-5 text-[0.8rem] text-plum-700">{status || "Saves by itself when you click away."}</p>
    </div>
  );
}
