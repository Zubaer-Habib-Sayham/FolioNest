# Optional usage analytics

Set the public project token in `VITE_POSTHOG_KEY` and the ingestion origin in `VITE_POSTHOG_HOST` before building. Supported origins are `https://us.i.posthog.com` and `https://eu.i.posthog.com`. Leave the token blank to omit all analytics requests. Configure the same public variables on Express so its CSP allows that ingestion origin.

Analytics is disabled by default. The footer's Privacy & analytics control enables it explicitly and stores only that preference. Do Not Track overrides consent. Turning analytics off immediately blocks capture and the final send hook. The SDK loads only when an allowed event occurs after consent. Failure to load it has no effect on editing or exports.

Tracked events: `site_opened` (only the fixed page value `landing`, `templates` or `builder`), `landing_cta_clicked`, `builder_started`, `template_selected` (fixed template ID), `builder_step_completed` (numbered step), `export_downloaded` (fixed format) and `contact_link_clicked` (email/website type only). `site_opened` is an explicit page-load event, or a single event when a visitor first enables analytics. Automatic pageviews remain disabled; no page address, authentication callback or query is sent. Export events occur only after successful artifact creation. Allowed formats are `json`, `resume_pdf`, `portfolio_pdf`, `png` and `website_zip`; the retired CV format is no longer accepted.

## Reading the numbers after launch

1. Create your PostHog project and copy its public project token into `VITE_POSTHOG_KEY`. Choose the matching US/EU ingestion origin in `VITE_POSTHOG_HOST`. Set both in the client build and Express environment, then rebuild after launch approval. Keep autocapture and replay disabled.
2. In PostHog, open Product analytics and create a Trends insight using total events for `site_opened`. Break it down by `page` to see consenting landing/gallery/builder visits. This counts visits, not distinct human visitors.
3. Create another Trends insight for `builder_started` to see builder openings. For successful completion signals, use `export_downloaded` and break it down by `format`; exclude `json` to focus on finished file exports. A person can download several formats, so exports are actions, not an exact number of portfolios or people.
4. Save these insights to a dashboard named FolioNest. Add `template_selected` by `template` and completed steps by `step` if you want to see which designs and steps are used.

IDs deliberately reset on every page load, so cross-page funnels and unique-person counts are not reliable. Visitors who do not consent, use Do Not Track, block the SDK or are offline are not counted. The measurements are partial adoption signals, not a census. For an exact count of cloud records after Supabase is connected, the site owner can run this aggregate in the project SQL editor; it returns no draft content or account information:

```sql
select count(*) as saved_portfolios,
       count(*) filter (where is_published) as published_portfolios
from public.portfolios;
```

Guest-only portfolios cannot be counted exactly without changing the privacy model. The private owner dashboard is [FolioNest usage](https://us.posthog.com/project/658373/dashboard/2196935). Sign in, select a date range and refresh. It contains **Consented visits by page**, **Builder openings**, and **Completed downloads by format**. Initial results (six page events, three builder openings, two website ZIP downloads) came from launch verification, not organic visitors. Real SDK ingestion returned HTTP 200 and the native dashboard displayed the corresponding events. Offline use of downloaded websites is intentionally untracked. See [PostHog Trends](https://posthog.com/docs/product-analytics/trends/overview) and [dashboard instructions](https://posthog.com/docs/product-analytics/dashboards).

The project uses Asia/Dhaka and IP anonymization. Project autocapture, replay, console capture, performance, exceptions, web vitals, heatmaps and surveys are disabled. The dashboard is pinned and private; no subscriptions or alerts were created.

There is no automatic click capture, replay, survey, experiment, performance collection, remote feature configuration, identity call or person profile. IDs are random per page load and remain in memory. The final `before_send` hook removes all properties except that anonymous ID, the event's exact enum properties, flags disabling person profiles/geolocation and the configured public analytics project token required for ingestion. It drops automatic/unknown events and all identity, URL, referrer and person-property payloads. Drafts, names, emails, authentication tokens, photo bytes and form values are never passed to analytics. Exported ZIPs and server-rendered public portfolios have no analytics script.

As with any optional third-party network request, the ingestion provider can see the connection's IP address; FolioNest requests no geolocation enrichment. Read the provider's data-handling policy when enabling the service. No paid or secret analytics key is needed in the client. Tests use a fake SDK; an intercepted browser smoke check verifies the real SDK payload without sending visitor data to a provider.
