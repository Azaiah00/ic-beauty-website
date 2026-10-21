#!/usr/bin/env node
/**
 * Kie.ai image generation for the I.C. Beauty site (Couture House standard: Kie.ai only).
 *
 *   KIE_API_KEY=xxxx node scripts/generate-images.mjs            # generate all missing
 *   KIE_API_KEY=xxxx node scripts/generate-images.mjs hero-coils # one by key
 *
 * Rules baked into every prompt: no faces of real people presented as Iisha or her
 * clients, no text/logos, brand palette (plum / aubergine / bone / brass).
 * Output → public/images/<key>.jpg  (then optimized by next/image at runtime)
 */
import fs from "node:fs/promises";
import path from "node:path";

const KEY = process.env.KIE_API_KEY;
if (!KEY) {
  console.error("Missing KIE_API_KEY (put it in .env.local or pass inline).");
  process.exit(1);
}
const API = "https://api.kie.ai/api/v1/jobs";
const MODEL = process.env.KIE_MODEL || "nano-banana-pro";
const OUT = path.join(process.cwd(), "public", "images");

const STYLE =
  "Hyper-realistic editorial photograph, shot on a Canon EOS R5 with an 85mm lens, natural window light with soft fill, true-to-life skin texture and hair texture, refined luxury hair-wellness studio aesthetic, color palette of warm bone white, deep plum and aubergine accents, subtle brushed-gold details. Elegant, calm, premium, magazine quality. No text, no logos, no watermarks, no distorted hands.";

/**
 * PLACEHOLDER imagery (hyper-realistic) until Iisha's photoshoot. Practitioner is never
 * shown face-on (so no one is presented as Iisha). Replace any file with a real photo of
 * the same name and the site picks it up automatically.
 */
export const IMAGES = [
  {
    key: "studio",
    aspect: "16:9",
    prompt: `Interior of an upscale private hair and scalp wellness studio: a single deep plum velvet styling chair, bone-white walls with soft arched alcove, brushed-gold mirror frame and fixtures, a small marble side table with amber glass bottles, a pampas arrangement, polished light oak floor, afternoon sunlight through sheer curtains. Empty room, serene and luxurious. ${STYLE}`,
  },
  {
    key: "consultation",
    aspect: "4:5",
    prompt: `A hair and scalp consultation in a luxury studio: a relaxed Black woman in her late 30s with short natural coily hair sits in a plum velvet chair smiling softly, while the practitioner — a Black woman with a short tapered cut of deep plum-violet natural coils, in a crisp white coat, seen only from behind her shoulder with her face not visible, with deep brown skin and a soft lavender manicure — gently parts the client's hair at the crown with a slim handheld digital scalp camera. Warm, caring, professional mood. ${STYLE}`,
  },
  {
    key: "client-portrait",
    aspect: "4:5",
    prompt: `Portrait of a confident, glowing Black woman in her 40s with healthy, defined natural 4B coils in a tapered cut, wearing a soft bone-colored silk blouse and small gold earrings, gentle genuine smile, standing against a warm bone-white wall with a sliver of plum drapery, soft window light. ${STYLE}`,
  },
  {
    key: "scalp-closeup",
    aspect: "1:1",
    prompt: `Close-up of a Black practitioner's deep brown hands with a soft lavender manicure, white coat sleeves, gently parting healthy natural coily hair to reveal a clean, healthy scalp along a neat part, soft directional light, shallow depth of field. Tender and clinical-luxe. ${STYLE}`,
  },
  {
    key: "classroom",
    aspect: "3:2",
    prompt: `A small professional hair education class in a bright, elegant salon academy: four Black women stylists in black aprons practicing sectioning on mannequin heads with natural coily hair, notebooks and product kits on the stations, the educator — a Black woman with a short tapered cut of deep plum-violet natural coils in a white coat — seen from behind at the front of the room, her face not visible. Focused and inspiring. ${STYLE}`,
  },
  {
    key: "speaker",
    aspect: "16:9",
    prompt: `View from the back of an elegant audience of professional Black women and men at a university wellness event, looking toward a woman speaker in a white blazer on a small stage, softly out of focus in the distance so her face is not identifiable, warm plum and amber stage lighting, a lectern with a microphone. Engaged, inspiring atmosphere. ${STYLE}`,
  },
  {
    key: "product-shelf",
    aspect: "4:5",
    prompt: `An elegant open shelf in a luxury hair wellness studio displaying minimalist unlabeled amber and frosted glass haircare bottles, a wide-tooth wood comb, a scalp massager brush, folded plum towels and a small potted rosemary plant, soft natural light, bone-white wall with brushed-gold bracket. ${STYLE}`,
  },
  {
    key: "parent-child",
    aspect: "3:2",
    prompt: `A Black mother sitting on a cream sofa gently detangling her young daughter's natural coily hair with a wide-tooth comb and a spray bottle, the girl smiling and relaxed, both seen in soft profile, warm window light, cozy elegant living room with plum throw pillow. ${STYLE}`,
  },
  {
    key: "scalp-ritual",
    aspect: "3:2",
    prompt: `A serene scalp care ritual at a shampoo bowl in a luxury hair wellness studio: a Black woman reclines with eyes closed, relaxed, as a practitioner's hands (practitioner out of frame) massage her scalp through her natural hair, soft steam, plum towel under her neck, warm low light. ${STYLE}`,
  },
];

async function createTask(img) {
  const res = await fetch(`${API}/createTask`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ model: MODEL, input: { prompt: img.prompt, aspect_ratio: img.aspect, resolution: "2K", output_format: "jpg" } }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`createTask ${img.key}: ${json.code} ${json.msg}`);
  return json.data.taskId;
}

async function waitFor(taskId, key) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const res = await fetch(`${API}/recordInfo?taskId=${encodeURIComponent(taskId)}`, { headers: { Authorization: `Bearer ${KEY}` } });
    const json = await res.json();
    const d = json.data || {};
    if (d.state === "success") {
      const result = typeof d.resultJson === "string" ? JSON.parse(d.resultJson) : d.resultJson;
      const url = result?.resultUrls?.[0];
      if (!url) throw new Error(`${key}: success but no resultUrls`);
      return url;
    }
    if (d.state === "fail") throw new Error(`${key}: generation failed — ${d.failMsg || d.failCode || "unknown"}`);
    process.stdout.write(".");
  }
  throw new Error(`${key}: timed out`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const only = process.argv[2];
  const todo = IMAGES.filter((i) => (only ? i.key === only : true));
  const results = await Promise.allSettled(
    todo.map(async (img) => {
      const file = path.join(OUT, `${img.key}.jpg`);
      if (!only) {
        try {
          await fs.access(file);
          console.log(`skip ${img.key} (exists)`);
          return;
        } catch {}
      }
      const id = await createTask(img);
      console.log(`queued ${img.key} → ${id}`);
      const url = await waitFor(id, img.key);
      const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
      await fs.writeFile(file, bin);
      console.log(`\nsaved ${file} (${Math.round(bin.length / 1024)} KB)`);
    }),
  );
  const failed = results.filter((r) => r.status === "rejected");
  failed.forEach((f) => console.error(String(f.reason)));
  process.exit(failed.length ? 1 : 0);
}

main();
