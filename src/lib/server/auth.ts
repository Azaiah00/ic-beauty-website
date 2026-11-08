/**
 * Owner-dashboard login. Server-only.
 * Env:
 *   ADMIN_PASSWORD        the dashboard password (set in Netlify → Site configuration → Environment variables)
 *   ADMIN_SESSION_SECRET  any long random string; signs the login cookie (changing it signs everyone out)
 */
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "icb_admin";
const DAYS = 30;

const secret = () => process.env.ADMIN_SESSION_SECRET || "";
export const adminConfigured = () => !!process.env.ADMIN_PASSWORD && secret().length >= 16;

const hmac = (v: string) => crypto.createHmac("sha256", secret()).update(v).digest("base64url");
const same = (a: string, b: string) => {
  const x = crypto.createHash("sha256").update(a).digest();
  const y = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(x, y);
};

export function passwordOk(pw: string) {
  return adminConfigured() && same(pw, process.env.ADMIN_PASSWORD!);
}

export function sessionValue() {
  const exp = String(Date.now() + DAYS * 864e5);
  return { value: `${exp}.${hmac(exp)}`, maxAge: DAYS * 86400 };
}

export function validSession(v: string | undefined) {
  if (!v || !adminConfigured()) return false;
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, hmac(exp));
}

export async function isAdmin() {
  return validSession((await cookies()).get(COOKIE)?.value);
}
