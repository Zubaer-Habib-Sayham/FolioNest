# Verification log

## Requested UI revision: identity, branding and background

- Lint, typecheck, 30 unit/API tests and production builds passed. All six browser tests passed, including real exports, offline ZIP operation, four responsive layouts and keyboard operation. The guest test now verifies the whole-page Sage color, autosave and the JSON backup field. Older version-one backups default to their existing template background.
- Every template uses the owner’s name as its main heading. Decorative arrows were removed; reorder buttons retain descriptive accessible names and plain Up/Down text. The navbar and favicon use the supplied mark through a tighter SVG viewport and contrasting badge. Developer credit and the supplied email are visible in the footer. Account access opens the existing optional cloud panel.
- The first isolated unit-test invocation could not read its temporary transformed modules; rerunning with access to the normal test-runner temporary directory passed. This was an environment limitation, not a passing result for the failed invocation.
- Cloud services remain unconfigured, so provider sign-up and live database access are still unverified. No online deployment was performed.

## Foundation

- `npm run check`: lint, typecheck, 1 unit test and both production builds passed.
- Local preview returned HTTP 200.

## Guest editor and templates

- `npm run check`: lint, typecheck, 5 unit tests and both builds passed.
- `npm run test:e2e`: 2 Chrome tests passed. They exercised signed-out editing, skills, project ordering, four template switches, editor/portfolio mode independence, autosave/reload, section ordering/colors/visibility, JSON download and confirmed import, invalid import preservation, mobile preview, keyboard skip link and reduced motion. No page errors in the desktop flow.
- Inspected desktop and mobile screenshots. Screenshots and downloads stay in ignored artifacts directories.
- The first browser run failed because test selectors omitted the spaces in accessible step names; selectors were corrected and rerun successfully.
- A sandbox-only test-runner temporary-file error was resolved by running verification outside isolation; no application change was needed.
- Cloud integrations remain unconfigured.

## File exports

- `npm run check`: lint, typecheck, 7 unit tests and both builds passed.
- `npm run test:e2e`: 4 Chrome tests passed, including all four file exports and long-text CV pagination.
- Downloaded actual files: selectable-text CV PDF 43,231 bytes; two-page portfolio PDF 139,631 bytes; 960-pixel-wide PNG 216,891 bytes; independent website ZIP 4,638 bytes.
- PDF inspection extracted the expected name and project title from the CV and parsed the portfolio PDF's pages and drawing operators. PNG signature and dimensions were verified.
- ZIP extracted and opened by Chrome with network disabled. HTML content and CSS applied, with no browser page errors. It contains index.html, styles.css, script.js and README.txt.
- Poppler rendered both pages of each PDF. All four page images and the portfolio PNG were visually inspected; no missing text, overlaps or clipped sample content were observed.
- First-export development reload was found and fixed by pre-optimizing dependencies. Export-heavy rendering and PDF libraries remain loaded only on demand.
- Limits: page PDF is rasterized; CV text is selectable. Noto Sans lacks some scripts/symbols; unsupported CV characters produce an actionable error recommending Portfolio PDF. Captures over 18,000 pixels high and artifacts over 30 MB are rejected before download.

## Cloud boundaries and public pages

- `npm run check`: lint, typecheck, 21 tests across five files and production builds passed. `npm run test:e2e`: five Chrome tests passed.
- Tests apply the actual migration to PGlite's PostgreSQL engine. Two test accounts exercise parameterized ownership predicates, RLS reads, forbidden direct writes, duplicate/invalid slugs, stale-draft publishing, snapshots, hidden content, publishing/unpublishing and sitemap exclusions. Token verification is injected in these tests; they do not verify a live Supabase Auth provider.
- Public HTML tests inspect real content, canonical/Open Graph/Person metadata, escaped hostile text, status codes and private-page noindex rules. Optional cloud setup leaves guest editing available and its dialog supports keyboard operation.
- An initial production prerender failed because the script lacked its React import; corrected and the full check rerun successfully.
- The compiled production server was started locally for HTTP smoke testing. No hosted deployment has been performed.
- Supabase provisioning and live email authentication remain unverified: the connected project's cost-confirmation lookup is unavailable. No existing external database was modified.

