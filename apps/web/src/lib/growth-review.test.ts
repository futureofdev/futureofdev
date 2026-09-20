import assert from "node:assert/strict";
import test from "node:test";
import {
  aggregateBeehiivEngagements,
  aggregateSearchConsole,
  assertPrivacySafe,
  buildWeeklyGrowthReport,
  mostRecentCompleteWeek,
} from "./growth-review";

test("uses the most recent complete London Monday-to-Sunday week", () => {
  assert.deepEqual(
    mostRecentCompleteWeek(new Date("2026-08-21T10:00:00Z")),
    { start: "2026-08-10", end: "2026-08-16" },
  );
});

test("normalises Beehiiv and Search Console aggregate metrics", () => {
  assert.deepEqual(aggregateBeehiivEngagements([
    {
      date: "2026-08-10",
      total_opens: 12,
      unique_opens: 10,
      total_clicks: 7,
      total_verified_clicks: 6,
      unique_clicks: 5,
      unique_verified_clicks: 4,
    },
    {
      date: "2026-08-11",
      total_opens: 8,
      unique_opens: 7,
      total_clicks: 5,
      total_verified_clicks: 4,
      unique_clicks: 3,
      unique_verified_clicks: 3,
    },
  ]), {
    beehiivUniqueOpens: 17,
    beehiivVerifiedClicks: 10,
    beehiivDailyUniqueVerifiedClicksSum: 7,
  });

  assert.deepEqual(aggregateSearchConsole([
    { clicks: 4, impressions: 100, position: 10 },
    { clicks: 6, impressions: 300, position: 20 },
  ]), {
    searchClicks: 10,
    searchImpressions: 400,
    searchCtr: 0.025,
    searchAveragePosition: 17.5,
  });
});

test("rejects private fields and renders an aggregate-only report", () => {
  assert.throws(() => assertPrivacySafe({ subscriberEmail: "reader@example.com" }), /forbidden|email/i);
  const report = buildWeeklyGrowthReport({
    current: {
      period: { start: "2026-08-10", end: "2026-08-16" },
      sources: ["posthog", "beehiiv"],
      missingSources: ["search-console", "linkedin"],
      metrics: { qualifiedVisits: 100, newsletterSignups: 10, newsletterSignupRate: 0.1 },
      notes: ["Search Console data was not supplied."],
    },
  });
  assert.match(report, /Weekly Activated Readers: \*\*not computable\*\*/);
  assert.match(report, /10\.0%/);
  assert.match(report, /search-console, linkedin/);
});
