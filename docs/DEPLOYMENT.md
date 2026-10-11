# Deployment after product approval

No website or hosting service has been deployed. Review the local product and approve its design, layout and features first. GitHub pushes are code backups and do not constitute launch approval. The supplied Blueprint sets `autoDeployTrigger: off`; keep Cloudflare production deployment disabled until approval too.

## Recommended free arrangement

Cloudflare Pages serves React/Vite assets, the prerendered landing page and static robots. A tiny Pages function proxies only `/api/*`, `/p/*` and `/sitemap.xml` to Express on Render Free. Supabase Free supplies PostgreSQL and Auth. There is no additional database, file-storage server, Docker or queue infrastructure. Stored photos are compressed into portfolio JSON, and exported websites have independent local assets.

Current free constraints were checked against provider documentation on 2026-10-11: [Render free service behavior](https://render.com/docs/free), [Supabase Free plan](https://supabase.com/pricing), [project pausing](https://supabase.com/docs/guides/platform/free-project-pausing), and [Pages Functions pricing](https://developers.cloudflare.com/pages/functions/pricing/). Render sleeps after fifteen idle minutes and can take about a minute to wake; its idle `robots.txt` response blocks crawlers. Supabase Free has a 500 MB database and can pause low-activity projects. Pages static assets are free; Functions consume the Workers free quota, currently 100,000 daily requests across the account. Verify limits and plan selection again at deployment time. Free hosting does not guarantee uninterrupted uptime, permanent prices or unlimited use.

## Supabase

Create FolioNest in a verified Free organization. Apply all committed SQL migrations in filename order (including the Studio constraint migration) and configure email/password Auth, Site URL, exact redirect allowlist and SMTP as described in README. Use the session-pooler database URL for Render's IPv4 connectivity. Set the project URL and public publishable key on both server and client. Store the password/database URL only in the server environment.

If the connection's CA is not in Node's trust store, copy the trusted PEM from the project Connect panel into optional server-only `DATABASE_CA_CERT`; it accepts actual newlines or literal `\n`. Never disable certificate verification to make a failed connection appear successful. Live cloud connection and email delivery have not been tested in this build.

## Hosting a downloaded portfolio ZIP

The illustrated homepage/export guide now uses Netlify Drop for the exported standalone portfolio. Sign in on the Free plan, open [Netlify Drop](https://app.netlify.com/drop), and upload the entire fresh Website ZIP. Once deployment succeeds, choose **Make public** if private, then check the included `netlify.app` address in a private window. For updates, extract the new ZIP with the operating system's built-in utility and drop that folder under **Production deploys** in the same project. `index.html` and `styles.css` must be directly inside that folder, alongside assets/fonts. See the [official Drop guide](https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/) and [project visibility instructions](https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/).

Netlify's current Free plan includes 300 monthly credits; production deploys, traffic and requests consume credits. Sites pause when limits are reached. An included address needs no purchased domain; the guide does not promise unlimited free hosting. Check [current pricing and limits](https://www.netlify.com/pricing/) before uploading. Provider instructions were checked on 2026-10-11.

An existing Cloudflare Pages portfolio can keep its address: choose **Create a new deployment**, **Production**, upload the fresh ZIP and **Save and Deploy**. Wait for completion and open its `pages.dev` address. For a new Pages project the path is **Workers & Pages**, **Create application**, **Get started**, **Drag and drop your files**, then name/upload/**Deploy site**. See [Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/). An old ZIP will retain its old layout until replaced. If a page is blank or missing styles/photos, verify upload completion and that all files were uploaded together; test the extracted index locally before another upload.

No hosting account or external deployment was created by this verification. The illustrations are original step diagrams, labeled as illustrations. The exported README carries the same instructions. This static portfolio workflow does not deploy the FolioNest builder/API, whose approved setup remains below.

## Render API

1. After approval, connect this repository and use `render.yaml` to create `folionest-api` on the **Free** plan in Singapore. No Render PostgreSQL instance or persistent disk is needed. Confirm no paid plan or add-on is selected.
2. Set `APP_ORIGIN` to the final public Pages HTTPS origin. Set `DATABASE_URL`, optional `DATABASE_CA_CERT`, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. The Blueprint also asks for the browser-safe Supabase variables because it builds a fallback client. Leave analytics blank unless explicitly wanted.
3. Build: `npm ci --include=dev && npm run build`. Start: `npm start`. Node 24 LTS, `NODE_ENV=production`; Render supplies `PORT`, and Express listens on `0.0.0.0`. Health path: `/api/health`.
4. Use a manual deployment and verify health, database save/load and public HTML. Health confirms process availability, not database connectivity. Keep automatic deployment off during product review and future unapproved changes.

The Blueprint passed Render's official JSON Schema using AJV locally; provider-side creation/semantic validation has not run. To reproduce, download `https://render.com/schema/render.yaml.json` and run `npm exec --yes --package=ajv-cli@5.0.0 -- ajv validate --spec=draft2020 --strict=false -s PATH_TO_SCHEMA -d render.yaml`. The validator ignored the unused `uri` format annotation; this Blueprint has no domain/maintenance URI fields.

## Cloudflare Pages

1. After approval, connect the repository with project root at this workspace root. Build `npm ci && npm run build`; output directory `client/dist`. The root `functions/` directory supplies the proxy. Set Node version 24 in the build environment.
2. Set build variables `APP_ORIGIN`, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to the same public/project settings. Optional analytics uses `VITE_POSTHOG_KEY` and US/EU `VITE_POSTHOG_HOST`; it remains disabled by default for visitors.
3. Set runtime `API_ORIGIN` to the exact HTTPS Render origin, without a path, credentials or trailing query. It is an upstream origin only, never a user-supplied redirect. Do not add a database URL or server secret to Pages.
4. Build output includes static `robots.txt`, `portfolio.css`, a builder entry with noindex, a real 404 page, `_headers` security/private headers and `_routes.json` excluding static traffic from Functions. Do not add an SPA rewrite that intercepts `/p/*` or turns missing public pages into HTTP 200.
5. Set Supabase's final Site URL and exact `/builder` redirect URLs. Verify the public hostname's raw landing/public HTML, static CSS and brand images, builder navigation and refresh, email callback, API ownership, publishing/unpublishing, sitemap and noindex headers. Confirm previews/alternate hostnames do not become canonical production URLs.

## Cold starts and launch checks

The proxy uses a fifteen-second upstream timeout and returns an actionable no-store/noindex 503 when Render has not woken yet. A minute-long cold start can exceed that timeout; retry after the service wakes. Do not advertise free hosting as always on or interpret an active local server as a tested cold start. Static guest editing/exports can remain available even when cloud services sleep.

Test through the Pages hostname after at least fifteen idle minutes. Inspect robots before and during the cold start: it must remain the static crawl policy. Verify API failures do not lose a local draft, and no stale public page is served after unpublishing. Follow `SEO_CHECKLIST.md` before Search Console submission.

If initially deploying as a single Render service, its built client and SSR work together, but idle Render robots behavior makes that free arrangement unsuitable for a reliable SEO launch. The split configuration avoids that robots dependency. Custom domains, SMTP and higher usage may involve costs; provider subdomains support the initial free demo. No domain purchase is required.
