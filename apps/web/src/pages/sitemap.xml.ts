import type { APIRoute } from "astro";
import { listPublishedInsights } from "../lib/insights";

export const prerender = false;

const staticPaths = ["/", "/insights", "/learning", "/learning/coding-bootcamp-in-a-box", "/about", "/privacy"];

export const GET: APIRoute = async ({ locals }) => {
  const posts = await listPublishedInsights(locals, 100);
  const urls: Array<{ path: string; modified?: string }> = [
    ...staticPaths.map((path) => ({ path })),
    ...posts.map((post) => ({ path: `/insights/${post.slug}`, modified: post.publishedAt })),
  ];
  const body = urls.map(({ path, modified }) => `
  <url>
    <loc>https://futureofdev.com${path}</loc>${modified ? `
    <lastmod>${new Date(modified).toISOString()}</lastmod>` : ""}
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
