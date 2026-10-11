# Verification log

## Developer contact links

- Added the four supplied social/contact destinations to the developer footer. WhatsApp displays the supplied local number and uses its Bangladesh international dialing form in the HTTPS link. New tabs use opener protection; analytics records only the existing generic contact type.
- `npm run check` passed lint, 57-file syntax validation, 34 unit/API tests and both builds. Four guest browser tests passed, including exact contact destinations, signed-out persistence/JSON, optional cloud dialog and mobile/keyboard/reduced-motion workflows. No external contact messages were sent.

## Creative Studio photographic gallery

- Added a fictional transparent portrait and two matching illustrative project covers using the built-in image generation tool. Asset provenance and prompts are in `assets/gallery/studio/README.md`. All three optimized rasters pass the unchanged 96 KB/1,200-pixel validation bounds. The actual shared renderer generated the 960 × 2648 gallery JPEG (220,613 bytes); only that flattened image is loaded by visitors.
- `npm run check` passed lint, syntax validation in 57 files, all 34 unit/API tests across nine files and both production builds. The complete corrected `npm run test:e2e` passed 14 Chrome tests in 1.4 minutes, including all four real exports, offline ZIP operation, one-page A4 résumés, guest persistence/JSON, keyboard/reduced motion, local cutouts and gallery loading.
- The new Studio case tests the final transparent WebP in the live renderer at 375, 600, 799, 923 and 960-pixel viewport sizes. It verifies transparent corner pixels, contained photo sizing, round circle proportions, aligned right/bottom edges, title clearance and two project images. Selecting Studio from the gallery preserves the saved name and portrait. Mobile and desktop screenshots were visually inspected alongside the generated full-page gallery image.
- `node scripts/run.js scripts/verify-production.js` passed on the compiled local app: the new JPEG loads under the actual CSP, existing guest/export flows work, metadata/routes remain valid and no browser-console errors occur. Local gallery-image HTTP status is 200. The temporary compiled server was stopped; development remains on port 5173.
- The first isolated unit run hit the previously observed test-runner temporary-module access failure; the permitted rerun passed. The initial new browser case omitted navigation to Review & export before Full preview; its harness was corrected, then the relevant three cases and complete fourteen-case suite passed. Source-image encoding initially exceeded the size bound or included disallowed color-profile metadata; optimized files now pass existing validation without weakening it.
- The previous résumé milestone's GitHub Actions run completed successfully. This slice changes gallery imagery, not deployed hosting or cloud configuration. Hosted Supabase/authentication, live analytics ingestion, Safari/Firefox and the user's existing hosted address remain unverified. Whole-application publication requires the user's final approval.

## One-page A4 résumé

- Replaced the former CV button with Download résumé. All five templates use the shared renderer with print-only composition, selected colors/fonts/photos, shorter excerpts and leading records in the user's chosen order. Hidden content stays hidden, and the original draft is unchanged. Full Portfolio PDF, PNG and offline website ZIP remain available.
- `npm run check` passed ESLint, syntax validation in 56 files, 34 unit/API tests across nine files and both builds. `npm run test:e2e` passed all 13 Chrome tests in 1.2 minutes. The new browser case downloads a résumé from every template using long prose, twelve records per collection, forty skills, twelve links, a portrait and real contact URLs. PDF.js confirms exactly one A4 page (595.28 × 841.89 points), clickable email/website annotations and unchanged browser storage. Unit checks cover hidden sections, item order, export-copy immutability and surrogate pairs.
- Editorial and Studio also passed all four actual exports, full-page color checks, PNG dimensions and independently operating offline ZIPs. Preview/ZIP computed geometry still matches at equal desktop/mobile canvas widths. Guest persistence, JSON restore, editor modes, mobile/keyboard/reduced-motion flows, optional cloud dialog, real portrait processing and the hosting guide passed. Page-error checks were clear.
- Actual downloaded résumé PDFs for all five templates were rendered with Poppler and visually inspected. The approximately 288 DPI captures retain readable body copy, photos, distinct layouts, footer and complete backgrounds on one page. Capture waits for fonts/images and the resized frame's paint before cloning. The résumé is rasterized, without selectable/tagged text; it is intended for visually faithful printing rather than automated text parsing. No physical printer, Safari or Firefox was tested. Print at Actual size on A4 portrait; the selected page background continues to the edge, subject to the printer's hardware margins.
- Early runs exposed Studio overflow, an over-limit test contact string and an obsolete PDF.js cleanup method. Print spacing/excerpt profiles and the test harness were corrected before the passing runs. Diagnostic measurements from a page without a doctype were not used as final proof. Extremely long headings or contact details that still exceed one readable sheet produce a shortening prompt instead of downloading clipped content.
- `node scripts/run.js scripts/verify-production.js` passed against the compiled client/server on port 3002: one-page A4 résumé, cutout/signature/PNG under CSP, initial HTML/metadata, callback routes, noindex, 404s and no browser-console errors. Loopback HTTP uses non-production configuration; setting production mode with HTTP was correctly rejected by the HTTPS-origin check. Hosted HTTPS, Supabase and provider ingestion remain untested. The temporary server was stopped; the development preview remains on port 5173.
- `npm audit --omit=dev` reported zero vulnerabilities. The first isolated audit could not resolve the registry; the permitted network rerun succeeded. The layout fix's GitHub Actions run passed. No online application deployment occurred.

## Proportional Studio portrait geometry

- The user supplied screenshots with different canvas widths. The circle previously capped at 440 pixels while the photo continued growing; fixed pixel heights also changed their proportions. The circle now tracks the photo width and both use an aspect-ratio frame and proportional offset. The title reserves space for its vertical transform and the circle overhang.
- `npm run check` passed lint, syntax validation, all 32 unit/API tests and both builds. Four relevant browser tests passed, including matching preview/ZIP geometry for all five templates and actual PDF/PNG/ZIP artifacts. Studio circles were checked at 375, 600, 799, 923, 960 and 1366 pixels: round, equal photo/circle widths, aligned edges and clear of the title. The 923-pixel standalone screenshot was visually reviewed. Gallery assets were regenerated.
- The initial visual review exposed a circle reaching into the display title; added proportional spacing and checks for the circle itself before the passing rerun. The user's hosted URL remains unavailable, so its deployed CSS/version has not been inspected. A new ZIP must replace an old deployment.

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
