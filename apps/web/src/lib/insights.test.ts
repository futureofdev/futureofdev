import assert from "node:assert/strict";
import test from "node:test";
import { listPublishedInsights } from "./insights";

test("insight listings fall back to the repository archive during a Beehiiv outage", async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  console.error = () => undefined;
  globalThis.fetch = async () => { throw new Error("upstream unavailable"); };
  try {
    const posts = await listPublishedInsights({
      runtime: { env: { BEEHIIV_API_KEY: "test", BEEHIIV_PUBLICATION_ID: "pub_test" } },
    });
    assert.ok(posts.length >= 1);
    assert.equal(posts[0]?.source, "legacy");
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});
