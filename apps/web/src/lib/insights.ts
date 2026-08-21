import legacyPostData from "../content/legacy-insights/skill-based-learning.json";
import { getBeehiivConfig, getPostBySlug, listPosts, type BeehiivPost } from "./beehiiv";
import { portableBlocksToHtml, portableText, type PortableBlock } from "./portable-content";
import { sanitizeArticleHtml } from "./sanitize";

export interface InsightSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author: string;
  tags: string[];
  image?: string;
  source: "beehiiv" | "legacy";
}

export interface InsightDetail extends InsightSummary {
  html: string;
  readingMinutes: number;
}

interface LegacyPost {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  author?: { name?: string };
  categories?: Array<{ title?: string }>;
  body?: PortableBlock[];
}

const legacyPost = legacyPostData as LegacyPost;

function isoFromTimestamp(value?: number | null): string {
  const milliseconds = (value ?? 0) * 1000;
  return new Date(milliseconds || Date.now()).toISOString();
}

function isPublished(post: BeehiivPost): boolean {
  const publishTime = post.publish_date ?? post.displayed_date ?? post.created ?? 0;
  return post.status === "confirmed" && publishTime * 1000 <= Date.now();
}

function summaryFromBeehiiv(post: BeehiivPost): InsightSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.subtitle || post.preview_text || "Read the latest Future of Dev edition.",
    publishedAt: isoFromTimestamp(post.displayed_date ?? post.publish_date ?? post.created),
    author: post.authors?.join(", ") || "Future of Dev",
    tags: post.content_tags ?? [],
    image: post.thumbnail_url || undefined,
    source: "beehiiv",
  };
}

function summaryFromLegacy(post: LegacyPost): InsightSummary {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    author: post.author?.name || "Future of Dev",
    tags: post.categories?.flatMap((category) => category.title ? [category.title] : []) ?? [],
    source: "legacy",
  };
}

export function listLegacyInsights(): InsightSummary[] {
  return [summaryFromLegacy(legacyPost)];
}

export async function listPublishedInsights(locals: unknown, limit = 25): Promise<InsightSummary[]> {
  const config = getBeehiivConfig(locals);
  let beehiiv: InsightSummary[] = [];
  if (config) {
    try {
      beehiiv = (await listPosts(config, {
        limit,
        status: "confirmed",
        audience: "free",
        platform: "all",
      }))
        .filter(isPublished)
        .map(summaryFromBeehiiv);
    } catch {
      // Keep the repository-owned archive, sitemap and RSS available during an
      // upstream outage. Do not log request details or upstream response text.
      console.error("Beehiiv insight listing unavailable");
    }
  }

  return [...beehiiv, ...listLegacyInsights()]
    .filter((post, index, all) => all.findIndex((candidate) => candidate.slug === post.slug) === index)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, limit);
}

export async function getInsightBySlug(locals: unknown, slug: string): Promise<InsightDetail | null> {
  if (slug === legacyPost.slug) {
    const text = portableText(legacyPost.body);
    return {
      ...summaryFromLegacy(legacyPost),
      html: portableBlocksToHtml(legacyPost.body),
      readingMinutes: Math.max(1, Math.ceil(text.split(/\s+/).length / 220)),
    };
  }

  const config = getBeehiivConfig(locals);
  if (!config) return null;
  const post = await getPostBySlug(config, slug);
  if (!post || !isPublished(post) || post.audience === "premium") return null;
  const html = sanitizeArticleHtml(post.content?.free?.web ?? "");
  const words = html.replace(/<[^>]+>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return {
    ...summaryFromBeehiiv(post),
    html,
    readingMinutes: Math.max(1, Math.ceil(words / 220)),
  };
}
