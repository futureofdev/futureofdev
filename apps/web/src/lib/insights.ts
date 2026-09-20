import { getBeehiivConfig, getPostBySlug, listPostPage, type BeehiivPost } from "./beehiiv";
import { sanitizeArticleHtml } from "./sanitize";

export interface InsightSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  authors: string[];
  tags: string[];
  image?: string;
  source: "beehiiv";
}

export interface InsightDetail extends InsightSummary {
  html: string;
  readingMinutes: number;
}

function isoFromTimestamp(value?: number | null): string {
  const milliseconds = (value ?? 0) * 1000;
  return new Date(milliseconds || Date.now()).toISOString();
}

function isPublished(post: BeehiivPost): boolean {
  const publishTime = post.publish_date ?? post.displayed_date ?? post.created ?? 0;
  return post.status === "confirmed" && Number.isFinite(publishTime) && publishTime > 0 &&
    publishTime * 1000 <= Date.now() && post.audience !== "premium" &&
    post.platform !== "email" && !post.hidden_from_feed && !post.enforce_gated_content;
}

function summaryFromBeehiiv(post: BeehiivPost): InsightSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.subtitle || post.preview_text || "Read the latest Future of Dev edition.",
    publishedAt: isoFromTimestamp(post.displayed_date ?? post.publish_date ?? post.created),
    author: post.authors?.filter(Boolean).join(", ") || "Future of Dev",
    authors: post.authors?.filter(Boolean) ?? [],
    tags: post.content_tags ?? [],
    image: post.thumbnail_url || undefined,
    source: "beehiiv",
  };
}

export async function listPublishedInsights(locals: unknown, limit = 25): Promise<InsightSummary[]> {
  const config = getBeehiivConfig(locals);
  if (!config) throw new Error("Edition service is not configured");
  const found = new Map<string, InsightSummary>();
  // Fetch pages of public candidates, then apply the publication rules locally.
  // Never turn an upstream failure into a successful empty archive.
  for (let page = 1; ; page++) {
    if (page > 1000) throw new Error("Edition pagination limit exceeded");
    const result = await listPostPage(config, {
      limit: 100, page, status: "confirmed", audience: "free", platform: "all", order_by: "displayed_date",
    });
    const posts = result.data!;
    for (const post of posts.filter(isPublished)) {
      found.set(post.slug, summaryFromBeehiiv(post));
    }
    if (found.size >= limit || posts.length === 0 ||
        (result.total_pages !== undefined ? page >= result.total_pages : posts.length < 100)) break;
  }
  return [...found.values()]
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit);
}

export function listAllPublishedInsights(locals: unknown): Promise<InsightSummary[]> {
  return listPublishedInsights(locals, Infinity);
}

export async function getInsightBySlug(locals: unknown, slug: string): Promise<InsightDetail | null> {
  const config = getBeehiivConfig(locals);
  if (!config) throw new Error("Edition service is not configured");
  const post = await getPostBySlug(config, slug);
  if (!post || post.slug !== slug || !isPublished(post)) return null;
  const html = sanitizeArticleHtml(post.content?.free?.web ?? "");
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return {
    ...summaryFromBeehiiv(post),
    html,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
  };
}
