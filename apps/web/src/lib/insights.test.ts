import assert from "node:assert/strict";
import test from "node:test";
import { getInsightBySlug, listPublishedInsights } from "./insights";

const locals = {
  runtime: { env: { BEEHIIV_API_KEY: "test", BEEHIIV_PUBLICATION_ID: "pub_test" } },
};

test("insight listing failures stay distinguishable from an empty publication", async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  console.error = () => undefined;
  globalThis.fetch = async () => { throw new Error("upstream unavailable"); };
  try {
    await assert.rejects(listPublishedInsights(locals));
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});

test("an empty Beehiiv publication exposes no legacy editions or article", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ data: [] }));
  assert.deepEqual(await listPublishedInsights(locals), []);
  assert.equal(await getInsightBySlug(locals, "skill-based-learning"), null);
});

test("missing Beehiiv configuration exposes no legacy editions", async () => {
  const unconfigured = {
    runtime: { env: { BEEHIIV_API_KEY: "", BEEHIIV_PUBLICATION_ID: "" } },
  };
  await assert.rejects(listPublishedInsights(unconfigured));
  await assert.rejects(getInsightBySlug(unconfigured, "skill-based-learning"));
});

test("published Beehiiv content is the only edition source, including historic slugs", async (t) => {
  const post = {
    id: "post_test",
    slug: "skill-based-learning",
    title: "A new Beehiiv edition",
    status: "confirmed",
    audience: "free",
    publish_date: 1_700_000_000,
    content: { free: { web: "<p>New edition content.</p>" } },
  };
  t.mock.method(globalThis, "fetch", async () => Response.json({ data: [post] }));
  const summaries = await listPublishedInsights(locals);
  assert.equal(summaries.length, 1);
  assert.equal(summaries[0]?.title, post.title);
  assert.equal(summaries[0]?.source, "beehiiv");
  const detail = await getInsightBySlug(locals, post.slug);
  assert.equal(detail?.title, post.title);
  assert.equal(detail?.html, post.content.free.web);
});

test("Beehiiv's default thumbnail is not rendered as an article image", async (t) => {
  const post = {
    id: "post_default_image",
    slug: "default-image",
    title: "No authored image",
    status: "confirmed",
    audience: "free",
    platform: "both",
    publish_date: 1_700_000_000,
    thumbnail_url: "https://beehiiv-images-production.s3.amazonaws.com/static_assets/defaults/landscape_thumbnail.png",
    content: { free: { web: "<p>Article content.</p>" } },
  };
  t.mock.method(globalThis, "fetch", async () => Response.json({ data: [post] }));

  const detail = await getInsightBySlug(locals, post.slug);
  assert.equal(detail?.image, undefined);
});


test("public listings exclude email-only, gated, hidden, draft and future editions", async (t) => {
  const base = { id: "post", slug: "public", title: "Public", status: "confirmed", audience: "free", platform: "both", publish_date: 1_700_000_000 };
  const data = [base, { ...base, slug: "email", platform: "email" }, { ...base, slug: "paid", audience: "premium" }, { ...base, slug: "hidden", hidden_from_feed: true }, { ...base, slug: "gated", enforce_gated_content: true }, { ...base, slug: "draft", status: "draft" }, { ...base, slug: "future", publish_date: 9_000_000_000 }];
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const slug = new URL(String(input)).searchParams.get("slugs[]");
    return Response.json({ data: slug ? data.filter((p) => p.slug === slug) : data, page: 1, total_pages: 1 });
  });
  assert.deepEqual((await listPublishedInsights(locals)).map((p) => p.slug), ["public"]);
  assert.equal(await getInsightBySlug(locals, "email"), null);
});

test("limited listings and the full archive agree on the most recent displayed edition", async (t) => {
  const posts = Array.from({ length: 101 }, (_, i) => ({
    id: `p${i}`, slug: `p${i}`, title: `Edition ${i}`, status: "confirmed", audience: "free", platform: "both",
    publish_date: 1_700_000_000 - i, displayed_date: i === 100 ? 1_710_000_000 : 1_700_000_000 - i,
  }));
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const url = new URL(String(input));
    const key = url.searchParams.get("order_by") === "displayed_date" ? "displayed_date" : "publish_date";
    const page = Number(url.searchParams.get("page") ?? 1);
    const data = [...posts].sort((a, b) => b[key] - a[key]).slice((page - 1) * 100, page * 100);
    return Response.json({ data, page, total_pages: 2 });
  });
  assert.equal((await listPublishedInsights(locals, 4))[0]?.slug, "p100");
});
