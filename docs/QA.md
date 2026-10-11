# Verification log

## Clearer browser-only portfolio hosting

- The illustrated guide now starts with Netlify Drop and gives exact sign-in, ZIP upload, Make public, private-window verification and same-address update steps. Expandable help covers blank pages, missing assets, stale layouts and the existing Cloudflare Pages Production upload path. Illustrations open larger in a new tab; no extra installation is needed. The ZIP README includes the same guidance.
- `npm run check` passed: lint, 53-file syntax validation, 32 unit/API tests and both builds. The four relevant browser tests passed: the guide on homepage/editor with keyboard/mobile checks, both templates' four real exports with offline ZIPs and bundled hosting instructions, and long-CV/incomplete-export behavior. The first guide runs found ambiguous selectors after adding nested help and larger-image links; exact/scoped selectors fixed the harness, and the complete four-test rerun passed.
- The latest compiled app passed `node scripts/run.js scripts/verify-production.js`, including guide assets, cutout/signature/PNG under CSP, metadata/routes and no browser-console errors. The temporary production server was stopped. The mobile guide viewport was visually inspected; text wraps without horizontal overflow, and small illustrations can be opened larger.
- Official Netlify Drop, visibility/pricing and Cloudflare Direct Upload instructions were checked on 2026-10-11. Netlify Free uses monthly credits and pauses at the limit; the guide discloses limits. No external account, upload or deployment was performed, and the user's existing hosted address has not been inspected because no URL was supplied.
- GitHub verification for `7b8de2d` and `0598aa1` completed successfully. GitHub resolves the latter's author to `Zubaer-Habib-Sayham` using the supplied email. Commits are real milestones on main; contribution graph timing is controlled by GitHub.

## Portrait cutouts, optional signatures and export parity

- `npm run check` passed: ESLint, syntax validation of 53 JavaScript/JSX files, 32 tests across eight files and client/server production builds. `npm run test:e2e` passed all 12 Chrome tests. `npm audit --omit=dev` reported zero vulnerabilities.
- Real CPU segmentation of the documented public-domain NASA fixture produced a transparent cutout with both opaque and clear pixels. Reload preserved it; restoring the original and uploading/removing a signature worked. Cancellation and a model-download failure preserved the original. Browser requests stayed local and GET-only. No private portrait was used in verification.
- Every template's downloaded ZIP was extracted and opened offline. Computed positions, dimensions, fonts and grid columns matched its live preview at equal desktop/mobile canvas widths. Studio's portrait region stayed below the display title. Gallery images were regenerated from the corrected shared renderer. An empty signature area contains no fabricated handwriting or typed name.
- Both Editorial and Studio passed all four actual file exports. Studio's ZIP contained the cutout, explicitly uploaded signature and project image; the normalized original was absent from assets and public JSON. All PDF pages were inspected against the selected corner color; CV text and PNG dimensions were checked. The current Studio PDF first page was visually reviewed for title/portrait separation and transparency.
- `node scripts/run.js scripts/verify-production.js` passed against the compiled local server on port 3002, exercising cutout/signature/PNG under the production CSP, first-response HTML/metadata, callbacks, 404s and no browser-console errors. This verifies local production output, not an external host.
- Earlier checks caught a development first-use reload, an oversized transparent PNG, dependency diagnostic traffic and a production-CSP-blocked data-image fetch. Dependency pre-optimization, bounded WebP encoding, a worker fetch guard installed before runtime import, and direct local data-image decoding resolved them. The diagnostic request occurred with a public test fixture; later checks verified no external transport. One overlapping browser invocation interfered with traces; final runs were sequential. A sandbox Vite realpath failure required verification outside filesystem isolation.
- Live Supabase Auth, hosted TLS/database operations, provider analytics ingestion and remote deployment remain unverified. Existing hosted ZIPs must be replaced with freshly downloaded exports to receive the layout fix. The whole application remains local pending final product approval.

## JavaScript migration

- Converted all 43 tracked source/config/test files from TypeScript to JavaScript/JSX and removed the TypeScript source/compiler configuration. Retained React, Vite, Express, runtime schemas, query ownership checks, styles and saved-document format. No EJS rewrite was needed.
- Compared all five rendered template HTML strings against pre-migration captures: byte-for-byte identical. Both production client asset hashes and CSS remained the same before the later requested visual fixes.
- `npm run check` passed: ESLint, JavaScript syntax validation, 31 tests across eight files and both production builds. `npm run test:e2e` passed all nine browser tests, including actual file artifacts, offline ZIP, guest persistence, keyboard/mobile and gallery previews.
- JavaScript syntax validation is not a TypeScript typecheck; runtime validation and behavior tests enforce the data boundaries. Earlier verification entries below describe the historical TypeScript setup and its actual commands.

