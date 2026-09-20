import type { APIRoute } from "astro";
import { listAllPublishedInsights } from "../lib/insights";

import { canonicalUrl, escapeXml, insightPath, temporarilyUnavailable } from "../lib/seo";

export const prerender = false;

const staticPaths = ["/", "/insights", "/learning", "/learning/coding-bootcamp-in-a-box", "/about", "/privacy"];

export const GET: APIRoute = async ({ locals }) => {
  let posts;
  try { posts = await listAllPublishedInsights(locals); }
  catch { return temporarilyUnavailable(); }
  // Beehiiv's displayed/published date is not a verified modification date.
  const paths = [
    ...staticPaths,
    ...posts.map((post) => insightPath(post.slug)),
  ];
  const body = paths.map((path) => `
  <url>
    <loc>${escapeXml(canonicalUrl(path))}</loc>
  </url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>`, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400, stale-if-error=604800",
    },
  });
};
