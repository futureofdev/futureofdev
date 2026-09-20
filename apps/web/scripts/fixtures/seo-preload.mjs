// Only loaded by check-seo-rendered.ts in its child development server.
import { readFileSync } from "node:fs";
const originalFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
  if (url.hostname !== "api.beehiiv.com") return originalFetch(input, init);
  if (init?.method && init.method !== "GET") throw new Error("SEO fixtures forbid subscriber mutations");
  if (!url.pathname.startsWith("/v2/publications/pub_seo_fixture/posts")) throw new Error("Unexpected fixture API path");
  const mode = readFileSync(process.env.SEO_FIXTURE_STATE, "utf8").trim();
  const slug = url.searchParams.get("slugs[]");
  if (mode === "outage" || slug === "upstream-unavailable") return new Response("Unavailable", { status: 503 });
  const posts = mode === "empty" ? [] : Array.from({ length: 105 }, (_, i) => ({
    id: `post_${i}`, slug: `exercise-${i}`, title: `Exercise ${i}: Check & learn`,
    subtitle: "Compare A < B and keep evidence.", authors: ["Luke Hennerley", "Guest Teacher"],
    status: "confirmed", audience: "free", platform: "both", hidden_from_feed: false,
    enforce_gated_content: false, publish_date: 1_700_000_000 - i * 86400,
    content_tags: i === 0 ? ["coding-bootcamp-in-a-box"] : [],
    content: { free: { web: "<h2>Try a small example</h2><p>Check a result against the source.</p>" } },
  }));
  const page = Number(url.searchParams.get("page") ?? "1");
  const limit = Number(url.searchParams.get("limit") ?? "25");
  const selected = slug ? posts.filter((post) => post.slug === slug) : posts;
  return Response.json({ data: selected.slice((page - 1) * limit, page * limit),
    page, limit, total_results: selected.length, total_pages: Math.ceil(selected.length / limit) });
};