## Requested UI revision: identity, branding and background

- Lint, typecheck, 30 unit/API tests and production builds passed. All six browser tests passed, including real exports, offline ZIP operation, four responsive layouts and keyboard operation. The guest test now verifies the whole-page Sage color, autosave and the JSON backup field. Older version-one backups default to their existing template background.
- Every template uses the owner’s name as its main heading. Decorative arrows were removed; reorder buttons retain descriptive accessible names and plain Up/Down text. The navbar and favicon use the supplied mark through a tighter SVG viewport and contrasting badge. Developer credit and the supplied email are visible in the footer. Account access opens the existing optional cloud panel.
- The first isolated unit-test invocation could not read its temporary transformed modules; rerunning with access to the normal test-runner temporary directory passed. This was an environment limitation, not a passing result for the failed invocation.
- Cloud services remain unconfigured, so provider sign-up and live database access are still unverified. No online deployment was performed.

## Creative Studio and full gallery previews

- Lint, typecheck, 31 unit/API tests and production builds passed. Eight browser tests passed. These cover all five templates on desktop/mobile, full-page gallery hover and keyboard focus, reduced motion, and real CV/PDF/PNG/ZIP exports for both Editorial and Creative Studio.
- The studio ZIP was extracted and opened with the browser offline. Both photos decoded, the CSS applied, the name was the main heading and the locally bundled Barlow Condensed font loaded. The font is also embedded in image capture so export typography does not depend on the host machine’s installed fonts. Its OFL license is included.
- The API test applies every migration in sequence to PostgreSQL, saves/loads a Studio draft with Sage background, and verifies a second account cannot retrieve it. Existing ownership, publishing and RLS checks also passed. This does not verify live Supabase provisioning.
- Full-page gallery images were generated from the shared renderer and their actual dimensions recorded. The studio mobile screenshot and generated full preview were visually inspected. No fake portrait, testimonial or skill percentage was introduced. Uploaded portraits keep their original background; automatic cutout is not available.

## Illustrated hosting, complete backgrounds and final persistence checks

- Lint, typecheck, 31 unit/API/proxy tests and production builds passed. All nine browser tests passed. PDF checks render every exported page in Chrome using the actual PDF.js library and inspect all four corners against the selected color with a two-channel-level tolerance for PDF quantization. They inspect CV selectable text, PNG dimensions, photos and the independently operating offline ZIP/font as well.
- CV and portfolio PDF pages use the complete selected background. Portfolio images fill the A4 width without an added white margin; the nonfunctional back-to-top footer is omitted from PDF capture to avoid a footer-only extra page. PNG and website exports retain the complete website footer. The background also continues beyond the centered portfolio on public pages and extracted websites.
- The four original hosting illustrations loaded on desktop and mobile; the in-editor guide expands by keyboard. Its browser ZIP-upload instructions were checked against Cloudflare’s official Direct Upload documentation. No external hosting account or website was created by this guide verification.
- `npm exec tsx scripts/verify-analytics.ts` passed against a separate fake-key preview. Two real-SDK events (`site_opened` and a numbered completed step) were intercepted. Only fixed allowlisted properties and the public project key were present; deliberately private names/writing were absent. Consent-off and Do Not Track prevented requests. The separate preview was stopped afterward. Real provider ingestion remains unverified.
- `npm exec tsx scripts/verify-production.ts` passed against the compiled local app on port 3002, checking initial HTML/canonical/CSP, Studio dark/Sage guest edits, photo/PNG export, guide assets, Account and bounded callback routes, missing-page statuses and no browser-console errors. Production dependency audit reported zero vulnerabilities. The temporary compiled server was stopped; the main localhost preview remains running.
- Visual review caught an oversized display word wrapping its last letter; fixed and added a one-line width assertion to preview generation and the offline ZIP check. The PDF test harness initially used an unavailable module route and removed PDF API options; those were corrected before the passing run. An immediate restore/navigation check also exposed the 450 ms autosave window: a page-hide flush now preserves the valid restored draft, and the regression check passed.
- Gallery selection changes and autosaves the design while retaining existing content and photos. The final guest checks verify this behavior, account access, invalid restore preservation, mobile, keyboard and reduced motion. Live Supabase provisioning/provider authentication, hosted database TLS, actual online publishing, real analytics ingestion and search-engine submission remain outstanding. Nothing has been deployed online; final product approval is still required.

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
