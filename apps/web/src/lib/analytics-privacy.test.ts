import assert from "node:assert/strict";
import test from "node:test";
import posthog, { type CaptureResult, type PostHogConfig } from "posthog-js";
import { PostHog } from "posthog-js/lib/src/posthog-core.js";
import { captureAnalyticsEvent, denyAnalytics, initialiseAnalytics } from "./analytics";

const subscriberId = "d9428888-122b-4d75-8b70-f0abf449f6ab";
const projectKey = "phc_SyntheticPublicKey_123";
const privateUrl = "https://futureofdev.com/learning/coding-bootcamp-in-a-box?email=reader%40example.com#private";

test("analytics sends only declared data after the SDK expands event and person properties", async (t) => {
  // Capture the application's real initialization configuration without a browser
  // or network, then exercise it through the real SDK capture/identify pipeline.
  let config: Partial<PostHogConfig> = {};
  let consent = false;
  let optInOptions: Parameters<typeof posthog.opt_in_capturing>[0];
  const originals = { init: posthog.init, optIn: posthog.opt_in_capturing };
  const windowDescriptor = Object.getOwnPropertyDescriptor(globalThis, "window");
  const storageDescriptor = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "window", { configurable: true, value: { location: new URL(privateUrl) } });
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => String(consent) } });
  posthog.init = ((_key, options) => { config = options ?? {}; return posthog; }) as typeof posthog.init;
  posthog.opt_in_capturing = (options) => { optInOptions = options; };
  try {
    initialiseAnalytics(projectKey, "https://eu.i.posthog.com");
    assert.deepEqual(config, {}, "analytics must not initialize without consent");
    consent = true;
    initialiseAnalytics(projectKey, "https://eu.i.posthog.com");
  } finally {
    posthog.init = originals.init;
    posthog.opt_in_capturing = originals.optIn;
    if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
    else Reflect.deleteProperty(globalThis, "window");
    if (storageDescriptor) Object.defineProperty(globalThis, "localStorage", storageDescriptor);
    else Reflect.deleteProperty(globalThis, "localStorage");
  }

  const client = new PostHog();
  const sent: CaptureResult[] = [];
  // Replace only the transport. Capture, property expansion, person merging and
  // before_send all remain the installed SDK's implementation.
  client._send_request = (request) => {
    if (request.data && typeof request.data === "object" && "event" in request.data) {
      sent.push(request.data as CaptureResult);
    }
  };
  client.init(projectKey, {
    ...config,
    persistence: "memory",
    request_batching: false,
    disable_external_dependency_loading: true,
    advanced_disable_flags: true,
  });
  t.after(() => {
    client._requestQueue?.unload();
    client._retryQueue?.unload();
    client.sessionManager?.destroy();
    client._remoteConfigLoader?.stop();
  });

  // Represents persisted properties from earlier SDK versions, as well as raw
  // SDK URL expansion. These must be scrubbed even when saving is now disabled.
  client.register({
    $current_url: privateUrl,
    $referrer: "https://futureofdev.com/?token=private",
    $initial_current_url: privateUrl,
    $session_entry_url: privateUrl,
    utm_campaign: "reader@example.com",
    email: "reader@example.com",
  });

  await t.test("custom events remove undeclared and nested private properties", () => {
    const result = client.capture("newsletter_subscribed", {
      placement: "homepage-hero", offer: "newsletter", already_subscribed: false,
      unexpected: "reader@example.com", page_type: "home",
      $set: { email: "reader@example.com", newsletter_subscriber: true },
    }, { $set_once: { $initial_referrer: privateUrl, name: "Private Reader" } });
    assert.ok(result);
    assert.equal(result.properties.token, projectKey);
    assert.equal(result.properties.placement, "homepage-hero");
    assert.equal(result.properties.already_subscribed, false);
    assert.equal(result.properties.unexpected, undefined);
    assert.equal(result.properties.page_type, undefined);
    assert.doesNotMatch(JSON.stringify(result), /example\.com|%40|\?|#private|Private Reader/);
  });

  await t.test("pageviews retain useful routes without raw URLs or campaign properties", () => {
    const result = client.capture("$pageview", { $current_url: privateUrl, page_type: "course", source: "linkedin" });
    assert.ok(result);
    assert.equal(result.properties.$current_url, "https://futureofdev.com/learning/coding-bootcamp-in-a-box");
    assert.equal(result.properties.source, "linkedin");
    assert.doesNotMatch(JSON.stringify(result), /example\.com|%40|\?|#private|utm_campaign/);
  });

  await t.test("identification preserves anonymous-to-subscriber merge identifiers", () => {
    const anonymousId = client.get_distinct_id();
    client.identify(subscriberId, { newsletter_subscriber: true, email: "reader@example.com" });
    const identified = [...sent].reverse().find((event) => event.event === "$identify");
    assert.ok(identified);
    assert.equal(identified.properties.distinct_id, subscriberId);
    assert.equal(identified.properties.$anon_distinct_id, anonymousId);
    assert.equal(identified.$set?.newsletter_subscriber, true);
    assert.doesNotMatch(JSON.stringify(identified), /example\.com|%40|\?|#private/);
  });

  await t.test("undeclared SDK events and implicit opt-in events never reach transport", () => {
    sent.length = 0;
    client.capture("$autocapture", { email: "reader@example.com" });
    client.capture("undeclared_event", { placement: "home" });
    client.opt_in_capturing(optInOptions);
    assert.deepEqual(sent, []);
  });

  await t.test("runtime values cannot smuggle form content through declared properties", () => {
    const result = client.capture("cta_clicked", { cta: "reader@example.com", placement: { email: "reader@example.com" } });
    assert.ok(result);
    assert.equal(result.properties.cta, undefined);
    assert.equal(result.properties.placement, undefined);
    assert.doesNotMatch(JSON.stringify(result), /example\.com|%40|\?/);
  });

  await t.test("granting consent again resumes capture without another SDK initialization", () => {
    // Forward the public wrapper to the same initialized SDK instance. The
    // Node package's default export differs from Vite's browser export.
    const originalMethods = {
      init: posthog.init,
      capture: posthog.capture,
      opt_in_capturing: posthog.opt_in_capturing,
      opt_out_capturing: posthog.opt_out_capturing,
      reset: posthog.reset,
      __loaded: posthog.__loaded,
    };
    Object.assign(posthog, {
      init: () => { throw new Error("A second consent grant must reuse the SDK instance"); },
      capture: client.capture.bind(client),
      opt_in_capturing: client.opt_in_capturing.bind(client),
      opt_out_capturing: client.opt_out_capturing.bind(client),
      reset: client.reset.bind(client),
      __loaded: true,
    });
    Object.defineProperty(globalThis, "window", { configurable: true, value: { location: new URL(privateUrl) } });
    const storage = new Map<string, string>();
    // The SDK loaded in Node has no browser storage. Supply only that storage
    // boundary so the real consent manager can persist its opt-in/out state.
    Object.defineProperty(client.consent, "_storage", { configurable: true, value: {
      _get: (key: string) => storage.get(key) ?? null,
      _set: (key: string, value: unknown) => storage.set(key, String(value)),
      _remove: (key: string) => storage.delete(key),
    } });
    Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
      getItem: (key: string) => key === "ph_consent" ? String(consent) : storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    } });
    try {
      sent.length = 0;
      captureAnalyticsEvent("cta_clicked", { cta: "before-denial" });
      assert.equal(sent.length, 1);

      consent = false;
      denyAnalytics();
      sent.length = 0;
      captureAnalyticsEvent("cta_clicked", { cta: "while-denied" });
      client.capture("cta_clicked", { cta: "sdk-while-denied" });
      initialiseAnalytics(projectKey, "https://eu.i.posthog.com");
      assert.equal(sent.length, 0, "denial must stop both wrapper and SDK capture");

      consent = true;
      initialiseAnalytics(projectKey, "https://eu.i.posthog.com");
      captureAnalyticsEvent("cta_clicked", { cta: "after-regrant" });
      assert.deepEqual(sent.map((event) => event.event), ["$pageview", "cta_clicked"]);
      assert.equal(sent[1]?.properties.cta, "after-regrant");
    } finally {
      Reflect.deleteProperty(client.consent, "_storage");
      Object.assign(posthog, originalMethods);
      if (windowDescriptor) Object.defineProperty(globalThis, "window", windowDescriptor);
      else Reflect.deleteProperty(globalThis, "window");
      if (storageDescriptor) Object.defineProperty(globalThis, "localStorage", storageDescriptor);
      else Reflect.deleteProperty(globalThis, "localStorage");
    }
  });
});
