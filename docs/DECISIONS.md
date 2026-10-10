# Decisions

The requested developer credit uses Zubaer Habib Sayham and the email supplied by the user. Gallery examples use that name, but work, qualifications and dates remain explicitly illustrative; they do not establish personal credentials. Names are the primary heading in every portfolio. Background choices are fixed, contrast-compatible light/dark pairs rather than user-supplied CSS. Existing version-one backups default to their previous background. The brand asset is displayed inside a tighter SVG viewport with a light badge, preserving the supplied artwork.

Choosing a gallery design applies that template to the existing local draft and saves the design choice, preserving the person’s text, photos and order. It never loads sample content implicitly. The hosting guide is for an exported static portfolio; FolioNest itself still requires the approved Express/Supabase deployment. PDF pages keep A4 dimensions and fill the complete page with the selected background; content keeps its internal layout padding, with no extra white export frame. Analytics adds only a fixed landing/builder visit enum, without URLs or private values; per-load IDs remain intentionally ephemeral.

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
