import type { SearchConsoleRow } from "./growth-review";

const API_BASE = "https://www.googleapis.com/webmasters/v3/sites";
const REQUEST_TIMEOUT_MS = 8_000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class SearchConsoleApiError extends Error {
  constructor(public readonly status: number) {
    super("Search Console request failed");
    this.name = "SearchConsoleApiError";
  }
}

export interface SearchConsoleQuery {
  accessToken: string;
  siteUrl: string;
  startDate: string;
  endDate: string;
  dimensions?: Array<"date" | "page" | "query" | "country" | "device">;
  rowLimit?: number;
}

export async function querySearchConsole(input: SearchConsoleQuery): Promise<SearchConsoleRow[]> {
  if (!DATE_PATTERN.test(input.startDate) || !DATE_PATTERN.test(input.endDate)) {
    throw new TypeError("Search Console dates must use YYYY-MM-DD");
  }
  if (input.startDate > input.endDate) {
    throw new TypeError("Search Console startDate must not be after endDate");
  }
  if (!input.accessToken || !input.siteUrl) {
    throw new TypeError("Search Console access token and site URL are required");
  }
  const rowLimit = input.rowLimit ?? 25_000;
  if (!Number.isInteger(rowLimit) || rowLimit < 1 || rowLimit > 25_000) {
    throw new TypeError("Search Console rowLimit must be between 1 and 25000");
  }

  const response = await fetch(
    `${API_BASE}/${encodeURIComponent(input.siteUrl)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate: input.startDate,
        endDate: input.endDate,
        dimensions: input.dimensions ?? ["date"],
        aggregationType: "auto",
        dataState: "final",
        rowLimit,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    },
  );
  if (!response.ok) throw new SearchConsoleApiError(response.status);
  return ((await response.json()) as { rows?: SearchConsoleRow[] }).rows ?? [];
}
