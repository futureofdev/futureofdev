import assert from "node:assert/strict";
import test from "node:test";
import { getPublicationEngagements } from "./beehiiv";

const config = {
  apiKey: "test-key",
  publicationId: "pub_00000000-0000-0000-0000-000000000000",
};

test("Beehiiv engagement adapter uses bounded documented query parameters", async () => {
  const originalFetch = globalThis.fetch;
  let requested = "";
  globalThis.fetch = async (input) => {
    requested = String(input);
    return Response.json({ data: [{
      date: "2026-08-10",
      total_opens: 10,
      unique_opens: 8,
      total_clicks: 5,
      total_verified_clicks: 4,
      unique_clicks: 3,
      unique_verified_clicks: 2,
    }] });
  };
  try {
    const rows = await getPublicationEngagements(config, {
      startDate: "2026-08-10",
      numberOfDays: 7,
      emailType: "post",
    });
    assert.equal(rows.length, 1);
    const url = new URL(requested);
    assert.equal(url.searchParams.get("start_date"), "2026-08-10");
    assert.equal(url.searchParams.get("number_of_days"), "7");
    assert.equal(url.searchParams.get("email_type"), "post");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Beehiiv engagement adapter rejects invalid periods before fetch", async () => {
  await assert.rejects(
    getPublicationEngagements(config, { startDate: "10/08/2026", numberOfDays: 7 }),
    /YYYY-MM-DD/,
  );
  await assert.rejects(
    getPublicationEngagements(config, { startDate: "2026-08-10", numberOfDays: 32 }),
    /between 1 and 31/,
  );
});
