import Link from "next/link";
import { PhotoSlot } from "@/components/ui/PhotoSlot";

/**
 * Elegant interior-page hero: bone ground, editorial serif headline, and (optionally)
 * an arched portrait/image with a hairline brass offset frame.
 */
export function PageHero({
  eyebrow,
  title,
  lede,
  crumbs,
  children,
  image,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  crumbs?: { name: string; href: string }[];
  children?: React.ReactNode;
  image?: { src?: string; alt: string; label: string; position?: string; shape?: "arch" | "rect" };
}) {
  return (
    <section className="relative overflow-hidden bg-bone pb-16 pt-32 sm:pt-40 lg:pb-24">
      <div className="container-x relative">
        {crumbs && (
          <nav aria-label="Breadcrumb" className="mb-10">
            <ol className="flex flex-wrap items-center gap-2 font-sans text-[0.68rem] font-medium uppercase tracking-[0.2em] text-plum-700">
              <li><Link href="/" className="hover:text-amethyst">Home</Link></li>
              {crumbs.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  <span aria-hidden="true" className="text-brass">/</span>
                  {i === crumbs.length - 1 ? <span aria-current="page" className="text-amethyst">{c.name}</span> : <Link href={c.href} className="hover:text-amethyst">{c.name}</Link>}
                </li>
              ))}
            </ol>
          </nav>
        )}
        <div className={image ? "grid items-center gap-12 lg:grid-cols-12 lg:gap-16" : ""}>
          <div className={image ? "lg:col-span-6" : "max-w-4xl"}>
            <p className="eyebrow flex items-center gap-4 text-amethyst rise" style={{ ["--d" as string]: 1 }}>
              <span className="h-px w-10 bg-brass" aria-hidden="true" />
              {eyebrow}
            </p>
            <h1 className="mt-6 text-display text-plum-900 rise" style={{ ["--d" as string]: 2 }}>{title}</h1>
            {lede && <div className="mt-7 max-w-xl text-lede text-plum-700 rise" style={{ ["--d" as string]: 3 }}>{lede}</div>}
            {children && <div className="mt-10 flex flex-wrap gap-3 rise" style={{ ["--d" as string]: 4 }}>{children}</div>}
          </div>
          {image && (
            <div className="relative lg:col-span-5 lg:col-start-8">
              <div aria-hidden="true" className={`absolute -right-3 top-5 bottom-[-12px] left-3 border border-brass/60 ${image.shape === "rect" ? "rounded-card" : "arch"}`} />
              <PhotoSlot src={image.src} alt={image.alt} label={image.label} shape={image.shape ?? "arch"} priority position={image.position} ratio="aspect-[4/5]" sizes="(min-width: 1024px) 38vw, 100vw" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
