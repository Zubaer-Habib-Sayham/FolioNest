# Implementation plan

Current expansion: (1) add the developer's supplied social/contact links; (2) inspect six supplied design references and implement six distinct responsive templates with the established generated model, restrained photo motion and real shared-renderer previews; (3) feature eight desktop/six mobile designs, add a searchable all-templates page and a persistent shortlist of up to four designs carried into editing/export; (4) verify all layouts, reduced motion, guest persistence, ownership/schema compatibility, one-page résumés and independently operating website ZIPs. Run relevant checks and push verified milestones. Keep whole-application deployment pending final user approval.

Current gallery revision: add professional fictional portrait/project imagery to Creative Studio, using the actual renderer and proportional photo/circle geometry. Verify transparent photo alignment at mobile and desktop sizes, image loading, keyboard/reduced-motion behavior and draft preservation, then commit and push. Additional templates follow the user's next design requests; whole-application publication still requires final approval.

Gallery revision status: imagery and the optimized shared-renderer preview are implemented. All 34 unit/API tests, 14 browser tests, lint, syntax validation, both builds and the compiled-app smoke check passed. Portrait alignment and draft preservation are verified; screenshots were reviewed on mobile and desktop. Ready for the user's next template designs.

Latest request: first keep the Studio circle/photo geometry proportional across preview and website widths, including screenshot-sized regression checks. Then replace the CV export with a one-page A4 résumé retaining template colors, typography and composition, shortening only an export copy. Verify all templates, long/hidden content, page size/count, rendered readability and the remaining exports before pushing each slice. More templates and public launch follow user review; no publication is authorized yet.

Latest request status: proportional Studio geometry is verified and pushed. Download résumé now creates one template-matched A4 page using readable excerpts without changing the draft; all five templates, actual PDF renders, remaining exports, the full 13-test browser suite and compiled-app checks passed. The user's hosted CSS/version remains uninspected because its URL has not been supplied. Replace the old hosted ZIP with a fresh export. New templates and final launch review are next.

Current revision: convert application, server, proxy, scripts and tests to JavaScript/JSX while retaining React, runtime schemas, behavior and layouts. Verify renderer output and the full suite before committing. Then add optional local portrait background removal with an original-photo fallback, bounded transparent image storage and verified exports. Finally make Netlify Drop the simpler illustrated ZIP-hosting path and clarify Cloudflare troubleshooting. Keep publication approval separate from authorized GitHub pushes.

Revision status: JavaScript migration, local portrait cutouts/original restoration, optional uploaded signatures, shared preview/export layout rules and the clearer hosting guide are implemented and locally verified. External cloud/hosting checks remain outstanding; see QA.md. Replace old uploaded ZIPs to receive these changes.

Build complete, verified slices on main. Preserve the original supplied kit; it is an implementation input, not application source.

1. Workspace tooling, brand assets, accessible landing page and independent editor modes.
2. Strict shared data schema, guided guest editor, local persistence and confirmed JSON restore.
3. Four distinct responsive templates, live preview, curated fonts, palettes and per-section colors.
4. One-page A4 résumé PDF (superseding the originally specified CV), paginated portfolio PDF, PNG and independent website ZIP; inspect actual artifacts.
5. Optional Supabase Auth, PostgreSQL schema and parameterized owner-scoped APIs.
6. Cloud management, explicit publishing, unique slugs and unpublishing.
7. Initial-response public HTML, metadata, sitemap and robots; private-route noindex.
8. Optional privacy-preserving analytics, security tests, responsive and keyboard checks.
9. Setup, deployment, security, SEO and reproducible verification documentation.

For every slice: lint, JavaScript syntax validation, relevant tests, production build, diff review, then a real commit. No deployment without approval. Record actual results and any unverified integrations in QA.md.

Implementation status: local guest editor, templates, photo uploads, verified exports, cloud-management code, SQL migration, public SSR/SEO, opt-in analytics, hosting routing and guides are implemented. Cloud API tests use PostgreSQL fixtures with injected identities. Supabase provisioning/provider verification and actual hosting remain outstanding. The user requires final product/UI review before deployment. Future design additions use a shared registry and renderer; see TEMPLATES.md.

Requested design revision: first improve brand visibility, remove arrow decorations, use names as hero headings, add whole-page background choices, developer contact and visible account access. Then add the supplied photo-led studio design through the template registry, full-page animated gallery previews, illustrated browser-only ZIP hosting guidance, and full-background PDF pages. Verify guest persistence, older backups, all layouts, exports, raw public HTML and existing ownership checks before committing each slice. Keep the site local for the user’s final review.