## Photo uploads

- `npm run check`: lint, typecheck, 23 unit/API tests and production builds passed. Five end-to-end tests passed, now including real portrait and project uploads, JPEG conversion, persistence after reload and an offline extracted ZIP with two decodable JPEG assets.
- Visually inspected the exported website screenshot with both images. Raster-only schema tests reject SVG, remote URLs and malformed content; older backups restore with empty optional photo fields.
- The initial migration remains unapplied remotely; its payload limits were updated for photos. Original uploads never leave the browser. Saved cloud photos will be inside the bounded JSON document, rather than an additional storage service.

## Analytics and hosting preparation

- `npm run check`: lint, typecheck, 29 unit/API/proxy tests and production builds passed; all five Chrome end-to-end tests passed.
- A separate preview with a fake public analytics key was tested using `npm exec tsx -- scripts/verify-analytics.ts`. The real SDK emitted one intercepted step event, no requests before consent and no events after opt-out. Every event property was allowlisted; deliberately private form text was absent. Nothing was sent to the analytics provider.
- The browser harness needed standard browser signals because the SDK excludes headless/automated browsers. A real integration fault was also caught: removing the SDK's public ingestion key caused it to drop events. The sanitizer now inserts only the configured public project key, never an authentication token. The test parses the actual batch transport envelope.
- The Pages proxy's local tests check static-route exclusion, validated HTTPS upstream configuration, authorization forwarding, no-store private responses, preserved status/noindex and actionable upstream-failure 503s. Deployment configuration is prepared with automatic deploys off. Cloudflare/Render hosted behavior and cold starts have not been tested.

## Final local review

- The expanded suite passed 30 unit/API/proxy tests across eight files and six Chrome end-to-end tests. Lint, typecheck and both production builds passed. Production dependency audit reported zero vulnerabilities.
- All four actual landing thumbnails loaded. Each template with a portrait was checked at 1366-pixel desktop and 390-pixel mobile widths; no horizontal overflow or page errors. Screenshots were reviewed for Bento mobile and Quest desktop as well as the earlier export/mobile/desktop artifacts. An initial layout test used the wrong Preview button label; corrected to the actual accessible name and rerun successfully.
- `npm exec tsx -- scripts/verify-production.ts` passed against the compiled server on port 3002: meaningful initial HTML, one canonical URL, CSP, real guest edits/photo/PNG, email callback routing, correct 404s and no browser-console errors. This is a local built app check, not a hosted deployment.
- Real-SDK analytics verification also checked Do Not Track with an enabled stored preference: zero analytics requests. Intercepted payloads contain only allowed properties and the public ingestion key. The separate fake-key preview was stopped after verification.
- `render.yaml` passed AJV validation against Render's official current JSON Schema. The unused `uri` annotation was ignored by that validator. No Render service was created.
- Cloud listings now return summaries, not entire draft/photo/snapshot documents. The builder accepts only bounded known callback query parameters, opens the cloud panel for callbacks, and strips callback parameters after session processing. Invalid optional client Auth configuration yields the setup state. Trusted database CA configuration is optional; certificate verification stays enabled.
- Re-rendered and visually inspected both pages of the current portfolio PDF after adding photos. It remains two A4 pages with no clipped text or missing images. Current artifacts: CV 43,231 bytes, portfolio PDF 160,190 bytes, PNG 233,697 bytes and website ZIP 15,801 bytes. These ignored fixtures are not shipped as user data.
- Remaining external checks: free Supabase project creation, migration application, provider sign-up/email-confirmation/sign-in/sign-out, real-account cross-access tests, TLS to the hosted database, Cloudflare/Render deployment and cold starts, real analytics project ingestion, Search Console and social previews. These were not executed. The connected cost lookup still returns an unavailable-tool error; existing external projects were untouched.
