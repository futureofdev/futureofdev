import assert from "node:assert/strict";
import test from "node:test";
import { querySearchConsole } from "./search-console";

test("Search Console adapter uses final read-only aggregate queries", async () => {
  const originalFetch = globalThis.fetch;
  let requestedUrl = "";
  let requestedInit: RequestInit | undefined;
  globalThis.fetch = async (input, init) => {
    requestedUrl = String(input);
    requestedInit = init;
    return Response.json({ rows: [{ keys: ["2026-08-10"], clicks: 4, impressions: 100 }] });
  };
  try {
    const rows = await querySearchConsole({
      accessToken: "private-test-token",
      siteUrl: "sc-domain:futureofdev.com",
      startDate: "2026-08-10",
      endDate: "2026-08-16",
    });
    assert.equal(rows.length, 1);
    assert.match(requestedUrl, /sc-domain%3Afutureofdev\.com\/searchAnalytics\/query$/);
    assert.equal((requestedInit?.headers as Record<string, string>).Authorization, "Bearer private-test-token");
    const body = JSON.parse(String(requestedInit?.body)) as Record<string, unknown>;
    assert.equal(body.dataState, "final");
    assert.equal(body.aggregationType, "auto");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("Search Console adapter validates dates and row bounds before fetch", async () => {
  await assert.rejects(querySearchConsole({
    accessToken: "token",
    siteUrl: "sc-domain:futureofdev.com",
    startDate: "2026-08-17",
    endDate: "2026-08-16",
  }), /startDate/);
  await assert.rejects(querySearchConsole({
    accessToken: "token",
    siteUrl: "sc-domain:futureofdev.com",
    startDate: "2026-08-10",
    endDate: "2026-08-16",
    rowLimit: 25_001,
  }), /rowLimit/);
});
