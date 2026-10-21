/**
 * Iisha's real I.C. logo (exclamation "I" + "C" in the dot), traced to vector and
 * rendered as a CSS mask over currentColor (one cached file, any brand color).
 */
export function ICMark({ className = "", title = "I.C. Beauty" }: { className?: string; title?: string }) {
  return (
    <span
      className={`inline-block aspect-[560/688] bg-current [mask:url(/brand/ic-mark-crop.svg)_center/contain_no-repeat] [-webkit-mask:url(/brand/ic-mark-crop.svg)_center/contain_no-repeat] ${className}`}
      {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}
    />
  );
}

/** Wordmark lockup: mark + set type. */
export function Wordmark({ className, markClass = "h-9 w-auto" }: { className?: string; markClass?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className ?? ""}`}>
      <ICMark className={markClass} title="" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.55rem] font-medium tracking-[0.02em]">I.C. Beauty</span>
        <span className="mt-1 font-sans text-[0.55rem] font-medium uppercase tracking-[0.32em] opacity-80">Iisha C. Silver</span>
      </span>
    </span>
  );
}
