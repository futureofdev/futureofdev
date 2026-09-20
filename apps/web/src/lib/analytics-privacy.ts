import type { CaptureResult } from "posthog-js";

export type PageType =
  | "home"
  | "insights_index"
  | "insight"
  | "learning_index"
  | "course"
  | "about"
  | "privacy"
  | "other";

export interface AnalyticsEvents {
  "$pageview": {
    $current_url: string;
    page_type: PageType;
    content_slug?: string;
    source?: string;
  };
  newsletter_signup_started: {
    placement: string;
    offer: string;
  };
  newsletter_subscribed: {
    placement: string;
    offer: string;
    already_subscribed: boolean;
  };
  newsletter_subscription_failed: {
    placement: string;
    offer: string;
  };
  cta_clicked: {
    cta: string;
    placement?: string;
    content_slug?: string;
  };
  course_download_requested: {
    course: string;
    placement: string;
  };
}

type Validator = (value: unknown) => string | boolean | undefined;
const boundedToken: Validator = (value) =>
  typeof value === "string" && /^[a-z0-9][a-z0-9_-]{0,119}$/.test(value) ? value : undefined;
const boolean: Validator = (value) => typeof value === "boolean" ? value : undefined;
const uuid: Validator = (value) =>
  typeof value === "string" && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value) ? value : undefined;

function pageUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    if (!["futureofdev.com", "www.futureofdev.com", "localhost", "127.0.0.1"].includes(url.hostname)) return undefined;
    // Only public routes can become analytics paths. Unknown paths may contain
    // private values even when the query string has been removed.
    if (!/^\/(?:insights(?:\/page\/[1-9][0-9]*|\/[a-z0-9][a-z0-9_-]*)?|learning(?:\/coding-bootcamp-in-a-box)?|about|privacy|unsubscribe)?\/?$/.test(url.pathname)) return undefined;
    return `${url.origin}${url.pathname}`;
  } catch {
    return undefined;
  }
}

const eventProperties = {
  "$pageview": {
    $current_url: pageUrl,
    page_type: (value: unknown) => typeof value === "string" &&
      ["home", "insights_index", "insight", "learning_index", "course", "about", "privacy", "other"].includes(value)
      ? value : undefined,
    content_slug: boundedToken,
    source: boundedToken,
  },
  newsletter_signup_started: { placement: boundedToken, offer: boundedToken },
  newsletter_subscribed: { placement: boundedToken, offer: boundedToken, already_subscribed: boolean },
  newsletter_subscription_failed: { placement: boundedToken, offer: boundedToken },
  cta_clicked: { cta: boundedToken, placement: boundedToken, content_slug: boundedToken },
  course_download_requested: { course: boundedToken, placement: boundedToken },
} satisfies { [Event in keyof AnalyticsEvents]: { [Key in keyof AnalyticsEvents[Event]]-?: Validator } };

function selectProperties(input: unknown, validators: Record<string, Validator>): Record<string, string | boolean> {
  const selected: Record<string, string | boolean> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return selected;
  for (const [key, validate] of Object.entries(validators)) {
    const value = validate((input as Record<string, unknown>)[key]);
    if (value !== undefined) selected[key] = value;
  }
  return selected;
}

// These are SDK protocol fields, not public identifiers or arbitrary person
// properties. Preserve them so consented anonymous activity can merge on signup.
const sdkProperties = {
  token: (value: unknown) => typeof value === "string" && /^[a-z0-9_-]{1,200}$/i.test(value) ? value : undefined,
  distinct_id: uuid,
  $device_id: uuid,
  $user_id: uuid,
  $anon_distinct_id: uuid,
  $session_id: uuid,
  $window_id: uuid,
  $pageview_id: uuid,
  $is_identified: boolean,
  $process_person_profile: boolean,
};
const personProperties = { newsletter_subscriber: boolean };

/** Runs after SDK expansion, including persisted campaign and person fields. */
export function sanitizeAnalyticsPayload(event: CaptureResult | null): CaptureResult | null {
  if (!event || (event.event !== "$identify" && !Object.hasOwn(eventProperties, event.event))) return null;
  const validators = event.event === "$identify" ? {} : eventProperties[event.event as keyof AnalyticsEvents];
  const properties: CaptureResult["properties"] = {
    ...selectProperties(event.properties, sdkProperties),
    ...selectProperties(event.properties, validators),
  };
  for (const key of ["$set", "$set_once"] as const) {
    const selected = selectProperties(event.properties[key], personProperties);
    if (Object.keys(selected).length) properties[key] = selected;
  }
  const result: CaptureResult = { uuid: event.uuid, event: event.event, properties, timestamp: event.timestamp };
  for (const key of ["$set", "$set_once"] as const) {
    const selected = selectProperties(event[key], personProperties);
    if (Object.keys(selected).length) result[key] = selected;
  }
  return result;
}
