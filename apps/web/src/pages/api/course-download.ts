import type { APIRoute } from "astro";
import { createCourseZip } from "../../lib/course";
import { verifyCourseDownloadToken } from "../../lib/course-token";
import { getRuntimeEnv } from "../../lib/beehiiv";

export const prerender = false;

export const GET: APIRoute = async ({ url, locals }) => {
  const token = url.searchParams.get("token");
  const env = getRuntimeEnv(locals);
  const secret = env.COURSE_DOWNLOAD_SECRET ?? import.meta.env.COURSE_DOWNLOAD_SECRET;
  if (!token || token.length > 1_000 || !secret || !(await verifyCourseDownloadToken(token, secret))) {
    return new Response("This download link is invalid or has expired.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "private, no-store" },
    });
  }

  const archive = createCourseZip();
  const body = new Uint8Array(archive.byteLength);
  body.set(archive);
  return new Response(body.buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="future-of-dev-coding-bootcamp-in-a-box.zip"',
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
