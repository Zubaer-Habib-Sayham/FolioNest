# Adding a template

Templates use one validated content model and one renderer across live previews, public HTML and exports. Adding a design does not require rewriting the editor or export pipeline.

1. Add a stable lowercase ID to `templateIds` in `shared/src/templates.js` and its name/description to `templates` in the same file. The schema and UI use that registry. Keep existing IDs stable so backups still open.
2. Add its `.template-your-id` layout rules in `shared/src/portfolio.css`, including narrow screens, both appearance modes, portrait/project photos and reduced motion. Prefer CSS composition over copying content rendering. If a design needs different semantic markup, extend the shared renderer in `shared/src/Portfolio.jsx` using structured fields only.
3. Add a new SQL migration extending the `theme_id` check constraint; apply it before publishing that template. Never rewrite an already applied migration.
4. Run `node scripts/run.js scripts/generate-previews.js` to generate its real landing preview; commit the resulting PNG. Test its raw public HTML, keyboard access, long text, photos, 390-pixel mobile width, all exports and offline ZIP. Existing editor and landing choices come from the shared registry.

New content fields need schema defaults for existing version-one backups, corresponding editor controls and export handling. Larger breaking changes require a versioned backup migration. Never accept user-supplied HTML, CSS or JavaScript to define a template.

All five current templates support a portrait and one image per project, with up to twelve projects. Creative Studio follows the supplied cream-and-terracotta reference: large condensed display type, a serif name, a portrait over a circular accent and ruled sections. Its Barlow Condensed font is served locally, embedded for image/PDF capture and included with its license in studio website ZIPs. Other portfolios require no additional font asset.

Source uploads are limited to 5 MB, 24 megapixels and 12,000 pixels on either axis. Stored uploads are normalized JPEGs; cutouts and signatures use bounded transparent WebP or PNG, at most 1,200 pixels on either axis and 96 KB each. Whole backups and database documents are bounded to 2 MB. The text CV excludes photos; portfolio PDF, PNG and website ZIP include visible photos. Section hiding also hides its photos in public HTML and ZIP exports. Creative Studio offers optional on-device portrait background removal, live cutout preview and original-photo restoration. Original backgrounds stay in private drafts only. Optional uploaded signature images replace the former typed signature; no signature is shown by default.

Preview generation writes full-page PNGs and their real dimensions to `client/src/preview-dimensions.json`. Commit both. Gallery cards scroll through the image on hover or keyboard focus and remain static when reduced motion is requested. Backgrounds use curated light/dark pairs, independent from accent and section colors; old backups use the template’s default.
