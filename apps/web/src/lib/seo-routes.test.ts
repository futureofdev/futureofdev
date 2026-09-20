import assert from "node:assert/strict";
import test from "node:test";
import { GET as sitemap } from "../pages/sitemap.xml";
import { GET as rss } from "../pages/rss.xml";

const locals = { runtime: { env: { BEEHIIV_API_KEY: "test", BEEHIIV_PUBLICATION_ID: "pub_test" } } };
const post = { id: "post_1", slug: "checks-&-evidence", title: "Checks & <evidence>", subtitle: "A < B & C", status: "confirmed", audience: "free", platform: "both", publish_date: 1_700_000_000, authors: ["Luke Hennerley"] };

test("feeds signal an upstream outage rather than publish an empty successful feed", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new Error("offline"); });
  for (const route of [sitemap, rss]) {
    const response = await route({ locals } as never);
    assert.equal(response.status, 503);
    assert.match(response.headers.get("Cache-Control") ?? "", /no-store/);
    assert.equal(response.headers.get("Retry-After"), "60");
  }
});

test("sitemap retains the 101st published article and safely encodes slugs", async (t) => {
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request) => {
    const page = new URL(String(input)).searchParams.get("page") ?? "1";
    return Response.json({ data: page === "1" ? Array.from({ length: 100 }, (_, i) => ({ ...post, id: `p${i}`, slug: `edition-${i}` })) : [post], page: Number(page), total_pages: 2 });
  });
  const response = await sitemap({ locals } as never);
  assert.equal(response.status, 200);
  const xml = await response.text();
  assert.match(xml, /https:\/\/futureofdev.com\/insights\/checks-%26-evidence/);
  assert.equal((xml.match(/<url>/g) ?? []).length, 107);
});

test("RSS escapes teaching content and does not label a name as an email address", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ data: [post], page: 1, total_pages: 1 }));
  const xml = await (await rss({ locals } as never)).text();
  assert.match(xml, /Checks &amp; &lt;evidence&gt;/);
  assert.match(xml, /<dc:creator>Luke Hennerley<\/dc:creator>/);
  assert.doesNotMatch(xml, /<author>/);
});
