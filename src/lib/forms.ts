/**
 * Netlify Forms (works with the Next.js runtime on Netlify).
 * Every form posted here MUST also be declared in /public/__forms.html so Netlify detects it at deploy.
 * Submissions appear in Netlify → Forms; set email notifications to icbeautyinyou@gmail.com.
 * Swap-later seam: replace this function to send to a CRM (e.g. GoHighLevel) without touching any UI.
 */
export async function submitForm(formName: string, data: Record<string, string>) {
  const body = new URLSearchParams({ "form-name": formName, ...data }).toString();
  const res = await fetch("/__forms.html", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) throw new Error(`Form submit failed: ${res.status}`);
  return true;
}

export function formToObject(form: HTMLFormElement) {
  const fd = new FormData(form);
  const out: Record<string, string> = {};
  fd.forEach((v, k) => {
    out[k] = out[k] ? `${out[k]}, ${String(v)}` : String(v);
  });
  return out;
}
