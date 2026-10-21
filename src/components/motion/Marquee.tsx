/** CSS-only marquee (duplicated track for a seamless loop; second copy hidden from AT). */
export function Marquee({ items, className = "", separator }: { items: string[]; className?: string; separator: React.ReactNode }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className="flex items-center">
          <span className="whitespace-nowrap px-6">{t}</span>
          {separator}
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] ${className}`}>
      <div className="flex animate-marquee motion-reduce:animate-none">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
