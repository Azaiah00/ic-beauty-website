/**
 * Generates the community's 3D icon set with Kie.ai (same API as scripts/generate-images.mjs).
 *
 *   node scripts/generate-icons.mjs            # generate every icon that is missing
 *   node scripts/generate-icons.mjs crown      # (re)generate one by key
 *   node scripts/generate-icons.mjs --recut    # redo the background removal from the saved renders (free)
 *
 * Needs KIE_API_KEY (the environment, or .env.local). Each icon is rendered on white, the white
 * backdrop is removed (flood-fill from the edges, so highlights inside the icon stay), and the result is
 * saved as a small transparent WebP in public/images/icons/<key>.webp. Used by <Icon3D name="key" />.
 */
import fs from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

let KEY = process.env.KIE_API_KEY;
if (!KEY && existsSync(".env.local")) KEY = /^KIE_API_KEY=(.+)$/m.exec(readFileSync(".env.local", "utf8"))?.[1]?.trim();
if (!KEY) {
  console.error("Missing KIE_API_KEY (put it in .env.local or pass inline).");
  process.exit(1);
}
const API = "https://api.kie.ai/api/v1/jobs";
const MODEL = process.env.KIE_MODEL || "nano-banana-pro";
const OUT = path.join(process.cwd(), "public", "images", "icons");
const SIZE = 256;
const RAW = path.join(process.cwd(), ".data", "icons-raw"); // untouched renders, kept locally so the cut-out can be re-tuned for free

/** One look for the whole set: quiet luxury, jewel-like, I.C. Beauty's plum, amethyst and brass. */
const STYLE =
  "rendered as one elegant, luxurious 3D icon, like a piece of fine jewelry: polished deep amethyst purple glass and rich plum enamel with brushed brass gold accents, soft lilac reflections, smooth rounded sculptural forms, gentle studio lighting, a very soft subtle shadow beneath. Refined and minimal with a little character, never cartoonish or childish. Single object, centered, with generous empty margin around it, isolated on a pure flat white background. No text, no letters, no numbers, no watermark, no border, no extra objects.";

export const ICONS = [
  { key: "community", subject: "Two overlapping rounded speech bubbles, one amethyst glass and one brass" },
  { key: "classroom", subject: "A graduation cap with a small brass tassel" },
  { key: "calendar", subject: "A small desk calendar page with two brass rings on top and one tiny brass heart on the page" },
  { key: "members", subject: "Three smooth abstract rounded figures standing close together, like polished chess pawns" },
  { key: "leaderboards", subject: "A trophy cup with two handles, amethyst glass cup on a brass base" },
  { key: "labs", subject: "A round-bottom laboratory flask of amethyst glass with a few tiny brass sparkles rising from it" },
  { key: "journey", subject: "A compass with a brass rim and an amethyst glass face" },
  { key: "inbox", subject: "A notification bell with a small brass clapper" },
  { key: "messages", subject: "A closed envelope sealed with a small brass heart" },
  { key: "lock", subject: "A rounded padlock, amethyst glass body with a brass shackle and a tiny keyhole" },
  { key: "crown", subject: "A small regal crown, brass with amethyst gemstones" },
  { key: "circle", subject: "A thick smooth ring, like a wedding band, brass with one inlaid amethyst stone" },
  { key: "seedling", subject: "A tiny seedling with two leaves growing from a small round brass pot, the leaves in amethyst glass" },
  { key: "gift", subject: "A small gift box in plum enamel tied with a brass ribbon and bow" },
  { key: "megaphone", subject: "A megaphone, amethyst glass cone with a brass handle and rim" },
  { key: "check", subject: "A round medallion badge with a raised check mark, amethyst glass with a brass rim" },
  { key: "heart", subject: "A plump glossy heart, amethyst glass with a thin brass outline" },
  { key: "question", subject: "A rounded speech bubble containing a raised question mark shape, amethyst glass with brass" },
  { key: "waterdrop", subject: "A single water droplet of clear amethyst glass resting on a tiny brass dish" },
  { key: "sparkle", subject: "A four-point sparkle star with a smaller one beside it, brass with amethyst glass centers" },
  { key: "comb", subject: "Exactly one single wide-tooth detangling hair comb, seen straight on from the front, lying at a slight diagonal: one straight horizontal spine with a row of eight evenly spaced straight teeth pointing down, and a short rounded handle on one end. Amethyst glass spine and handle with brass teeth. Only one comb, not crossed, not doubled" },
  { key: "key", subject: "An ornate small key, brass with an amethyst gemstone in the bow" },
];

