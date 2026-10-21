import fs from "node:fs";
import path from "node:path";

/**
 * Server-only: returns /images/<key>.jpg when that file exists in /public/images,
 * otherwise undefined (the PhotoSlot then shows its NEEDS REAL PHOTO placeholder).
 * Generate with `node scripts/generate-images.mjs` (Kie.ai) or drop real photos in
 * with the same file name — no code changes needed.
 */
export function img(key: string): string | undefined {
  for (const ext of ["jpg", "jpeg", "webp", "png"]) {
    if (fs.existsSync(path.join(process.cwd(), "public", "images", `${key}.${ext}`))) return `/images/${key}.${ext}`;
  }
  return undefined;
}
