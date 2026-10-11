# SEO launch checklist

- Set `APP_ORIGIN` consistently on build and server. The current public/canonical hostname is `https://folionest.onrender.com`. If migrating to a static frontend, update it consistently and redirect aliases.
- Confirm the landing and `/templates` gallery HTML contain meaningful copy without JavaScript, unique title/description, one canonical link per page, Open Graph fields and local favicon/brand assets.
- Create a real portfolio and explicitly allow indexing. Inspect the raw `/p/:slug` response: HTTP 200, name/headline/content, escaped title and description, canonical public URL, OG fields and valid Person JSON-LD. Confirm `/portfolio.css` and brand image load from the public hostname.
- Verify private editor/API responses are noindex. A published portfolio with indexing disabled must return noindex and stay out of sitemap while remaining accessible to people with the link.
- Verify absent, invalid and unpublished slugs return 404. Unpublish a test portfolio and confirm its raw HTML and public JSON disappear immediately, and the sitemap excludes it.
- Inspect `/sitemap.xml`: landing and template-gallery pages plus published, indexable, non-sample portfolios only, public origin and actual publication dates. It must exclude drafts, dashboard/editor/auth paths and unindexed profiles. Above 49,998 profiles, implement a sitemap index rather than silently treating one bounded sitemap as exhaustive.
- Inspect `/robots.txt`, including after the API sleeps. It must permit public portfolios, exclude private paths and point to the public sitemap. Current Render Free can substitute an idle crawler block; static robots would require the optional, undeployed Pages arrangement.
- Validate JSON-LD and sharing previews using relevant search/social inspection tools. Add the approved public hostname to Google Search Console, verify ownership and submit its sitemap. Ask Google to inspect a real public URL, then monitor coverage and server errors.
- Test an API cold start through the Pages hostname. A free-host 503 or timeout can delay crawling; do not mistake a client-side landing preview for verified public-page availability.

Locally tested: raw portfolio HTML, title/description/canonical/OG/JSON-LD escaping, 200/404 responses, publication snapshots, private/noindex responses, sitemap exclusions and unpublishing. Not executed: hosted crawling, Search Console verification/submission, social-network fetches or indexing. Google controls indexing and ranking; neither is guaranteed by the app.
