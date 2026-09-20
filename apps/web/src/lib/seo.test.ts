import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../middleware";
import { articleSchema, canonicalUrl, serializeJsonLd } from "./seo";

async function request(url: string, method = "GET") {
  const response = await onRequest({ url: new URL(url), request: new Request(url, { method }), isPrerendered: false } as never,
    async () => new Response("page"));
  assert.ok(response instanceof Response);
  return response;
}

test("canonical redirects combine host, legacy path and slash normalization while retaining UTMs", async () => {
  for (const [url, location] of [
    ["https://futureofdev.com/learning/?utm_source=test", "/learning?utm_source=test"],
    ["http://www.futureofdev.com/claude-academy/coding-bootcamp-in-a-box/?utm_source=test", "https://futureofdev.com/learning/coding-bootcamp-in-a-box?utm_source=test"],
    ["https://futureofdev.com/claude-academy/setting-up-claude-academy/", "/learning/coding-bootcamp-in-a-box#getting-started"],
  ]) {
    const response = await request(url!);
    assert.equal(response.status, 301);
    assert.equal(response.headers.get("Location"), location);
  }
  assert.equal((await request("https://futureofdev.com/learning")).status, 200);
  assert.equal((await request("https://futureofdev.com/api/newsletter/", "POST")).status, 200);
});

test("preview and utility responses are excluded from indexing without hiding production pages", async () => {
  assert.equal((await request("https://preview.futureofdev.pages.dev/learning")).headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal((await request("https://futureofdev.com/api/course-download")).headers.get("X-Robots-Tag"), "noindex, nofollow");
  assert.equal((await request("https://futureofdev.com/learning")).headers.get("X-Robots-Tag"), null);
});

test("canonical and structured data exclude query tokens and safely contain article text", () => {
  assert.equal(canonicalUrl("/learning/?utm_source=test#start"), "https://futureofdev.com/learning");
  const post = { slug: "checks", title: "A </script> example", excerpt: "A < B", publishedAt: "2026-01-01T00:00:00Z", author: "Luke Hennerley, Guest", authors: ["Luke Hennerley", "Guest"], tags: [], source: "beehiiv" as const };
  const schema = articleSchema(post);
  const json = serializeJsonLd(schema);
  assert.ok(!json.includes("</script>"));
  assert.equal(JSON.parse(json).headline, "A </script> example");
  assert.deepEqual(schema.author, [
    { "@type": "Person", "@id": "https://futureofdev.com/about#luke-hennerley", name: "Luke Hennerley", url: "https://futureofdev.com/about#luke-hennerley" },
    { "@type": "Person", name: "Guest" },
  ]);
  assert.equal((articleSchema({ ...post, authors: [] }).author as { "@type": string })["@type"], "Organization");
});

test("slash normalization cannot redirect a browser to another host", async () => {
  const response = await request("https://futureofdev.com//example.org/");
  assert.equal(response.status, 301);
  assert.equal(new URL(response.headers.get("Location")!, "https://futureofdev.com").origin, "https://futureofdev.com");
});
