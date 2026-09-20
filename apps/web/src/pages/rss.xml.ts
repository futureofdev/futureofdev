import type { APIRoute } from "astro";
import { listPublishedInsights } from "../lib/insights";

import { escapeXml, temporarilyUnavailable } from "../lib/seo";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  let posts;
  try { posts = await listPublishedInsights(locals, 100); }
  catch { return temporarilyUnavailable(); }
  const items = posts.map((post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>https://futureofdev.com/insights/${encodeURIComponent(post.slug)}</link>
      <guid isPermaLink="true">https://futureofdev.com/insights/${encodeURIComponent(post.slug)}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
      <dc:creator>${escapeXml(post.author)}</dc:creator>
    </item>`).join("");

  return new Response(`<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Future of Dev</title>
    <link>https://futureofdev.com/insights</link>
    <description>Learn and build the AI-native way.</description>
    <language>en-gb</language>${items}
  </channel>
</rss>`, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=86400, stale-if-error=604800",
    },
  });
};
