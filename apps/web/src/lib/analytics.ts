import posthog from "posthog-js";

import { sanitizeAnalyticsPayload, type AnalyticsEvents, type PageType } from "./analytics-privacy";

const TOKEN_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let initialised = false;

function token(value: string | null | undefined, max = 80): string | undefined {
  const clean = value?.trim().toLowerCase().slice(0, max);
  return clean && TOKEN_PATTERN.test(clean) ? clean : undefined;
}

function hasConsent(): boolean {
  return typeof window !== "undefined" && localStorage.getItem("ph_consent") === "true";
}

function pageContext(pathname: string): { page_type: PageType; content_slug?: string } {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return { page_type: "home" };
  if (parts[0] === "insights") {
    if (parts[1] === "page" && /^[1-9][0-9]*$/.test(parts[2] ?? "")) return { page_type: "insights_index" };
    return parts[1]
      ? { page_type: "insight", content_slug: token(parts[1], 120) }
      : { page_type: "insights_index" };
  }
  if (parts[0] === "learning") {
    return parts[1]
      ? { page_type: "course", content_slug: token(parts[1], 120) }
      : { page_type: "learning_index" };
  }
  if (parts[0] === "about") return { page_type: "about" };
  if (parts[0] === "privacy") return { page_type: "privacy" };
  return { page_type: "other" };
}

export function captureAnalyticsEvent<Event extends keyof AnalyticsEvents>(
  event: Event,
  properties: AnalyticsEvents[Event],
): void {
  if (!hasConsent() || !posthog.__loaded) return;
  posthog.capture(event, properties);
}

export function capturePageview(): void {
  if (typeof window === "undefined") return;
  const source = token(new URLSearchParams(window.location.search).get("utm_source"), 50);
  captureAnalyticsEvent("$pageview", {
    $current_url: `${window.location.origin}${window.location.pathname}`,
    ...pageContext(window.location.pathname),
    ...(source ? { source } : {}),
  });
}

export function initialiseAnalytics(key: string | undefined, host: string): void {
  if (!key || !hasConsent()) return;
  if (!initialised) {
    posthog.init(key, {
      api_host: host,
      persistence: "localStorage+cookie",
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_dead_clicks: false,
      capture_heatmaps: false,
      capture_performance: false,
      capture_exceptions: false,
      disable_session_recording: true,
      save_campaign_params: false,
      save_referrer: false,
      advanced_disable_flags: true,
      disable_surveys: true,
      disable_conversations: true,
      disable_product_tours: true,
      before_send: sanitizeAnalyticsPayload,
      mask_all_text: true,
      mask_all_element_attributes: true,
      person_profiles: "identified_only",
    });
    initialised = true;
  }
  posthog.opt_in_capturing({ captureEventName: false });
  capturePageview();
}

export function denyAnalytics(): void {
  if (!posthog.__loaded) return;
  // reset() clears the SDK's stored consent; opt out after resetting identity.
  posthog.reset();
  posthog.opt_out_capturing();
}

export function identifySubscriber(analyticsId: string): void {
  if (!hasConsent() || !posthog.__loaded || !UUID_V4_PATTERN.test(analyticsId)) return;
  posthog.identify(analyticsId, { newsletter_subscriber: true });
}
