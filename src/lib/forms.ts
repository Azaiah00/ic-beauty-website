/**
 * Client-side form submit. Every form on the site calls this.
 * Primary: POST /api/submit (saves the submission, emails the person + Iisha, syncs to Square).
 * Backup: Netlify Forms (/__forms.html), tried only if the API is unreachable.
 */
import { isDemoActive } from "./demo";

export async function submitForm(formName: string, data: Record<string, string>) {
  // Presenter demo (/demo): pretend success, never create a real submission.
  if (isDemoActive()) {
    await new Promise((r) => setTimeout(r, 450));
    return true;
  }
  try {
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ form: formName, data }),
    });
    if (res.ok) return true;
    if (res.status === 422) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      throw new FormError(j.error || "Please check the form and try again.");
    }
  } catch (e) {
    if (e instanceof FormError) throw e;
  }
  // Backup path.
  const res = await fetch("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ "form-name": formName, ...data }).toString(),
  });
  if (!res.ok) throw new Error(`Form submit failed: ${res.status}`);
  return true;
}

export class FormError extends Error {}

export function formToObject(form: HTMLFormElement) {
  const fd = new FormData(form);
  const out: Record<string, string> = {};
  fd.forEach((v, k) => {
    out[k] = out[k] ? `${out[k]}, ${String(v)}` : String(v);
  });
  return out;
}
