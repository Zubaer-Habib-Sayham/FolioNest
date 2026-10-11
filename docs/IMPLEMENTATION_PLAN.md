# Implementation plan

Current revision: convert application, server, proxy, scripts and tests to JavaScript/JSX while retaining React, runtime schemas, behavior and layouts. Verify renderer output and the full suite before committing. Then add optional local portrait background removal with an original-photo fallback, bounded transparent image storage and verified exports. Finally make Netlify Drop the simpler illustrated ZIP-hosting path and clarify Cloudflare troubleshooting. Keep publication approval separate from authorized GitHub pushes.

Build complete, verified slices on main. Preserve the original supplied kit; it is an implementation input, not application source.

1. Workspace tooling, brand assets, accessible landing page and independent editor modes.
2. Strict shared data schema, guided guest editor, local persistence and confirmed JSON restore.
3. Four distinct responsive templates, live preview, curated fonts, palettes and per-section colors.
4. Selectable CV PDF, paginated portfolio PDF, PNG and independent website ZIP; inspect actual artifacts.
5. Optional Supabase Auth, PostgreSQL schema and parameterized owner-scoped APIs.
6. Cloud management, explicit publishing, unique slugs and unpublishing.
7. Initial-response public HTML, metadata, sitemap and robots; private-route noindex.
8. Optional privacy-preserving analytics, security tests, responsive and keyboard checks.
9. Setup, deployment, security, SEO and reproducible verification documentation.

For every slice: lint, typecheck, relevant tests, production build, diff review, then a real commit. No deployment without approval. Record actual results and any unverified integrations in QA.md.

Implementation status: local guest editor, templates, photo uploads, verified exports, cloud-management code, SQL migration, public SSR/SEO, opt-in analytics, hosting routing and guides are implemented. Cloud API tests use PostgreSQL fixtures with injected identities. Supabase provisioning/provider verification and actual hosting remain outstanding. The user requires final product/UI review before deployment. Future design additions use a shared registry and renderer; see TEMPLATES.md.

Requested design revision: first improve brand visibility, remove arrow decorations, use names as hero headings, add whole-page background choices, developer contact and visible account access. Then add the supplied photo-led studio design through the template registry, full-page animated gallery previews, illustrated browser-only ZIP hosting guidance, and full-background PDF pages. Verify guest persistence, older backups, all layouts, exports, raw public HTML and existing ownership checks before committing each slice. Keep the site local for the user’s final review.
