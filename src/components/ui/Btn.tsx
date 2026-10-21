import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";

type Variant = "primary" | "light" | "outline" | "outline-light" | "text";

const styles: Record<Variant, string> = {
  primary: "bg-plum-900 text-bone hover:bg-amethyst",
  light: "bg-bone text-plum-900 hover:bg-white",
  outline: "border border-plum-900/30 text-plum-900 hover:border-plum-900 hover:bg-plum-900 hover:text-bone",
  "outline-light": "border border-bone/40 text-bone hover:bg-bone hover:text-plum-900",
  text: "!px-0 !py-1 text-current link-underline rounded-none",
};

/** Elegant pill button: small-caps label, generous padding, quiet arrow. */
export function Btn({
  href,
  children,
  variant = "primary",
  className = "",
  size = "md",
}: {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  size?: "md" | "lg";
}) {
  const external = /^https?:\/\//.test(href);
  const cls = `group inline-flex items-center justify-center gap-3 rounded-pill font-sans font-medium uppercase tracking-[0.16em] transition-[background,color,border] duration-500 ease-[var(--ease-lens)] ${
    size === "lg" ? "px-8 py-[1.05rem] text-[0.78rem]" : "px-6 py-3.5 text-[0.72rem]"
  } ${styles[variant]} ${className}`;
  const Icon = external ? ArrowUpRight : ArrowRight;
  const inner = (
    <>
      <span>{children}</span>
      <Icon aria-hidden="true" className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" strokeWidth={1.5} />
      {external && <span className="sr-only">(opens in a new tab)</span>}
    </>
  );
  if (external)
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    );
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
