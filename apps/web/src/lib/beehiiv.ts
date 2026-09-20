const API_BASE = "https://api.beehiiv.com/v2";
const REQUEST_TIMEOUT_MS = 8_000;

export interface BeehiivCustomField {
  id?: string;
  name?: string;
  kind?: string;
  value?: string | number | boolean | null;
}

export interface BeehiivSubscription {
  id: string;
  email: string;
  status: string;
  created: number;
  subscription_tier?: string;
  custom_fields?: BeehiivCustomField[];
}

export interface BeehiivPost {
  id: string;
  title: string;
  subtitle?: string | null;
  slug: string;
  authors?: string[];
  status?: string;
  audience?: string;
  platform?: string;
  thumbnail_url?: string | null;
  web_url?: string | null;
  hidden_from_feed?: boolean;
  enforce_gated_content?: boolean;
  publish_date?: number | null;
  displayed_date?: number | null;
  created?: number | null;
  content_tags?: string[];
  preview_text?: string | null;
  content?: {
    free?: { web?: string; email?: string; rss?: string };
    premium?: { web?: string; email?: string };
  };
  stats?: BeehiivPostStats;
}

export interface BeehiivEmailStats {
  recipients?: number;
  delivered?: number;
  opens?: number;
  unique_opens?: number;
  open_rate?: number;
  clicks?: number;
  unique_clicks?: number;
  verified_clicks?: number;
  unique_verified_clicks?: number;
  click_rate?: number;
  unsubscribes?: number;
  spam_reports?: number;
}

export interface BeehiivPostStats {
  email?: BeehiivEmailStats;
  web?: { views?: number; clicks?: number };
}

export interface BeehiivEngagement {
  date: string;
  total_opens: number;
  unique_opens: number;
  total_clicks: number;
  total_verified_clicks: number;
  unique_clicks: number;
  unique_verified_clicks: number;
}

export interface ListPostsResponse {
  data?: BeehiivPost[];
  total_pages?: number;
}

interface AggregateStatsResponse {
  data?: { stats?: BeehiivPostStats };
}

interface EngagementsResponse {
  data?: BeehiivEngagement[];
}

interface SubscriptionResponse {
  data?: BeehiivSubscription;
  errors?: Array<{ status?: number; code?: string; message?: string }>;
}

type RuntimeEnv = { runtime?: { env?: Record<string, string | undefined> } };

export interface BeehiivConfig {
  apiKey: string;
  publicationId: string;
}

export class BeehiivApiError extends Error {
  constructor(
    public readonly status: number,
    message = "Newsletter service request failed",
  ) {
    super(message);
    this.name = "BeehiivApiError";
  }
}

export function getRuntimeEnv(locals: unknown): Record<string, string | undefined> {
  return (locals as RuntimeEnv)?.runtime?.env ?? {};
}

export function getBeehiivConfig(locals: unknown): BeehiivConfig | null {
  const env = getRuntimeEnv(locals);
  const apiKey = env.BEEHIIV_API_KEY ?? import.meta.env.BEEHIIV_API_KEY;
  const publicationId =
    env.BEEHIIV_PUBLICATION_ID ?? import.meta.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !publicationId) return null;
  return { apiKey, publicationId };
}

function authHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    Accept: "application/json",
  };
}

