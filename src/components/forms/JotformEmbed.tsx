"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";

declare global {
  interface Window {
    jotformEmbedHandler?: (selector: string, base: string) => void;
  }
}

const HANDLER_SRC = "https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js";

/**
 * Iisha's own Jotform, embedded on-brand. Jotform stays the single inbox for intakes
 * (she builds and edits forms there herself); the site only frames them.
 * Uses Jotform's official embed handler so the frame grows to fit each step (no inner scrollbar),
 * exactly like the embed code Jotform gives you.
 */
export function JotformEmbed({ formId, title }: { formId: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const id = `JotFormIFrame-${formId}`;

  useEffect(() => {
    const init = () => window.jotformEmbedHandler?.(`iframe[id='${id}']`, "https://form.jotform.com/");
    if (window.jotformEmbedHandler) {
      init();
      return;
    }
    let s = document.querySelector<HTMLScriptElement>(`script[src="${HANDLER_SRC}"]`);
    if (!s) {
      s = document.createElement("script");
      s.src = HANDLER_SRC;
      s.async = true;
      document.body.appendChild(s);
    }
    s.addEventListener("load", init);
    return () => s?.removeEventListener("load", init);
  }, [id]);

  const src = `https://form.jotform.com/${formId}`;
  return (
    <div>
      <iframe
        ref={ref}
        id={id}
        title={title}
        src={src}
        allow="geolocation; microphone; camera; fullscreen"
        className="block w-full rounded-xl border-0 bg-white"
        style={{ minWidth: "100%", maxWidth: "100%", height: 1200, border: "none" }}
        scrolling="no"
      />
      <p className="mt-3 text-[0.85rem] text-plum-700">
        Form not loading?{" "}
        <a href={src} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-amethyst underline decoration-amethyst/40 underline-offset-4">
          Open it in a new tab <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </p>
    </div>
  );
}
