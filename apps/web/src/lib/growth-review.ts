import type { BeehiivEngagement } from "./beehiiv";

export interface ReviewWindow {
  start: string;
  end: string;
}

export interface SearchConsoleRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
}

export interface GrowthMetrics {
  qualifiedVisits?: number;
  newsletterSignups?: number;
  newsletterSignupRate?: number;
  beehiivUniqueOpens?: number;
  beehiivVerifiedClicks?: number;
  beehiivDailyUniqueVerifiedClicksSum?: number;
  courseDownloads?: number;
  ctaClicks?: number;
  searchClicks?: number;
  searchImpressions?: number;
  searchCtr?: number;
  searchAveragePosition?: number;
  linkedinImpressions?: number;
  linkedinClicks?: number;
  linkedinFollowersGained?: number;
}

export interface WeeklyGrowthSnapshot {
  period: ReviewWindow;
  sources: Array<"posthog" | "beehiiv" | "search-console" | "linkedin">;
  missingSources?: Array<"posthog" | "beehiiv" | "search-console" | "linkedin">;
  metrics: GrowthMetrics;
  notes?: string[];
}

export interface WeeklyGrowthInput {
  current: WeeklyGrowthSnapshot;
  previous?: WeeklyGrowthSnapshot;
  baseline?: WeeklyGrowthSnapshot[];
}

const METRIC_LABELS: Record<keyof GrowthMetrics, string> = {
  qualifiedVisits: "Qualified visits",
  newsletterSignups: "Newsletter signups",
  newsletterSignupRate: "Visitor-to-subscriber conversion",
  beehiivUniqueOpens: "Beehiiv unique opens",
  beehiivVerifiedClicks: "Beehiiv verified clicks",
  beehiivDailyUniqueVerifiedClicksSum: "Beehiiv daily unique verified clicks (sum)",
  courseDownloads: "Course downloads requested",
  ctaClicks: "Calls to action clicked",
  searchClicks: "Search clicks",
  searchImpressions: "Search impressions",
  searchCtr: "Search click-through rate",
  searchAveragePosition: "Search average position",
  linkedinImpressions: "LinkedIn impressions",
  linkedinClicks: "LinkedIn clicks",
  linkedinFollowersGained: "LinkedIn followers gained",
};

function dateParts(date: Date, timeZone: string): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: value("year"), month: value("month"), day: value("day") };
}

function dateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function mostRecentCompleteWeek(
  now = new Date(),
  timeZone = "Europe/London",
): ReviewWindow {
  const local = dateParts(now, timeZone);
  const localDate = new Date(Date.UTC(local.year, local.month - 1, local.day, 12));
  const day = localDate.getUTCDay();
  const daysBackToCompleteSunday = day === 0 ? 7 : day;
  const end = new Date(localDate);
  end.setUTCDate(end.getUTCDate() - daysBackToCompleteSunday);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 6);
  return { start: dateOnly(start), end: dateOnly(end) };
}

export function aggregateBeehiivEngagements(rows: BeehiivEngagement[]): GrowthMetrics {
  return {
    beehiivUniqueOpens: rows.reduce((total, row) => total + row.unique_opens, 0),
    beehiivVerifiedClicks: rows.reduce((total, row) => total + row.total_verified_clicks, 0),
    beehiivDailyUniqueVerifiedClicksSum: rows.reduce(
      (total, row) => total + row.unique_verified_clicks,
      0,
    ),
  };
}

export function aggregateSearchConsole(rows: SearchConsoleRow[]): GrowthMetrics {
  const clicks = rows.reduce((total, row) => total + (row.clicks ?? 0), 0);
  const impressions = rows.reduce((total, row) => total + (row.impressions ?? 0), 0);
  const weightedPosition = rows.reduce(
    (total, row) => total + (row.position ?? 0) * (row.impressions ?? 0),
    0,
  );
  return {
    searchClicks: clicks,
    searchImpressions: impressions,
    searchCtr: impressions > 0 ? clicks / impressions : 0,
    searchAveragePosition: impressions > 0 ? weightedPosition / impressions : 0,
  };
}

export function assertPrivacySafe(value: unknown, path = "input"): void {
  if (typeof value === "string") {
    if (/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/.test(value)) {
      throw new Error(`${path} contains an email address`);
    }
    if (/https?:\/\/\S+\?\S+/.test(value)) {
      throw new Error(`${path} contains a URL with a query string`);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertPrivacySafe(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    if (/email|distinct.?id|subscriber.?id|person.?id/i.test(key)) {
      throw new Error(`${path}.${key} is a forbidden subscriber-level field`);
    }
    assertPrivacySafe(nested, `${path}.${key}`);
  }
}

function mean(values: number[]): number | undefined {
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : undefined;
}

function formatValue(key: keyof GrowthMetrics, value: number | undefined): string {
  if (value === undefined) return "Unavailable";
  if (key === "newsletterSignupRate" || key === "searchCtr") return `${(value * 100).toFixed(1)}%`;
  if (key === "searchAveragePosition") return value.toFixed(1);
  return Math.round(value).toLocaleString("en-GB");
}

function change(current: number | undefined, comparison: number | undefined): string {
  if (current === undefined || comparison === undefined) return "Unavailable";
  if (comparison === 0) return current === 0 ? "No change" : "New activity";
  const percentage = ((current - comparison) / Math.abs(comparison)) * 100;
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
}

export function buildWeeklyGrowthReport(input: WeeklyGrowthInput): string {
  assertPrivacySafe(input);
  const baseline = input.baseline?.slice(0, 4) ?? [];
  const metricKeys = Object.keys(METRIC_LABELS) as Array<keyof GrowthMetrics>;
  const rows = metricKeys
    .filter((key) => input.current.metrics[key] !== undefined)
    .map((key) => {
      const baselineValue = mean(
        baseline.flatMap((snapshot) => {
          const value = snapshot.metrics[key];
          return value === undefined ? [] : [value];
        }),
      );
      return `| ${METRIC_LABELS[key]} | ${formatValue(key, input.current.metrics[key])} | ${change(input.current.metrics[key], input.previous?.metrics[key])} | ${change(input.current.metrics[key], baselineValue)} |`;
    });

  const missing = input.current.missingSources?.length
    ? input.current.missingSources.join(", ")
    : "None";
  const notes = input.current.notes?.length
    ? input.current.notes.map((note) => `- ${note}`).join("\n")
    : "- No source notes supplied.";

  return `# Future of Dev weekly growth review

Period: ${input.current.period.start} to ${input.current.period.end}

## Decision summary

- Add the editorial or acquisition decision after reviewing the evidence below.
- Weekly Activated Readers: **not computable** unless a separate privacy-safe, deduplicated value is supplied and verified.

## Coverage

- Available: ${input.current.sources.join(", ") || "None"}
- Missing: ${missing}
- Previous-week comparison: ${input.previous ? "Available" : "Unavailable"}
- Four-week comparison: ${baseline.length === 4 ? "Available" : `Unavailable (${baseline.length}/4 complete weeks)`}

## Funnel and channel signals

| Metric | Current | vs previous | vs four-week mean |
| --- | ---: | ---: | ---: |
${rows.length ? rows.join("\n") : "| No metrics available | Unavailable | Unavailable | Unavailable |"}

## Data quality and privacy

${notes}

## Next actions

1. Unowned: decide the most important editorial or acquisition response.
2. Unowned: resolve any missing or broken source that affects that decision.
3. Unowned: define one test for the next complete week.
`;
}