function beehiivFetch(url: string, init: RequestInit = {}): Promise<Response> {
  return fetch(url, {
    ...init,
    signal: init.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

async function parseResponse(response: Response): Promise<SubscriptionResponse> {
  try {
    return (await response.json()) as SubscriptionResponse;
  } catch {
    return {};
  }
}

function apiMessage(body: SubscriptionResponse): string {
  return body.errors?.[0]?.message || "Newsletter service request failed";
}

export interface ListPostsOptions {
  limit?: number;
  page?: number;
  expand?: Array<"stats" | "free_web_content" | "free_email_content" | "free_rss_content">;
  status?: "draft" | "confirmed" | "archived" | "all";
  audience?: "free" | "premium" | "all";
  platform?: "web" | "email" | "both" | "all";
  hidden_from_feed?: "all" | "true" | "false";
  order_by?: "created" | "publish_date" | "displayed_date";
  direction?: "asc" | "desc";
  slugs?: string[];
}

export async function listPostPage(
  config: BeehiivConfig,
  options: ListPostsOptions = {},
): Promise<ListPostsResponse> {
  const params = new URLSearchParams({
    limit: String(options.limit ?? 25),
    status: options.status ?? "confirmed",
    audience: options.audience ?? "free",
    platform: options.platform ?? "all",
    hidden_from_feed: options.hidden_from_feed ?? "false",
    order_by: options.order_by ?? "publish_date",
    direction: options.direction ?? "desc",
  });
  if (options.page) params.set("page", String(options.page));
  for (const value of options.expand ?? []) params.append("expand[]", value);
  for (const slug of options.slugs ?? []) params.append("slugs[]", slug);

  const response = await beehiivFetch(
    `${API_BASE}/publications/${config.publicationId}/posts?${params}`,
    { headers: authHeaders(config.apiKey) },
  );
  if (!response.ok) throw new BeehiivApiError(response.status);
  const body = (await response.json()) as ListPostsResponse;
  if (!Array.isArray(body.data)) throw new BeehiivApiError(502);
  return body;
}

export async function listPosts(config: BeehiivConfig, options: ListPostsOptions = {}): Promise<BeehiivPost[]> {
  return (await listPostPage(config, options)).data!;
}

export async function getAggregatePostStats(
  config: BeehiivConfig,
): Promise<BeehiivPostStats> {
  const response = await beehiivFetch(
    `${API_BASE}/publications/${config.publicationId}/posts/aggregate_stats`,
    { headers: authHeaders(config.apiKey) },
  );
  if (!response.ok) throw new BeehiivApiError(response.status);
  return ((await response.json()) as AggregateStatsResponse).data?.stats ?? {};
}

export interface EngagementOptions {
  startDate: string;
  numberOfDays: number;
  granularity?: "day" | "week" | "month";
  emailType?: "all" | "post" | "message";
}

export async function getPublicationEngagements(
  config: BeehiivConfig,
  options: EngagementOptions,
): Promise<BeehiivEngagement[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.startDate)) {
    throw new TypeError("Beehiiv engagement startDate must use YYYY-MM-DD");
  }
  if (!Number.isInteger(options.numberOfDays) || options.numberOfDays < 1 || options.numberOfDays > 31) {
    throw new TypeError("Beehiiv engagement numberOfDays must be between 1 and 31");
  }
  const params = new URLSearchParams({
    start_date: options.startDate,
    number_of_days: String(options.numberOfDays),
    granularity: options.granularity ?? "day",
    email_type: options.emailType ?? "post",
  });
  const response = await beehiivFetch(
    `${API_BASE}/publications/${config.publicationId}/engagements?${params}`,
    { headers: authHeaders(config.apiKey) },
  );
  if (!response.ok) throw new BeehiivApiError(response.status);
  return ((await response.json()) as EngagementsResponse).data ?? [];
}

export async function getPostBySlug(
  config: BeehiivConfig,
  slug: string,
): Promise<BeehiivPost | null> {
  const posts = await listPosts(config, {
    limit: 1,
    slugs: [slug],
    expand: ["free_web_content"],
  });
  return posts[0] ?? null;
}

export async function getSubscriptionByEmail(
  config: BeehiivConfig,
  email: string,
): Promise<BeehiivSubscription | null> {
  const params = new URLSearchParams();
  params.append("expand[]", "custom_fields");
  const response = await beehiivFetch(
    `${API_BASE}/publications/${config.publicationId}/subscriptions/by_email/${encodeURIComponent(email)}?${params}`,
    { headers: authHeaders(config.apiKey) },
  );
  if (response.status === 404) return null;
  const body = await parseResponse(response);
  if (!response.ok || !body.data) {
    throw new BeehiivApiError(response.status, apiMessage(body));
  }
  return body.data;
}

export interface CreateSubscriptionInput {
  email: string;
  reactivate_existing?: boolean;
  send_welcome_email?: boolean;
  referring_site?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  custom_fields?: Array<{ name: string; value: string }>;
}

export async function createSubscription(
  config: BeehiivConfig,
  input: CreateSubscriptionInput,
): Promise<BeehiivSubscription | null> {
  const response = await beehiivFetch(
    `${API_BASE}/publications/${config.publicationId}/subscriptions`,
    {
      method: "POST",
      headers: { ...authHeaders(config.apiKey), "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const body = await parseResponse(response);
  const message = apiMessage(body);
  const code = body.errors?.[0]?.code ?? "";
  if (
    response.status === 409 ||
    /already|exist/i.test(message) ||
    code === "subscription_exists"
  ) {
    return null;
  }
  if (!response.ok) throw new BeehiivApiError(response.status, message);
  return body.data ?? null;
}

export async function updateSubscriptionByEmail(
  config: BeehiivConfig,
  email: string,
  input: {
    unsubscribe?: boolean;
    custom_fields?: Array<{ name: string; value: string }>;
  },
): Promise<BeehiivSubscription> {
  const response = await beehiivFetch(
    `${API_BASE}/publications/${config.publicationId}/subscriptions/by_email/${encodeURIComponent(email)}`,
    {
      method: "PUT",
      headers: { ...authHeaders(config.apiKey), "Content-Type": "application/json" },
      body: JSON.stringify(input),
    },
  );
  const body = await parseResponse(response);
  if (!response.ok || !body.data) {
    throw new BeehiivApiError(response.status, apiMessage(body));
  }
  return body.data;
}

export function getAnalyticsId(subscription: BeehiivSubscription | null): string | null {
  const field = subscription?.custom_fields?.find(
    (candidate) => candidate.name?.toLowerCase() === "analytics_id",
  );
  const value = typeof field?.value === "string" ? field.value.trim() : "";
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
    ? value
    : null;
}
