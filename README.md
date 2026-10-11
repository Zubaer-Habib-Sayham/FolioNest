# FolioNest

**Live website: [folionest.onrender.com](https://folionest.onrender.com)**

A portfolio builder with eleven responsive designs, local drafts and useful exports. Building, editing, saving on your device and downloading require no account. Supabase accounts are optional and required for cloud saves and public links.

Source uses JavaScript/JSX with React and Express. Runtime Zod schemas validate documents and requests. `npm run validate` checks JavaScript syntax; the project no longer requires a TypeScript compiler or typecheck.

## Run locally

Use Node.js 24 LTS (minimum 22.12) and npm. No Docker or hosted service is needed for the guest workflow.

```sh
npm ci
cp .env.example .env
npm run dev
```

On PowerShell use `Copy-Item .env.example .env`. Open `http://127.0.0.1:5173/`; the API runs on port 3001. Blank cloud and analytics values are supported. Do not commit `.env`. To run built software use `npm run build` then `npm start`; visit port 3001. For this local built preview set `APP_ORIGIN=http://127.0.0.1:3001`. Production requires `NODE_ENV=production` and an HTTPS `APP_ORIGIN`.

## Working features

- Editorial, Pinboard/Bento, Motion Story, Quest/Level-Up, Creative Studio, Monograph, Portrait Motion, Quiet Atelier, Cinematic, Ember and Golden Hour layouts, with full-page gallery previews generated from the actual shared renderer. Photographic previews use consistent fictional male/female models.
- Eight featured desktop designs and six on mobile. The searchable `/templates` collection supports style filters and incremental loading for future additions. Shortlist up to four designs, switch among them while editing the same content, and download their independent websites together.
- Guided forms for identity, biography, skills, projects, career, education, achievements and contact links. Reorder projects and sections with keyboard-accessible buttons, hide sections and choose section colors, whole-page background, palette, font and portfolio appearance. Editor appearance is independent.
- Validated local autosave, backup download and confirmed JSON restore. Optional portrait and project photos are resized and stripped of original metadata on your device. Creative Studio and the six photographic designs include local background removal with live cutout preview/original restoration; signatures are optional uploaded images.
- A one-page A4 résumé retaining the selected template's design with shorter excerpts and leading items, plus a complete paginated portfolio PDF, full-page PNG and standalone website ZIP with required images/fonts. The ZIP runs offline without an account or connection to FolioNest. An illustrated guide explains free browser-only hosting.
- Optional Supabase sign-up/sign-in/sign-out, explicit cloud save/load/delete, publishing confirmation, unique slugs and unpublishing. Server queries enforce ownership. Public pages use snapshots, so saving a private edit does not change a live page.
- Public HTML includes portfolio content in its first response, canonical/Open Graph/Person metadata, controlled indexing, sitemap and robots. Private routes are noindex.
- Optional, disabled-by-default usage analytics with explicit consent, Do Not Track and a strict property allowlist. No form contents, images or authentication tokens are sent.

## Cloud setup

The deployed app uses the FolioNest project in a Free Supabase organization. All three migrations are applied, PostgreSQL connectivity passed with verified TLS, and browser table access remains restricted. Public email registration requires custom SMTP; GitHub sign-in is an optional free alternative being configured. See [free account setup](docs/FREE_AUTH_SETUP.md). Successful real-account cloud management and two-account provider checks are still outstanding.

1. Run all committed SQL files in `supabase/migrations/` in filename order using Supabase's SQL editor or CLI. The initial migration creates private drafts and publication snapshots, RLS and indexes; later migrations permit Creative Studio and the six photographic designs. Browser Data API writes remain revoked. Do not disable those protections.
2. Enable email/password Auth and keep email confirmation enabled. Set Site URL to your application origin, and add the exact local and future hosted `/builder` redirect URLs. Registration redirects to `/builder`; use email confirmation on the same browser for PKCE. Configure your own SMTP if required for real users. Provider email delivery and rate limits need verification before launch.
3. From the project's Connect panel copy the **session-pooler** connection string into server-only `DATABASE_URL`. URL-encode the database password. Use a trusted TLS certificate; certificate verification stays on. Prefer a dedicated database role with only the portfolio table privileges when deploying. Privileged database credentials are powerful and must remain server-side.
4. Set `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` on the server. Set the same project URL/public publishable key in `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for the browser. Restart development or rebuild after changing browser variables.
5. Test two real accounts: missing/expired credentials, confirmation and sign-out, save/load/delete, unique slugs, cross-account denial, publish, edit privately, republish and unpublish. Local fixture tests do not substitute for this provider check.

| Variable | Where | Purpose |
| --- | --- | --- |
| `APP_ORIGIN` | Server and client build | Exact canonical public origin and allowed API origin |
| `PORT` | Server | Listener; 3001 locally, hosting-provided value in production |
| `DATABASE_URL` | Server only | Supabase PostgreSQL session-pooler credentials |
| `DATABASE_CA_CERT` | Server only, optional | Trusted project PEM if Node's default CA store cannot verify the connection |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Server | Verify each bearer token with Supabase Auth |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Client build | Optional browser Auth, public credentials only |
| `VITE_GITHUB_AUTH_ENABLED` | Client build | Set `true` only after enabling the GitHub provider in Supabase |
| `VITE_EMAIL_SIGNUP_ENABLED` | Client build | Set `false` without production SMTP; existing confirmed email accounts can still sign in |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | Client build; Express CSP | Optional public analytics project token and US/EU ingestion host |
| `API_ORIGIN` | Cloudflare Pages runtime only | HTTPS Express origin for the optional narrow proxy |

Never put a database password, secret key or service-role key in a `VITE_` variable. No service-role API key is required by this app.

## Verify

```sh
npm run check
npm run test:e2e
npm audit --omit=dev
```

`check` runs ESLint, JavaScript syntax validation, Vitest/Supertest and both production builds. Browser tests use installed Chrome locally; CI installs Chromium. They download and inspect real PDFs/PNG/ZIP, open the extracted website offline, check guest persistence, modes, restore, mobile and keyboard flows. API tests apply the migration to PGlite's PostgreSQL engine and inject test token identities, covering owner predicates and RLS. They do not contact a live Auth provider. GitHub Actions verifies code; it does not deploy.

For intercepted real-SDK analytics verification, start a separate Vite preview on port 5174 with a fake `VITE_POSTHOG_KEY` and run `node scripts/run.js scripts/verify-analytics.js`. Requests are intercepted locally. See `docs/ANALYTICS.md` for event definitions and privacy controls. For exact executed results and limitations see `docs/QA.md`.

## Deployment and SEO

Publication was approved and the app is live on one Render Free Node service, with Supabase Free and consent-based PostHog analytics. Automatic deployments remain off; verified releases are deployed manually. Render can sleep and its idle crawler policy limits reliable SEO. A prepared Cloudflare Pages proxy is an optional future improvement, not part of the current deployment. See [deployment](docs/DEPLOYMENT.md), [usage dashboard](docs/ANALYTICS.md), and [SEO checklist](docs/SEO_CHECKLIST.md). Crawlability does not guarantee indexing or rankings.

## Limits and extension

Backups/documents are limited to 2 MB; stored photos are bounded JPEG, PNG or WebP, up to 1,200 pixels and 96 KB each. Source uploads are limited to 5 MB and 24 megapixels. Twelve items per project/career collection, forty skills and eight known sections keep rendering bounded. Up to fifty cloud portfolios per account; dashboard lists contain summaries only. A single sitemap is capped at 49,998 portfolios plus the landing and gallery pages; larger sites need a paginated sitemap index.

Résumé and portfolio PDFs preserve browser-rendered typography as raster images; their text is not selectable or tagged for assistive technology or automated résumé parsing. The résumé is captured at approximately 288 DPI, retains clickable links and fits one A4 portrait sheet with about 10 mm internal margins. It uses progressively shorter excerpts and fewer leading items in the user's chosen order, without modifying the draft. Extremely long headings or contact details that still cannot fit produce an error recommending shorter wording or the complete Portfolio PDF. Print the résumé on A4 at Actual size. PNG is 960 pixels wide. Captures over 18,000 pixels high and artifacts over 30 MB fail with guidance. Photo crops use a consistent cover layout; advanced cropping and galleries are future additions.

Free hosts have quotas and may sleep or pause. Hosted guest operation, strict database TLS and real analytics ingestion are verified. Public email delivery, successful provider login/cloud management, real-account cross-access, idle cold starts and Search Console remain unverified. Process-local rate limits support a demo; distributed abuse resistance and load testing remain future work. Maintain independent backups.

Add future designs using the shared registry and renderer following `docs/TEMPLATES.md`. See `docs/SECURITY.md` for the trust boundaries. Future UI/layout changes can preserve saved content while evolving template CSS.
