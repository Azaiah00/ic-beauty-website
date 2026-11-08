import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { adminConfigured, isAdmin } from "@/lib/server/auth";

export const metadata: Metadata = { title: "Owner sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ e?: string }> }) {
  if (await isAdmin()) redirect("/admin");
  const { e } = await searchParams;
  const ready = adminConfigured();
  return (
    <main className="flex min-h-dvh items-center justify-center bg-plum-950 px-4 py-16">
      <form method="post" action="/api/admin/login" className="w-full max-w-sm rounded-card bg-paper p-7 shadow-xl shadow-black/30">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-plum-900 text-bone">
          <Lock className="h-5 w-5" aria-hidden="true" strokeWidth={1.5} />
        </span>
        <h1 className="mt-4 text-center font-display text-[1.8rem] leading-tight text-plum-900">I.C. Beauty owner dashboard</h1>
        <p className="mt-1 text-center text-[0.92rem] text-plum-700">Sign-ups, applications and messages from your website.</p>
        {!ready && (
          <p className="mt-5 rounded-xl bg-mist px-4 py-3 text-[0.88rem] text-plum-800">
            The dashboard password hasn&apos;t been set yet. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET in Netlify, then redeploy.
          </p>
        )}
        <label htmlFor="pw" className="mt-6 block text-[0.8rem] font-medium uppercase tracking-[0.14em] text-plum-800">Password</label>
        <input id="pw" name="password" type="password" required autoComplete="current-password" autoFocus className="mt-2 w-full rounded-xl border border-plum-800/20 bg-white px-4 py-3.5 text-[1rem] text-ink outline-none focus:border-amethyst focus:ring-2 focus:ring-amethyst/20" />
        {e && <p className="mt-3 text-[0.9rem] text-[#b4533c]" role="alert">That password didn&apos;t match. Try again.</p>}
        <button type="submit" className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-pill bg-plum-900 text-[0.8rem] font-medium uppercase tracking-[0.16em] text-bone hover:bg-plum-800">
          Sign in
        </button>
      </form>
    </main>
  );
}
