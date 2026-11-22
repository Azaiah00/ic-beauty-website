/**
 * Spam-bot checks shared by every form. Bots fill names and answers with random mixed-case strings
 * ("WyNcuFSMZUqAKySPJ") and use real people's emails, so letting them through emails strangers.
 * Anything caught here is answered with a normal-looking success and nothing is saved or sent.
 */

/** One long run of letters with several capitals in the middle of it: random text, not a name or a sentence. */
export function looksRandom(value: unknown) {
  const s = String(value ?? "").trim();
  if (!/^[A-Za-z]{8,}$/.test(s)) return false;
  const innerCaps = (s.slice(1).match(/[A-Z]/g) ?? []).length;
  return innerCaps >= 3 && /[a-z]/.test(s);
}

export const anyRandom = (values: unknown[]) => values.some(looksRandom);

/** Forms carry a hidden render time `t` (ms). Real people take a few seconds; bots post instantly or without it. */
export function tooFast(t: unknown, minMs = 3000) {
  const n = Number(t);
  if (!Number.isFinite(n) || n <= 0) return true;
  const age = Date.now() - n;
  return age < minMs || age > 7 * 864e5;
}
