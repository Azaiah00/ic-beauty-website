/**
 * The one place the site opens a Netlify Blobs store. Server-only.
 *
 * Why this file exists: inside the Next.js server every fetch() response is a shared copy. When
 * @netlify/blobs gets a "not found" (or any error) answer it throws the body away with body.cancel(),
 * and on a shared copy that call never finishes. The result was a page that waited forever the first
 * time it looked up a key that didn't exist yet (the owner dashboard and the community both did).
 *
 * The fix: hand the library its own fetch. Anything that isn't a plain 200 is read to the end and
 * passed on as a fresh, private response, so cancelling it returns straight away.
 */
import { getStore } from "@netlify/blobs";

const NO_BODY = new Set([101, 204, 205, 304]);

const blobFetch: typeof fetch = async (input, init) => {
  const res = await fetch(input, init);
  if (res.status === 200) return res;
  const body = NO_BODY.has(res.status) ? null : await res.arrayBuffer().catch(() => null);
  return new Response(body && body.byteLength ? body : null, { status: res.status, statusText: res.statusText, headers: res.headers });
};

/** Throws MissingBlobsEnvironmentError outside Netlify; callers fall back to local files. */
export const blobStore = (name: string) => getStore({ name, consistency: "strong", fetch: blobFetch });
