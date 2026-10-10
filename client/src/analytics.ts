import type { CaptureResult, PostHogConfig } from "posthog-js";
import { templateIds } from "../../shared/src/templates";

const events: Record<string, Record<string, readonly (string | number)[]>> = {
  site_opened: { page: ["landing", "builder"] },
  landing_cta_clicked: {},
  builder_started: {},
  template_selected: { template: templateIds },
  builder_step_completed: { step: [0, 1, 2, 3, 4, 5, 6, 7] },
  export_downloaded: {
    format: ["json", "cv_pdf", "portfolio_pdf", "png", "website_zip"],
  },
  contact_link_clicked: { type: ["email", "website"] },
};
type SDK = {
  init: (key: string, config: Partial<PostHogConfig>) => unknown;
  capture: (event: string, properties: Record<string, unknown>) => unknown;
};
export function analyticsHost(host: string) {
  return ["https://us.i.posthog.com", "https://eu.i.posthog.com"].includes(host)
    ? host
    : null;
}
export function sanitizeEvent(
  event: CaptureResult | null,
  anonymousId: string,
  projectKey?: string,
): CaptureResult | null {
  if (!event || !Object.hasOwn(events, event.event)) return null;
  const properties: Record<string, unknown> = {
    distinct_id: anonymousId,
    $process_person_profile: false,
    $geoip_disable: true,
    ...(projectKey ? { token: projectKey } : {}),
  };
  for (const [key, allowed] of Object.entries(events[event.event]))
    if (allowed.includes(event.properties[key]))
      properties[key] = event.properties[key];
  return {
    uuid: event.uuid,
    event: event.event,
    properties,
    ...(event.timestamp ? { timestamp: event.timestamp } : {}),
  };
}
export function createAnalytics(options: {
  key?: string;
  host: string;
  blocked: () => boolean;
  load: () => Promise<SDK>;
}) {
  let pending: Promise<SDK | null> | undefined;
  const anonymousId = crypto.randomUUID();
  async function sdk() {
    if (!options.key || !analyticsHost(options.host) || options.blocked())
      return null;
    if (!pending)
      pending = options
        .load()
        .then((instance) => {
          if (options.blocked()) {
            pending = undefined;
            return null;
          }
          const config: Partial<PostHogConfig> = {
            api_host: options.host,
            persistence: "memory",
            autocapture: false,
            capture_pageview: false,
            capture_pageleave: false,
            capture_performance: false,
            capture_dead_clicks: false,
            capture_exceptions: false,
            enable_heatmaps: false,
            disable_compression: true,
            disable_session_recording: true,
            disable_surveys: true,
            disable_web_experiments: true,
            disable_external_dependency_loading: true,
            advanced_disable_flags: true,
            person_profiles: "never",
            respect_dnt: true,
            request_batching: false,
            bootstrap: { distinctID: anonymousId, isIdentifiedID: false },
            before_send: (event) =>
              options.blocked()
                ? null
                : sanitizeEvent(event, anonymousId, options.key),
          };
          instance.init(options.key!, config);
          return instance;
        })
        .catch(() => null);
    return pending;
  }
  return {
    async track(event: string, properties: Record<string, unknown> = {}) {
      if (!Object.hasOwn(events, event) || options.blocked()) return;
      const safe = sanitizeEvent(
        { uuid: crypto.randomUUID(), event, properties },
        anonymousId,
      )!;
      const instance = await sdk();
      if (instance && !options.blocked())
        instance.capture(event, safe.properties);
    },
  };
}
export const analyticsConfigured = Boolean(
  import.meta.env.VITE_POSTHOG_KEY &&
  analyticsHost(
    import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
  ),
);
export function hasDoNotTrack() {
  return navigator.doNotTrack === "1" || navigator.doNotTrack === "yes";
}
let permitted = false;
try {
  permitted = localStorage.getItem("folionest-analytics") === "enabled";
} catch {
  /* No persistence means analytics stays disabled. */
}
const analytics = createAnalytics({
  key: import.meta.env.VITE_POSTHOG_KEY,
  host: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
  blocked: () => !permitted || hasDoNotTrack(),
  load: async () => (await import("posthog-js")).default,
});
export const track = analytics.track;
export function analyticsEnabled() {
  return permitted && !hasDoNotTrack();
}
export function setAnalyticsEnabled(enabled: boolean) {
  permitted = enabled && !hasDoNotTrack();
  try {
    localStorage.setItem(
      "folionest-analytics",
      permitted ? "enabled" : "disabled",
    );
  } catch {
    /* Choice applies to this visit. */
  }
}
