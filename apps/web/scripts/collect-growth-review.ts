import {
  getPublicationEngagements,
  type BeehiivConfig,
} from "../src/lib/beehiiv";
import {
  aggregateBeehiivEngagements,
  aggregateSearchConsole,
  mostRecentCompleteWeek,
  type GrowthMetrics,
  type WeeklyGrowthSnapshot,
} from "../src/lib/growth-review";
import { querySearchConsole } from "../src/lib/search-console";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function daysInclusive(start: string, end: string): number {
  const startTime = Date.parse(`${start}T00:00:00Z`);
  const endTime = Date.parse(`${end}T00:00:00Z`);
  return Math.floor((endTime - startTime) / 86_400_000) + 1;
}

const defaultWindow = mostRecentCompleteWeek();
const start = argument("--start") ?? defaultWindow.start;
const end = argument("--end") ?? defaultWindow.end;
const numberOfDays = daysInclusive(start, end);
if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end) || numberOfDays < 1 || numberOfDays > 31) {
  throw new Error("Review period must be 1 to 31 inclusive days using YYYY-MM-DD dates");
}

const metrics: GrowthMetrics = {};
const sources: WeeklyGrowthSnapshot["sources"] = [];
const missingSources: NonNullable<WeeklyGrowthSnapshot["missingSources"]> = ["posthog", "linkedin"];
const notes: string[] = [
  "PostHog must be added through the official connected plugin.",
  "LinkedIn must be added from the private Page analytics export.",
];

const beehiivKey = process.env.BEEHIIV_API_KEY;
const beehiivPublication = process.env.BEEHIIV_PUBLICATION_ID;
if (beehiivKey && beehiivPublication) {
  try {
    const config: BeehiivConfig = { apiKey: beehiivKey, publicationId: beehiivPublication };
    Object.assign(metrics, aggregateBeehiivEngagements(await getPublicationEngagements(config, {
      startDate: start,
      numberOfDays,
      emailType: "post",
    })));
    sources.push("beehiiv");
  } catch {
    missingSources.push("beehiiv");
    notes.push("Beehiiv aggregate collection failed; no response body or credentials were retained.");
  }
} else {
  missingSources.push("beehiiv");
  notes.push("Beehiiv credentials were not supplied.");
}

const searchToken = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN;
const searchSite = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;
if (searchToken && searchSite) {
  try {
    Object.assign(metrics, aggregateSearchConsole(await querySearchConsole({
      accessToken: searchToken,
      siteUrl: searchSite,
      startDate: start,
      endDate: end,
      dimensions: ["date"],
    })));
    sources.push("search-console");
  } catch {
    missingSources.push("search-console");
    notes.push("Search Console aggregate collection failed; no response body or credentials were retained.");
  }
} else {
  missingSources.push("search-console");
  notes.push("Search Console read-only access was not supplied.");
}

const snapshot: WeeklyGrowthSnapshot = {
  period: { start, end },
  sources,
  missingSources,
  metrics,
  notes,
};

process.stdout.write(`${JSON.stringify({ current: snapshot }, null, 2)}\n`);
