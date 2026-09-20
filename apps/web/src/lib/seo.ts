import type { InsightSummary } from "./insights";

export const SITE_ORIGIN = "https://futureofdev.com";
export const ORGANIZATION_ID = `${SITE_ORIGIN}/#organization`;
export const FOUNDER_ID = `${SITE_ORIGIN}/about#luke-hennerley`;
export const ARCHIVE_PAGE_SIZE = 20;

export function canonicalUrl(path: string): string {
  const url = new URL(path, SITE_ORIGIN);
  url.protocol = "https:";
  url.host = "futureofdev.com";
  url.search = "";
  url.hash = "";
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return url.href;
}

export function insightPath(slug: string): string {
  return `/insights/${encodeURIComponent(slug)}`;
}

export function archivePath(page: number): string {
  return page === 1 ? "/insights" : `/insights/page/${page}`;
}

export function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function temporarilyUnavailable(): Response {
  return new Response("Editions are temporarily unavailable. Please try again shortly.", {
    status: 503,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "Retry-After": "60" },
  });
}

export const founderSchema = {
  "@context": "https://schema.org", "@type": "Person", "@id": FOUNDER_ID,
  name: "Luke Hennerley", url: `${SITE_ORIGIN}/about#luke-hennerley`,
  sameAs: ["https://www.linkedin.com/in/luke-hennerley-49204953/"],
};

export function articleSchema(post: InsightSummary) {
  return {
    "@context": "https://schema.org", "@type": "Article",
    "@id": `${canonicalUrl(insightPath(post.slug))}#article`,
    headline: post.title, description: post.excerpt, datePublished: post.publishedAt,
    mainEntityOfPage: canonicalUrl(insightPath(post.slug)),
    author: post.authors.length ? post.authors.map((name) => name === "Luke Hennerley"
      ? { "@type": "Person", "@id": FOUNDER_ID, name, url: `${SITE_ORIGIN}/about#luke-hennerley` }
      : name === "Future of Dev" ? { "@type": "Organization", "@id": ORGANIZATION_ID, name }
        : { "@type": "Person", name })
      : { "@type": "Organization", "@id": ORGANIZATION_ID, name: "Future of Dev" },
    publisher: { "@id": ORGANIZATION_ID },
    ...(post.image ? { image: post.image } : {}),
  };
}

export interface Breadcrumb { name: string; path: string }
export function breadcrumbSchema(items: Breadcrumb[]) {
  return { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1,
      name: item.name, item: canonicalUrl(item.path) })) };
}
