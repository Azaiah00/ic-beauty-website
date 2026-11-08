/**
 * Submission storage. Server-only.
 *
 * Production: Netlify Blobs (built into every Netlify site, no extra account or setup).
 * Local dev / any environment without Blobs: JSON files under .data/ (or /tmp on a read-only host),
 * so the whole flow can be tested end to end without Netlify.
 *
 * Keys are `${form}/${id}` and ids start with a sortable timestamp, so a prefix listing is chronological.
 */
import { getStore } from "@netlify/blobs";
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export type Status = string;

export type Submission = {
  id: string;
  form: string;
  createdAt: string;
  updatedAt: string;
  status: Status;
  notes: string;
  name: string;
  email: string;
  phone: string;
  data: Record<string, string>;
  /** What happened downstream (confirmation email, owner alert, Square sync). */
  log: { at: string; step: string; ok: boolean; detail?: string }[];
};

const STORE = "submissions";

type Backend = {
  set(key: string, value: Submission): Promise<void>;
  get(key: string): Promise<Submission | null>;
  list(prefix: string): Promise<string[]>;
};

function blobsBackend(): Backend | null {
  try {
    const s = getStore({ name: STORE, consistency: "strong" });
    return {
      set: async (k, v) => {
        await s.setJSON(k, v);
      },
      get: async (k) => ((await s.get(k, { type: "json" })) as Submission | null) ?? null,
      list: async (prefix) => {
        const { blobs } = await s.list({ prefix });
        return blobs.map((b) => b.key);
      },
    };
  } catch {
    return null; // MissingBlobsEnvironmentError outside Netlify
  }
}

function fileBackend(): Backend {
  const base = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME ? "/tmp/icb-data" : path.join(process.cwd(), ".data");
  const root = path.join(base, STORE);
  const file = (k: string) => path.join(root, `${k.replace(/\//g, "__")}.json`);
  return {
    set: async (k, v) => {
      await fs.mkdir(root, { recursive: true });
      await fs.writeFile(file(k), JSON.stringify(v, null, 2));
    },
    get: async (k) => {
      try {
        return JSON.parse(await fs.readFile(file(k), "utf8")) as Submission;
      } catch {
        return null;
      }
    },
    list: async (prefix) => {
      try {
        const names = await fs.readdir(root);
        return names
          .filter((n) => n.endsWith(".json"))
          .map((n) => n.slice(0, -5).replace(/__/g, "/"))
          .filter((k) => k.startsWith(prefix));
      } catch {
        return [];
      }
    },
  };
}

let cached: { backend: Backend; kind: "blobs" | "file" } | null = null;
export function backend() {
  if (!cached) {
    const b = blobsBackend();
    cached = b ? { backend: b, kind: "blobs" } : { backend: fileBackend(), kind: "file" };
  }
  return cached;
}

export function newId(now = new Date()) {
  const ts = now.toISOString().replace(/[-:.TZ]/g, "").slice(0, 17); // yyyymmddhhmmssmmm
  return `${ts}-${crypto.randomBytes(3).toString("hex")}`;
}

const key = (form: string, id: string) => `${form}/${id}`;

export async function saveSubmission(s: Submission) {
  await backend().backend.set(key(s.form, s.id), s);
}

export async function getSubmission(form: string, id: string) {
  return backend().backend.get(key(form, id));
}

export async function updateSubmission(form: string, id: string, patch: (s: Submission) => Submission) {
  const cur = await getSubmission(form, id);
  if (!cur) return null;
  const next = { ...patch(cur), updatedAt: new Date().toISOString() };
  await saveSubmission(next);
  return next;
}

/** Newest first. Pass a form name, or nothing for every form. */
export async function listSubmissions(form?: string): Promise<Submission[]> {
  const b = backend().backend;
  const keys = (await b.list(form ? `${form}/` : "")).sort().reverse();
  const rows = await Promise.all(keys.map((k) => b.get(k)));
  return rows.filter((r): r is Submission => !!r);
}
