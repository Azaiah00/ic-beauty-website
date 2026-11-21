import { NextResponse } from "next/server";

/**
 * 303 redirect to a path on THIS site, sent as a relative Location so the browser stays on the host it's on.
 * (On Netlify, `req.url` can carry the deploy's own *.netlify.app host; building an absolute URL from it sent
 * people to that host, where they aren't signed in.)
 */
export function seeOther(path: string) {
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}
