import { expect, test, vi } from "vitest";
import type { CaptureResult, PostHogConfig } from "posthog-js";
import { createAnalytics, sanitizeEvent } from "../client/src/analytics";
test("unconfigured, unapproved and DNT analytics do not load an SDK", async () => {
  const load = vi.fn();
  for (const options of [
    { key: undefined, blocked: () => false },
    { key: "phc_test", blocked: () => true },
  ]) {
    const analytics = createAnalytics({
      ...options,
      host: "https://us.i.posthog.com",
      load,
    });
    await analytics.track("builder_started");
  }
  expect(load).not.toHaveBeenCalled();
});
test("configured SDK uses privacy controls and only allowed event properties", async () => {
  let config: Partial<PostHogConfig> = {};
  let blocked = false;
  const capture = vi.fn();
  const init = vi.fn((_key, options) => {
    config = options;
    return undefined;
  });
  const analytics = createAnalytics({
    key: "phc_test",
    host: "https://us.i.posthog.com",
    blocked: () => blocked,
    load: async () => ({ init, capture }),
  });
  await analytics.track("template_selected", {
    template: "bento",
    email: "private@example.com",
    token: "secret",
    draft: "private writing",
    file: "photo bytes",
  });
  expect(config).toMatchObject({
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    person_profiles: "never",
    respect_dnt: true,
    persistence: "memory",
    advanced_disable_flags: true,
  });
  expect(capture).toHaveBeenCalledWith(
    "template_selected",
    expect.objectContaining({ template: "bento" }),
  );
  expect(JSON.stringify(capture.mock.calls)).not.toMatch(
    /private|secret|photo bytes/,
  );
  const beforeSend = config.before_send as (
    event: CaptureResult,
  ) => CaptureResult | null;
  const clean = beforeSend({
    uuid: "event-id",
    event: "export_downloaded",
    properties: {
      format: "png",
      email: "private@example.com",
      $current_url: "https://example.com/auth#token",
      $referrer: "private",
    },
    $set: { name: "private" },
  });
  expect(Object.keys(clean!.properties).sort()).toEqual([
    "$geoip_disable",
    "$process_person_profile",
    "distinct_id",
    "format",
    "token",
  ]);
  expect(clean).not.toHaveProperty("$set");
  blocked = true;
  expect(
    beforeSend({ uuid: "event-id", event: "builder_started", properties: {} }),
  ).toBeNull();
  await analytics.track("builder_started");
  expect(capture).toHaveBeenCalledTimes(1);
});
test("unknown automatic events and arbitrary property values are discarded", () => {
  const visit = sanitizeEvent(
    {
      uuid: "id",
      event: "site_opened",
      properties: {
        page: "builder",
        email: "PRIVATE",
        $current_url: "https://example.com/builder?code=PRIVATE",
      },
    },
    "anonymous",
  );
  expect(visit!.properties.page).toBe("builder");
  expect(JSON.stringify(visit)).not.toContain("PRIVATE");
  expect(
    sanitizeEvent(
      { uuid: "id", event: "$autocapture", properties: { email: "private" } },
      "anonymous",
    ),
  ).toBeNull();
  expect(
    sanitizeEvent(
      {
        uuid: "id",
        event: "template_selected",
        properties: { template: "private text" },
      },
      "anonymous",
    )!.properties,
  ).not.toHaveProperty("template");
});
