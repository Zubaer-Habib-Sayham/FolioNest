# Deployment

Publication was approved on 2026-10-11. The builder is live at **https://folionest.onrender.com**, using the Free Render service **folionest** (`srv-db5nnjcs728c738ekrb0`) in Singapore, the Free Supabase project FolioNest (`vdolkritobdicnqoywiv`), and consent-based PostHog analytics. No paid service, disk, domain or Render database was created. Automatic deployment is off.

## Current configuration

- Repository: https://github.com/Zubaer-Habib-Sayham/FolioNest, branch main.
- [Render service](https://dashboard.render.com/web/srv-db5nnjcs728c738ekrb0): Node 24.21.0, Free, Singapore. Build: `npm ci --include=dev && npm run build`. Start: `npm start`. Express binds the hosting-provided PORT on 0.0.0.0.
- APP_ORIGIN: https://folionest.onrender.com on server and build. Render's assigned RENDER_EXTERNAL_URL is a validated HTTPS fallback when APP_ORIGIN is absent.
- All three Supabase migrations are applied. RLS is enabled; anonymous draft reads and direct browser writes are denied. The session-pooler connection passed SELECT 1 with strict TLS and the project's trusted CA.
- Supabase Site URL: https://folionest.onrender.com. Exact redirect: https://folionest.onrender.com/builder. Public email registration requires custom SMTP; [free GitHub sign-in setup](FREE_AUTH_SETUP.md) is configured. Successful real-account cloud workflows still need verification.
- Public Supabase URL/key and PostHog ingestion token/host are build variables. DATABASE_URL and DATABASE_CA_CERT belong only in the server environment. No elevated API key is needed. Never disable TLS certificate verification.
- Health endpoint: /api/health. It checks process availability, not database connectivity. The connector-created service did not configure a provider health-check path; set that path in Render if desired.

For a release, run `npm run check` and relevant browser tests, review the diff, commit and push, then manually deploy the exact commit. Confirm the deployment's live status and repeat production checks. Browser environment changes require a rebuild. Set VITE_GITHUB_AUTH_ENABLED=true only with a configured provider; keep VITE_EMAIL_SIGNUP_ENABLED=false without verified SMTP. Existing confirmed email accounts can still sign in.

## Free hosting limits

Render Free sleeps after fifteen idle minutes and can take about a minute to wake. Its idle robots response can block crawlers. Supabase Free has quotas and can pause low-activity projects. These limits mean the current deployment is a free demo, with limited availability and SEO reliability. An idle-cycle test and load testing have not been executed. Maintain independent database backups. Free plans do not guarantee permanent prices, unlimited usage or uninterrupted service.

Sources checked on 2026-10-11: [Render Free](https://render.com/docs/free), [Supabase pricing](https://supabase.com/pricing), [project pausing](https://supabase.com/docs/guides/platform/free-project-pausing).

## Optional future static frontend

The repository prepares, but has not deployed, Cloudflare Pages for client assets, prerendered landing/gallery pages and static robots. Its root functions directory proxies only API, public portfolio pages and sitemap to Express. No extra database, storage server, queue or Docker is needed.

Build `npm ci && npm run build`; publish client/dist. Set Node 24, APP_ORIGIN to the new public hostname, and public VITE Supabase/analytics values. Set runtime API_ORIGIN to the exact HTTPS Render origin. Keep database secrets off Pages. Update Supabase's exact callback allowlist and server canonical origin consistently. Do not add an SPA rewrite that intercepts public portfolios or turns missing pages into HTTP 200.

Pages static assets are free; Functions consume the Workers quota (currently 100,000 daily requests across the account). The proxy has a fifteen-second timeout and returns an actionable no-store/noindex 503 if Express has not woken. A longer cold start can require a retry. Static guest editing and exports can remain available while cloud services sleep; dynamic portfolio pages still depend on Express. Verify routing, callbacks, ownership, robots, sitemap and cold starts through the new hostname before claiming that setup works. [Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/).

The reusable render.yaml passed the official JSON Schema locally; the actual service was created through the connector and its build/start succeeded. Another installation can use that Blueprint on the Free plan; do not create a duplicate for the current app.

## Hosting an exported portfolio

The video and illustrated guide in the app explain browser-only hosting. On Netlify Free, open [Netlify Drop](https://app.netlify.com/drop), upload the fresh Website ZIP and wait for deployment. Choose Make public if private, then check the netlify.app address in a private window. For updates, use the operating system's built-in ZIP extraction and drop the complete folder under Production deploys. The folder must contain index.html, styles.css and all assets/fonts together.

Netlify Free currently includes 300 monthly credits; deployments, requests and traffic consume them, and sites pause when limits are reached. No purchased domain is required. [Drop guide](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/), [visibility](https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/), [pricing](https://www.netlify.com/pricing/).

For an existing Cloudflare Pages portfolio, create a Production deployment, upload the complete fresh ZIP, save/deploy, then inspect its pages.dev address after completion. For a new project: Workers & Pages → Create application → Get started → Drag and drop your files. [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/).

For a multi-design ZIP, extract it first and upload one complete inner design folder. Uploading the entire collection creates a chooser. Old ZIPs retain old layouts until replaced. If blank or unstyled, verify deployment completion and all files before retrying. Exported artifacts were opened and verified offline; a visitor's external hosting upload was not performed by these checks.

See [SEO checklist](SEO_CHECKLIST.md), [analytics](ANALYTICS.md), and [QA](QA.md) for actual checks and remaining limitations.
