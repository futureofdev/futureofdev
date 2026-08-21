import posthog from "posthog-js";

type PageType =
  | "home"
  | "insights_index"
  | "insight"
  | "learning_index"
  | "course"
  | "about"
  | "privacy"
  | "other";

interface AnalyticsEvents {
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
  if (!key || initialised || !hasConsent()) return;
  posthog.init(key, {
    api_host: host,
    persistence: "localStorage+cookie",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    mask_all_text: true,
    mask_all_element_attributes: true,
    person_profiles: "identified_only",
  });
  posthog.opt_in_capturing();
  initialised = true;
  capturePageview();
}

export function denyAnalytics(): void {
  if (!posthog.__loaded) return;
  posthog.opt_out_capturing();
  posthog.reset();
}

export function identifySubscriber(analyticsId: string): void {
  if (!hasConsent() || !posthog.__loaded || !UUID_V4_PATTERN.test(analyticsId)) return;
  posthog.identify(analyticsId, { newsletter_subscriber: true });
}
