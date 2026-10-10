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
