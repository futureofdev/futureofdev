import assert from "node:assert/strict";
import test from "node:test";
import { getInsightBySlug, listPublishedInsights } from "./insights";

const locals = {
  runtime: { env: { BEEHIIV_API_KEY: "test", BEEHIIV_PUBLICATION_ID: "pub_test" } },
};

test("insight listings stay empty during a Beehiiv outage", async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  console.error = () => undefined;
  globalThis.fetch = async () => { throw new Error("upstream unavailable"); };
  try {
    assert.deepEqual(await listPublishedInsights(locals), []);
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
  assert.deepEqual(await listPublishedInsights(unconfigured), []);
  assert.equal(await getInsightBySlug(unconfigured, "skill-based-learning"), null);
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
