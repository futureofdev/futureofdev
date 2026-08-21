import type { APIRoute } from "astro";
import {
  BeehiivApiError,
  createSubscription,
  getAnalyticsId,
  getBeehiivConfig,
  getRuntimeEnv,
  getSubscriptionByEmail,
  updateSubscriptionByEmail,
  type BeehiivSubscription,
} from "../../lib/beehiiv";
import { COURSE_OFFER, createCourseDownloadToken } from "../../lib/course-token";

export const prerender = false;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TOKEN_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const ALLOWED_HOSTS = new Set(["futureofdev.com", "www.futureofdev.com", "localhost", "127.0.0.1"]);
const MAX_REQUEST_BYTES = 8_192;

interface NewsletterPayload {
  email?: unknown;
  placement?: unknown;
  offer?: unknown;
  pageUrl?: unknown;
  analyticsConsent?: unknown;
  attribution?: unknown;
}

function json(body: Record<string, unknown>, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

function boundedToken(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const token = value.trim().toLowerCase().slice(0, max);
  return TOKEN_PATTERN.test(token) ? token : undefined;
}

function boundedAttribution(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const allowed = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
  const result: Record<string, string> = {};
  for (const key of allowed) {
    const candidate = (value as Record<string, unknown>)[key];
    if (typeof candidate === "string") {
      const clean = candidate.trim().replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 100);
      if (clean) result[key] = clean;
    }
  }
  return result;
}

function safePageUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 500) return undefined;
  try {
    const url = new URL(value);
    if (!ALLOWED_HOSTS.has(url.hostname)) return undefined;
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

function activeStatus(subscription: BeehiivSubscription | null): boolean {
  return subscription ? ["active", "validating"].includes(subscription.status) : false;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (!ALLOWED_HOSTS.has(new URL(origin).hostname)) return json({ error: "Forbidden" }, 403);
    } catch {
      return json({ error: "Forbidden" }, 403);
    }
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > MAX_REQUEST_BYTES) return json({ error: "Request too large" }, 413);

  if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/json")) {
    return json({ error: "Invalid request" }, 400);
  }

  let payload: NewsletterPayload;
  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > MAX_REQUEST_BYTES) {
      return json({ error: "Request too large" }, 413);
    }
    payload = JSON.parse(body) as NewsletterPayload;
  } catch {
    return json({ error: "Invalid request" }, 400);
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const placement = boundedToken(payload.placement, 50);
  const offer = boundedToken(payload.offer, 80);
  const pageUrl = safePageUrl(payload.pageUrl);
  const attribution = boundedAttribution(payload.attribution);
  const analyticsConsent = payload.analyticsConsent === true;

  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return json({ error: "Please enter a valid email address" }, 400);
  }
  if (!placement) return json({ error: "Invalid signup placement" }, 400);
  if (payload.offer !== undefined && !offer) return json({ error: "Invalid offer" }, 400);

  const config = getBeehiivConfig(locals);
  const env = getRuntimeEnv(locals);
  const courseSecret = env.COURSE_DOWNLOAD_SECRET ?? import.meta.env.COURSE_DOWNLOAD_SECRET;
  if (!config) return json({ error: "Newsletter service not configured" }, 503);
  if (offer === COURSE_OFFER && !courseSecret) {
    return json({ error: "Course download not configured" }, 503);
  }
  try {
    let existing = await getSubscriptionByEmail(config, email);
    const alreadySubscribed = activeStatus(existing);
    let analyticsId = getAnalyticsId(existing) ?? crypto.randomUUID();

    const created = alreadySubscribed
      ? null
      : await createSubscription(config, {
          email,
          reactivate_existing: true,
          // Course delivery is synchronous: the signed URL is returned below.
          // Do not depend on a Beehiiv welcome email or automation for fulfilment.
          send_welcome_email: false,
          referring_site: pageUrl,
          utm_source: attribution.utm_source ?? "futureofdev",
          utm_medium: attribution.utm_medium ?? "website",
          utm_campaign: attribution.utm_campaign,
          utm_term: attribution.utm_term,
          utm_content: attribution.utm_content ?? placement,
          custom_fields: [{ name: "analytics_id", value: analyticsId }],
        });

    // A concurrent request may have created the record first. Re-read it so
    // both devices receive the stable identifier Beehiiv actually stores.
    if (!created && !existing) existing = await getSubscriptionByEmail(config, email);
    analyticsId = getAnalyticsId(created ?? existing) ?? analyticsId;

    if (existing && !alreadySubscribed && !created) {
      existing = await updateSubscriptionByEmail(config, email, {
        unsubscribe: false,
        custom_fields: [{ name: "analytics_id", value: analyticsId }],
      });
      analyticsId = getAnalyticsId(existing) ?? analyticsId;
    } else if (!getAnalyticsId(created ?? existing)) {
      const updated = await updateSubscriptionByEmail(config, email, {
        custom_fields: [{ name: "analytics_id", value: analyticsId }],
      });
      analyticsId = getAnalyticsId(updated) ?? analyticsId;
    }

    let downloadUrl: string | undefined;
    if (offer === COURSE_OFFER) {
      const token = await createCourseDownloadToken(courseSecret!);
      downloadUrl = `/api/course-download?token=${encodeURIComponent(token)}`;
    }

    return json({
      success: true,
      alreadySubscribed,
      ...(analyticsConsent ? { analyticsId } : {}),
      ...(downloadUrl ? { downloadUrl } : {}),
    });
  } catch (error) {
    if (error instanceof BeehiivApiError && error.status === 429) {
      return json({ error: "Newsletter service is busy. Please try again shortly." }, 429, { "Retry-After": "60" });
    }
    // Never log the request payload or upstream error text: either may contain
    // subscriber data. Operational logs only need the coarse failure class.
    console.error("Newsletter signup failed", error instanceof BeehiivApiError ? error.status : "internal");
    return json({ error: "Unable to subscribe right now. Please try again." }, 502);
  }
};
