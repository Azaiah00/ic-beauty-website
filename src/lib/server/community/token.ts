/**
 * Signs the community session cookie (same HMAC approach as the owner dashboard, src/lib/server/auth.ts).
 * No Next.js imports here, so scripts and tests can sign a cookie too.
 *
 * Env: COMMUNITY_SESSION_SECRET (falls back to ADMIN_SESSION_SECRET while the community is in demo mode).
 * // TODO: Auth — Google OAuth via Supabase Auth (or Auth.js) + email magic link; map auth user → Member by
 * // email; keep the approval step. This cookie then carries the real signed-in member id.
 */
import crypto from "node:crypto";

export const COMM_COOKIE = "icb_comm";
export const WHO_COOKIE = "icb_admin_who";
const DAYS = 30;

// The built-in fallback only exists for the demo preview, where anyone may pick any persona anyway.
const secret = () => process.env.COMMUNITY_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || (process.env.NEXT_PUBLIC_COMMUNITY_DEMO !== "0" ? "icb-community-demo-preview-secret" : "");
const hmac = (v: string) => crypto.createHmac("sha256", secret()).update(v).digest("base64url");

export function signMember(memberId: string) {
  const payload = `${memberId}.${Date.now() + DAYS * 864e5}`;
  return { value: `${payload}.${hmac(payload)}`, maxAge: DAYS * 86400 };
}

export function readMember(value: string | undefined): string | null {
  if (!value || !secret()) return null;
  const i = value.lastIndexOf(".");
  if (i < 0) return null;
  const payload = value.slice(0, i);
  const sig = value.slice(i + 1);
  const a = Buffer.from(sig);
  const b = Buffer.from(hmac(payload));
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const j = payload.lastIndexOf(".");
  if (Number(payload.slice(j + 1)) < Date.now()) return null;
  return payload.slice(0, j);
}
