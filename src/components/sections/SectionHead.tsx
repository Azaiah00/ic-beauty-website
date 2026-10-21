export function SectionHead({
  eyebrow,
  title,
  lede,
  tone = "light",
  align = "left",
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  id?: string;
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={`eyebrow flex items-center gap-4 ${align === "center" ? "justify-center" : ""} ${tone === "dark" ? "text-brass-soft" : "text-amethyst"}`} data-reveal>
        <span className="h-px w-8 bg-brass" aria-hidden="true" />
        {eyebrow}
        {align === "center" && <span className="h-px w-8 bg-brass" aria-hidden="true" />}
      </p>
      <h2 id={id} className={`mt-5 text-title ${tone === "dark" ? "text-bone" : "text-plum-900"}`} data-reveal>{title}</h2>
      {lede && <p className={`mt-6 text-lede ${tone === "dark" ? "text-lilac" : "text-plum-700"}`} data-reveal>{lede}</p>}
    </div>
  );
}
