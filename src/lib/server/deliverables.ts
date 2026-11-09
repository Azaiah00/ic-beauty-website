/**
 * Deliverables library for the owner dashboard. Server-only.
 *  - Couture House files ship with the site in /private/deliverables (not public: served only to a
 *    signed-in owner through /api/admin/files). Add a file there + a line below to publish it.
 *  - Uploads (by Iisha, or by Couture House from her dashboard) live in Netlify Blobs ("files" store).
 */
import { getStore } from "@netlify/blobs";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type Deliverable = {
  id: string;
  title: string;
  note?: string;
  file: string; // download filename
  type: string; // mime
  size: number;
  group: string;
  date: string; // ISO
  source: "couture" | "upload";
  uploadedBy?: string;
};

export const PRIVATE_DIR = path.join(process.cwd(), "private", "deliverables");

/** Couture House deliverables bundled with the site. Newest groups first. */
const BUNDLED: Omit<Deliverable, "size" | "source">[] = [
  { id: "qr-banner-event.png", title: "QR code: banner & events", note: "Opens icbeautyinyou.com/event (request a complimentary discovery call or get the checklist). High-res PNG.", file: "IC Beauty QR - Banner (event).png", type: "image/png", group: "QR codes", date: "2026-11-08T17:00:00Z" },
  { id: "qr-banner-event.svg", title: "QR code: banner & events (vector)", note: "Same code as a vector SVG for printers and designers.", file: "IC Beauty QR - Banner (event).svg", type: "image/svg+xml", group: "QR codes", date: "2026-11-08T17:00:00Z" },
  { id: "qr-card-links.png", title: "QR code: business card", note: "Opens icbeautyinyou.com/links (everything in one place). High-res PNG.", file: "IC Beauty QR - Business card (links).png", type: "image/png", group: "QR codes", date: "2026-11-08T17:00:00Z" },
  { id: "qr-card-links.svg", title: "QR code: business card (vector)", note: "Same code as a vector SVG for printers and designers.", file: "IC Beauty QR - Business card (links).svg", type: "image/svg+xml", group: "QR codes", date: "2026-11-08T17:00:00Z" },
  { id: "business-card-print-ready.pdf", title: "Business card: print-ready PDF", note: "3.5 × 2 in with 0.125 in bleed, front + back. Send this file to the printer.", file: "IC Beauty - Business Card PRINT-READY.pdf", type: "application/pdf", group: "Business card", date: "2026-11-05T17:00:00Z" },
  { id: "business-card-front.png", title: "Business card: front preview", file: "IC Beauty - Business Card front.png", type: "image/png", group: "Business card", date: "2026-11-05T17:00:00Z" },
  { id: "business-card-back.png", title: "Business card: back preview", file: "IC Beauty - Business Card back.png", type: "image/png", group: "Business card", date: "2026-11-05T17:00:00Z" },
  { id: "banner-preview.jpg", title: "Retractable banner: preview", note: "33 × 81 in event banner.", file: "IC Beauty - Banner preview.jpg", type: "image/jpeg", group: "Event banner", date: "2026-11-05T17:00:00Z" },
  { id: "banner-33x81-proof.pdf", title: "Retractable banner: proof PDF", note: "Proof for approval. The print file is finalized once your original before-and-after photos are in.", file: "IC Beauty - Retractable Banner 33x81 PROOF.pdf", type: "application/pdf", group: "Event banner", date: "2026-11-05T17:00:00Z" },
  { id: "newsletter-nov-2026-preview.png", title: "November newsletter: phone preview", file: "IC Beauty - Newsletter Nov 2026 preview.png", type: "image/png", group: "Newsletter", date: "2026-11-02T17:00:00Z" },
  { id: "square-newsletter-guide.pdf", title: "Guide: send your newsletter with Square", file: "IC Beauty - Send Your Newsletter with Square.pdf", type: "application/pdf", group: "Newsletter", date: "2026-11-02T17:00:00Z" },
  { id: "demo-walkthrough-map.pdf", title: "Website demo walkthrough map", note: "Which links to click to see each funnel and the member portal.", file: "IC Beauty - Demo Walkthrough Map.pdf", type: "application/pdf", group: "Website", date: "2026-10-31T17:00:00Z" },
];