async function createTask(icon) {
  const res = await fetch(`${API}/createTask`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ model: MODEL, input: { prompt: `${icon.subject}, ${STYLE}`, aspect_ratio: "1:1", resolution: "1K", output_format: "png" } }),
  });
  const json = await res.json();
  if (json.code !== 200) throw new Error(`createTask ${icon.key}: ${json.code} ${json.msg}`);
  return json.data.taskId;
}

async function waitFor(taskId, key) {
  for (let i = 0; i < 90; i++) {
    await new Promise((r) => setTimeout(r, 5000));
    const json = await (await fetch(`${API}/recordInfo?taskId=${encodeURIComponent(taskId)}`, { headers: { Authorization: `Bearer ${KEY}` } })).json();
    const d = json.data || {};
    if (d.state === "success") {
      const result = typeof d.resultJson === "string" ? JSON.parse(d.resultJson) : d.resultJson;
      const url = result?.resultUrls?.[0];
      if (!url) throw new Error(`${key}: success but no resultUrls`);
      return url;
    }
    if (d.state === "fail") throw new Error(`${key}: generation failed: ${d.failMsg || d.failCode || "unknown"}`);
  }
  throw new Error(`${key}: timed out`);
}

/** White backdrop → transparent. Only white that touches the edge is removed, and the soft shadow fades out. */
async function cutOut(bin) {
  const W = 640;
  const { data } = await sharp(bin).resize(W, W, { fit: "cover" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const light = (i) => Math.min(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
  // Backdrop and shadow are neutral (no colour); the brass and amethyst highlights are not, so they stay.
  // The backdrop is rarely pure white, so measure it from the four corners.
  const corners = [0, W - 1, W * (W - 1), W * W - 1].flatMap((c) => [c, c + (c % W ? -3 : 3)]).map(light).sort((a, b) => a - b);
  const bg = corners[corners.length >> 1];
  const backdrop = (i) => light(i) >= bg - 80 && Math.max(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]) - light(i) <= 14;
  const seen = new Uint8Array(W * W);
  const stack = [];
  for (let x = 0; x < W; x++) stack.push(x, (W - 1) * W + x);
  for (let y = 0; y < W; y++) stack.push(y * W, y * W + W - 1);
  while (stack.length) {
    const i = stack.pop();
    if (seen[i] || !backdrop(i)) continue;
    seen[i] = 1;
    const x = i % W;
    if (x > 0) stack.push(i - 1);
    if (x < W - 1) stack.push(i + 1);
    if (i >= W) stack.push(i - W);
    if (i < W * (W - 1)) stack.push(i + W);
  }
  for (let i = 0; i < W * W; i++) {
    if (!seen[i]) continue;
    const dark = bg - light(i); // 0 = backdrop, larger = the soft shadow under the icon
    data[i * 4 + 3] = dark < 14 ? 0 : Math.min(110, (dark - 14) * 2.2);
    if (dark >= 14) data[i * 4] = data[i * 4 + 1] = data[i * 4 + 2] = 36; // shadow becomes a neutral plum-black veil
  }
  return sharp(data, { raw: { width: W, height: W, channels: 4 } }).trim().resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).webp({ quality: 88 }).toBuffer();
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(RAW, { recursive: true });
  const only = process.argv[2] === "--recut" ? undefined : process.argv[2];
  if (process.argv[2] === "--recut") {
    for (const f of await fs.readdir(RAW)) await fs.writeFile(path.join(OUT, f.replace(".png", ".webp")), await cutOut(await fs.readFile(path.join(RAW, f))));
    return console.log("re-cut every saved render");
  }
  const todo = ICONS.filter((i) => (only ? i.key === only : !existsSync(path.join(OUT, `${i.key}.webp`))));
  let failed = 0;
  for (let n = 0; n < todo.length; n += 6) {
    const results = await Promise.allSettled(
      todo.slice(n, n + 6).map(async (icon) => {
        const url = await waitFor(await createTask(icon), icon.key);
        const raw = Buffer.from(await (await fetch(url)).arrayBuffer());
        await fs.writeFile(path.join(RAW, `${icon.key}.png`), raw);
        const out = await cutOut(raw);
        await fs.writeFile(path.join(OUT, `${icon.key}.webp`), out);
        console.log(`saved ${icon.key}.webp (${Math.round(out.length / 1024)} KB)`);
      }),
    );
    for (const r of results) if (r.status === "rejected") (failed++, console.error(String(r.reason)));
  }
  process.exit(failed ? 1 : 0);
}

main();
