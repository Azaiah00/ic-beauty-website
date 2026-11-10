"use client";
/** Shows why a "Buy now" didn't go through (?order=…), without making the shop page dynamic. */
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

const MESSAGES: Record<string, string> = {
  soldout: "Sorry, that product just sold out. Please choose another or ask Iisha at your next visit.",
  missing: "That product isn't available online right now. Please call or text the studio to order.",
  unavailable: "Online ordering is getting set up. Please call or text the studio to order.",
  error: "Checkout didn't open. Please try again, or call or text the studio to order.",
};

export function OrderNotice() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get("order");
    if (k) setMsg(MESSAGES[k] ?? MESSAGES.error);
  }, []);
  if (!msg) return null;
  return (
    <p role="alert" className="mt-8 flex items-start gap-2 rounded-2xl bg-[#f8e6e1] px-4 py-3 text-[0.92rem] text-[#8a3a26]">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      {msg}
    </p>
  );
}
