import assert from "node:assert/strict";
import test from "node:test";
import { POST as newsletterPost } from "../pages/api/newsletter";
import { GET as unsubscribeGet, POST as unsubscribePost } from "../pages/api/unsubscribe";

const analyticsId = "d9428888-122b-4d75-8b70-f0abf449f6ab";
const locals = {
  runtime: {
    env: {
      BEEHIIV_API_KEY: "test-key",
      BEEHIIV_PUBLICATION_ID: "pub_00000000-0000-0000-0000-000000000000",
      ANALYTICS_ID_SECRET: "test-analytics-secret-with-at-least-32-bytes",
      COURSE_DOWNLOAD_SECRET: "test-course-secret-with-at-least-32-bytes",
    },
  },
};

function newsletterRequest(body: unknown): Request {
  return new Request("https://futureofdev.com/api/newsletter", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "https://futureofdev.com" },
    body: JSON.stringify(body),
  });
}

test("newsletter validates actual body size before contacting Beehiiv", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("fetch should not be called"); };
  try {
    const response = await newsletterPost({
      request: newsletterRequest({
        email: "reader@example.com",
        placement: "test",
        padding: "x".repeat(9_000),
      }),
      locals,
    } as never);
    assert.equal(response.status, 413);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("newsletter returns a stable analytics id only with consent", async () => {
  const originalFetch = globalThis.fetch;
  const requests: Array<{ input: string | URL | Request; init?: RequestInit }> = [];
  const responses = [
    new Response(null, { status: 404 }),
    Response.json({
      data: {
        id: "sub_test",
        email: "reader@example.com",
        status: "active",
        created: 1,
        custom_fields: [{ name: "analytics_id", value: analyticsId }],
      },
    }),
  ];
  globalThis.fetch = async (input, init) => {
    requests.push({ input, init });
    return responses.shift() ?? new Response(null, { status: 500 });
  };
  try {
    const response = await newsletterPost({
      request: newsletterRequest({
        email: "reader@example.com",
        placement: "homepage-hero",
        pageUrl: "https://futureofdev.com/?utm_source=private-value",
        analyticsConsent: true,
        attribution: { utm_source: "linkedin", ignored: "secret" },
      }),
      locals,
    } as never);
    assert.equal(response.status, 200);
    const body = await response.json() as Record<string, unknown>;
    assert.equal(body.analyticsId, analyticsId);
    assert.equal(requests.length, 2);
    const upstream = JSON.parse(String(requests[1]?.init?.body)) as Record<string, unknown>;
    assert.equal(upstream.referring_site, "https://futureofdev.com/");
    assert.equal(upstream.utm_source, "linkedin");
    assert.equal("ignored" in upstream, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("newsletter preserves Beehiiv rate-limit semantics", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json(
    { errors: [{ message: "rate limited" }] },
    { status: 429 },
  );
  try {
    const response = await newsletterPost({
      request: newsletterRequest({ email: "reader@example.com", placement: "homepage-hero" }),
      locals,
    } as never);
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("Retry-After"), "60");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("legacy unsubscribe removes the token from the visible URL and uses a signed cookie", async () => {
  const token = btoa("reader@example.com");
  const getResponse = await unsubscribeGet({
    url: new URL(`https://futureofdev.com/api/unsubscribe?e=${encodeURIComponent(token)}`),
    locals,
  } as never);
  assert.equal(getResponse.status, 303);
  assert.equal(getResponse.headers.get("Location"), "/unsubscribe?status=confirm");
  const cookie = getResponse.headers.get("Set-Cookie") ?? "";
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.doesNotMatch(getResponse.headers.get("Location") ?? "", /reader|token|%40/i);

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({
    data: { id: "sub_test", email: "reader@example.com", status: "inactive", created: 1 },
  });
  try {
    const cookiePair = cookie.split(";", 1)[0]!;
    const request = new Request("https://futureofdev.com/api/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: cookiePair,
        Origin: "https://futureofdev.com",
      },
      body: "",
    });
    const postResponse = await unsubscribePost({ request, locals } as never);
    assert.equal(postResponse.status, 303);
    assert.equal(postResponse.headers.get("Location"), "/unsubscribe?status=success");
    assert.match(postResponse.headers.get("Set-Cookie") ?? "", /Max-Age=0/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