export const MAX_UPLOAD = 4 * 1024 * 1024; // Netlify function request limit is ~6 MB; keep headroom.

function uploads() {
  try {
    return getStore({ name: "files", consistency: "strong" });
  } catch {
    return null;
  }
}
const localDir = () => path.join(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME ? "/tmp" : process.cwd(), ".data", "files");

export async function listDeliverables(): Promise<Deliverable[]> {
  const bundled = await Promise.all(
    BUNDLED.map(async (d) => {
      const size = await fs.stat(path.join(PRIVATE_DIR, d.id)).then((s) => s.size).catch(() => -1);
      return { ...d, size, source: "couture" as const };
    }),
  );
  const up: Deliverable[] = [];
  const s = uploads();
  if (s) {
    const { blobs } = await s.list();
    for (const b of blobs) {
      const m = await s.getMetadata(b.key);
      if (m?.metadata) up.push(m.metadata as unknown as Deliverable);
    }
  } else {
    try {
      for (const f of await fs.readdir(localDir())) if (f.endsWith(".json")) up.push(JSON.parse(await fs.readFile(path.join(localDir(), f), "utf8")));
    } catch {}
  }
  up.sort((a, b) => b.date.localeCompare(a.date));
  return [...up, ...bundled];
}

export async function readDeliverable(id: string): Promise<{ meta: Deliverable; body: Uint8Array } | null> {
  const b = BUNDLED.find((d) => d.id === id);
  if (b) {
    const body = await fs.readFile(path.join(PRIVATE_DIR, b.id)).catch(() => null);
    return body ? { meta: { ...b, size: body.length, source: "couture" }, body: new Uint8Array(body) } : null;
  }
  if (!/^up-[a-z0-9-]+$/.test(id)) return null;
  const s = uploads();
  if (s) {
    const r = await s.getWithMetadata(id, { type: "arrayBuffer" });
    return r ? { meta: r.metadata as unknown as Deliverable, body: new Uint8Array(r.data) } : null;
  }
  try {
    const meta = JSON.parse(await fs.readFile(path.join(localDir(), `${id}.json`), "utf8")) as Deliverable;
    return { meta, body: new Uint8Array(await fs.readFile(path.join(localDir(), id))) };
  } catch {
    return null;
  }
}

export async function saveUpload(file: File, opts: { title: string; note: string; uploadedBy: string }) {
  const id = `up-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
  const meta: Deliverable = {
    id,
    title: opts.title || file.name,
    note: opts.note || undefined,
    file: file.name.replace(/[^\w .()-]/g, "_").slice(0, 120) || "file",
    type: file.type || "application/octet-stream",
    size: file.size,
    group: "Uploads",
    date: new Date().toISOString(),
    source: "upload",
    uploadedBy: opts.uploadedBy,
  };
  const buf = await file.arrayBuffer();
  const s = uploads();
  if (s) await s.set(id, buf, { metadata: meta as unknown as Record<string, unknown> });
  else {
    await fs.mkdir(localDir(), { recursive: true });
    await fs.writeFile(path.join(localDir(), id), Buffer.from(buf));
    await fs.writeFile(path.join(localDir(), `${id}.json`), JSON.stringify(meta));
  }
  return meta;
}

export async function deleteUpload(id: string) {
  if (!/^up-[a-z0-9-]+$/.test(id)) return false;
  const s = uploads();
  if (s) await s.delete(id);
  else {
    await fs.rm(path.join(localDir(), id), { force: true });
    await fs.rm(path.join(localDir(), `${id}.json`), { force: true });
  }
  return true;
}
