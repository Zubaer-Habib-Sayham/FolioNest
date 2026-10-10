# Adding a template

Templates use one validated content model and one renderer across live previews, public HTML and exports. Adding a design does not require rewriting the editor or export pipeline.

1. Add a stable lowercase ID to `templateIds` in `shared/src/templates.ts` and its name/description to `templates` in the same file. The schema and UI use that registry. Keep existing IDs stable so backups still open.
2. Add its `.template-your-id` layout rules in `shared/src/portfolio.css`, including narrow screens, both appearance modes, portrait/project photos and reduced motion. Prefer CSS composition over copying content rendering. If a design needs different semantic markup, extend the shared renderer in `shared/src/Portfolio.tsx` using structured fields only.
3. Add a new SQL migration extending the `theme_id` check constraint; apply it before publishing that template. Never rewrite an already applied migration.
4. Run `npm exec tsx -- scripts/generate-previews.ts` to generate its real landing preview; commit the resulting PNG. Test its raw public HTML, keyboard access, long text, photos, 390-pixel mobile width, all exports and offline ZIP. Existing editor and landing choices come from the shared registry.

New content fields need schema defaults for existing version-one backups, corresponding editor controls and export handling. Larger breaking changes require a versioned backup migration. Never accept user-supplied HTML, CSS or JavaScript to define a template.

All four current templates support a portrait and one image per project, with up to twelve projects. Source uploads are limited to 5 MB, 24 megapixels and 12,000 pixels on either axis. Stored images are metadata-free JPEGs, at most 1,200 pixels on either axis and 96 KB each. Whole backups and database documents are bounded to 2 MB. The text CV excludes photos; portfolio PDF, PNG and website ZIP include visible photos. Section hiding also hides its photos in public HTML and ZIP exports.
