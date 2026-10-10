# Verification log

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
