# FolioNest

A portfolio builder with four responsive designs, local drafts and useful exports. Building, editing, saving on your device and downloading require no account. Supabase accounts are optional and required for cloud saves and public links.

## Run locally

Use Node.js 24 LTS (minimum 22.12) and npm. No Docker or hosted service is needed for the guest workflow.

```sh
npm ci
cp .env.example .env
npm run dev
```

On PowerShell use `Copy-Item .env.example .env`. Open `http://127.0.0.1:5173/`; the API runs on port 3001. Blank cloud and analytics values are supported. Do not commit `.env`. To run built software use `npm run build` then `npm start`; visit port 3001. For this local built preview set `APP_ORIGIN=http://127.0.0.1:3001`. Production requires `NODE_ENV=production` and an HTTPS `APP_ORIGIN`.

## Working features

- Editorial, Pinboard/Bento, Motion Story and Quest/Level-Up layouts, with previews generated from the actual shared renderer.
- Guided forms for identity, biography, skills, projects, career, education, achievements and contact links. Reorder projects and sections with keyboard-accessible buttons, hide sections and choose section colors, palette, font and portfolio appearance. Editor appearance is independent.
- Validated local autosave, backup download and confirmed JSON restore. Optional portrait and project photos are resized and stripped of original metadata on your device.
- Selectable-text CV PDF, paginated portfolio PDF, full-page PNG and a standalone website ZIP with required images. The ZIP runs offline without an account or connection to FolioNest.
- Optional Supabase sign-up/sign-in/sign-out, explicit cloud save/load/delete, publishing confirmation, unique slugs and unpublishing. Server queries enforce ownership. Public pages use snapshots, so saving a private edit does not change a live page.
- Public HTML includes portfolio content in its first response, canonical/Open Graph/Person metadata, controlled indexing, sitemap and robots. Private routes are noindex.
- Optional, disabled-by-default usage analytics with explicit consent, Do Not Track and a strict property allowlist. No form contents, images or authentication tokens are sent.

## Cloud setup

Create a project named FolioNest in a **Free** Supabase organization; verify the plan and available project quota before creation. This build has not provisioned or modified an external project. The connected cost lookup was unavailable, so live sign-in and hosted database connectivity are still unverified.

1. Run the committed migration in `supabase/migrations/20261010182706_portfolios.sql` using Supabase's SQL editor or CLI. It creates private drafts and publication snapshots, RLS and indexes; it revokes browser Data API writes. Do not disable those protections.
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
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | Client build; Express CSP | Optional public analytics project token and US/EU ingestion host |
| `API_ORIGIN` | Cloudflare Pages runtime only | HTTPS Express origin for the optional narrow proxy |

Never put a database password, secret key or service-role key in a `VITE_` variable. No service-role API key is required by this app.

## Verify

```sh
npm run check
npm run test:e2e
npm audit --omit=dev
```

`check` runs ESLint, TypeScript, Vitest/Supertest and both production builds. Browser tests use installed Chrome locally; CI installs Chromium. They download and inspect real PDFs/PNG/ZIP, open the extracted website offline, check guest persistence, modes, restore, mobile and keyboard flows. API tests apply the migration to PGlite's PostgreSQL engine and inject test token identities, covering owner predicates and RLS. They do not contact a live Auth provider. GitHub Actions verifies code; it does not deploy.

For intercepted real-SDK analytics verification, start a separate Vite preview on port 5174 with a fake `VITE_POSTHOG_KEY` and run `npm exec tsx -- scripts/verify-analytics.ts`. Requests are intercepted locally. See `docs/ANALYTICS.md` for event definitions and privacy controls. For exact executed results and limitations see `docs/QA.md`.

## Deployment and SEO

Online launch requires final product approval. `render.yaml` is a prepared free-plan Blueprint with automatic deployment off; it has not created services. The recommended split setup uses Cloudflare Pages for assets and static robots, Render Free for Express/public HTML, and Supabase Free for PostgreSQL/Auth. The Pages function proxies only API, public pages and sitemap. See `docs/DEPLOYMENT.md` for commands, configuration and cold-start caveats; see `docs/SEO_CHECKLIST.md` for raw-HTML and Search Console checks. Crawlability does not guarantee Google indexing or rankings.

## Limits and extension

Backups/documents are limited to 2 MB; stored photos are JPEG, up to 1,200 pixels and 96 KB each. Source uploads are limited to 5 MB and 24 megapixels. Twelve items per project/career collection, forty skills and eight known sections keep rendering bounded. Up to fifty cloud portfolios per account; dashboard lists contain summaries only. A single sitemap is capped at 49,999 portfolios plus the landing page; larger sites need a paginated sitemap index.

The CV font supports Latin and many additional characters but not every script/symbol. Unsupported text produces an error recommending Portfolio PDF, which preserves browser-rendered text. Portfolio PDF is rasterized; PNG is 960 pixels wide. Captures over 18,000 pixels high and artifacts over 30 MB fail with guidance. Photo crops use a consistent cover layout; advanced cropping and galleries are future additions.

Free hosts have quotas and may sleep or pause. Hosted operation, live email delivery, real-provider Auth and cloud TLS have not been verified. Process-local rate limits support a demo; distributed abuse resistance and load testing remain launch work. Maintain independent backups.

Add future designs using the shared registry and renderer following `docs/TEMPLATES.md`. See `docs/SECURITY.md` for the trust boundaries. Future UI/layout changes can preserve saved content while evolving template CSS.
