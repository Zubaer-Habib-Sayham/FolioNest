# Decisions

- React/Vite and Express in npm workspaces with shared TypeScript schemas and portfolio rendering. CSS variables provide a small consistent design system.
- One canonical schema bounds all text, lists, URLs, sections, fonts and palettes. Drafts may be incomplete; export/publish adds identity validation.
- Templates share structured content but differ in composition: editorial columns, bento grid, narrative bands and a career timeline.
- System fonts work offline. Optional portrait and project uploads accept bounded JPEG/PNG/WebP inputs, decode and recompress locally into JPEG without original metadata, and validate the resulting raster headers and dimensions on every save/import. No SVG, remote image URLs or arbitrary files are accepted. ZIP exports include local assets. Photos are part of the database JSON; a complete portfolio is limited to 2 MB.
- Drafts stay in browser storage until an explicit authenticated cloud action. Import requires validation and confirmation.
- Direct PostgreSQL uses owner predicates in every private query. RLS protects the Supabase Data API separately; privileged pg calls do not gain protection from those policies.
- Published content is a snapshot separate from drafts, so saving changes never silently publishes them.
- The server serves the built client and public HTML locally and may be deployed as one service. A small optional Pages proxy supports the specification's split-host arrangement.
- Analytics uses an explicit event/property allowlist, no automatic capture, page URL capture, identity, replay or personal data. It respects DNT and opt-out.
- Supplied build documents remain intact outside the application commits. Commits use the user's configured identity and verified slices are pushed to the existing FolioNest repository with authorization. Online deployment requires the user's final product review.
