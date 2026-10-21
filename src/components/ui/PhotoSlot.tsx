import Image from "next/image";
import { Needs } from "./Needs";

/**
 * Elegant photo frame. `shape="arch"` gives the signature arched top.
 * Renders the real image when `src` exists; otherwise a quiet branded placeholder.
 */
export function PhotoSlot({
  src,
  alt,
  label,
  className = "",
  ratio = "aspect-[4/5]",
  priority = false,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  shape = "rect",
  position = "center",
  reveal = true,
  parallax,
  tone = "light",
}: {
  src?: string;
  alt: string;
  label: string;
  className?: string;
  ratio?: string;
  priority?: boolean;
  sizes?: string;
  shape?: "rect" | "arch" | "round";
  position?: string;
  reveal?: boolean;
  parallax?: number;
  tone?: "light" | "dark";
}) {
  const radius = shape === "arch" ? "arch" : shape === "round" ? "rounded-full" : "rounded-card";
  return (
    <figure
      className={`relative overflow-hidden ${radius} ${ratio} ${tone === "dark" ? "bg-plum-800" : "bg-sand"} ${className}`}
      {...(reveal && !priority ? { "data-reveal": "image" } : {})}
    >
      {src ? (
        <div className={`absolute ${parallax ? "-inset-y-[8%] inset-x-0" : "inset-0"} ${priority ? "settle" : ""}`} {...(parallax ? { "data-parallax": parallax } : {})}>
          <Image src={src} alt={alt} fill priority={priority} sizes={sizes} className="object-cover" style={{ objectPosition: position }} />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
          <Needs tone={tone === "dark" ? "light" : "dark"}>Photo coming</Needs>
          <p className={`max-w-[26ch] text-sm ${tone === "dark" ? "text-lilac" : "text-plum-700"}`}>{label}</p>
        </div>
      )}
    </figure>
  );
}
