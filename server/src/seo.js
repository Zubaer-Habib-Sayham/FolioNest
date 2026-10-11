import { z } from "zod";
import {
  escapeHtml,
  portfolioMarkup,
  websiteBaseCss,
} from "../../shared/src/html.jsx";
import {
  slugSchema,
  visiblePortfolio,
  portfolioBackground,
} from "../../shared/src/schema.js";
export function landingDocument(index, origin) {
  const title = "FolioNest — Your story, beautifully online.";
  const description =
    "Build a portfolio that feels like you. Distinct thoughtful designs, local drafts and free exports. No account needed to start.";
  return index
    .replace(
      /<link[^>]*rel="canonical"[^>]*>|<meta[^>]*property="og:[^"]*"[^>]*>/g,
      "",
    )
    .replace(
      "</head>",
      `<link rel="canonical" href="${escapeHtml(origin)}/"><meta property="og:type" content="website"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(origin)}/"><meta property="og:image" content="${escapeHtml(origin)}/brand/folionest-icon-512.png"></head>`,
    );
}
export function publicDocument(record, origin) {
  const p = visiblePortfolio(record.data);
  const canonical = `${origin}/p/${record.slug}`;
  const title = `${p.identity.name} — ${p.identity.headline}`;
  const description = (p.about || p.identity.headline).slice(0, 160);
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: p.identity.name,
    jobTitle: p.identity.headline,
    url: canonical,
    ...(p.identity.location
      ? { homeLocation: { "@type": "Place", name: p.identity.location } }
      : {}),
    sameAs: p.links.map((link) => link.url).filter(Boolean),
  };
  const json = JSON.stringify(person)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${record.indexable ? "index, follow" : "noindex, follow"}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:type" content="profile"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${escapeHtml(origin)}/brand/folionest-icon-512.png"><link rel="icon" href="/brand/mark.svg"><link rel="stylesheet" href="/portfolio.css"><script type="application/ld+json">${json}</script></head><body style="background:${portfolioBackground(p)}"><a class="folio-skip" href="#portfolio-main">Skip to portfolio</a><main id="portfolio-main">${portfolioMarkup(p)}</main></body></html>`;
}
function missingDocument() {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Portfolio unavailable — FolioNest</title></head><body><main><h1>This portfolio isn’t available.</h1><p>The owner may have unpublished it, or the address may have changed.</p><a href="/">Visit FolioNest</a></main></body></html>';
}
export function installPublicRoutes(app, { repository, origin, css }) {
  const empty = z.object({}).strict();
  app.get("/portfolio.css", (req, res) => {
    empty.parse(req.query);
    res
      .type("css")
      .set("Cache-Control", "public, max-age=3600")
      .send(websiteBaseCss + "\n" + css);
  });
  app.get("/p/:slug", async (req, res) => {
    empty.parse(req.query);
    res.set("Cache-Control", "no-store");
    const slug = slugSchema.safeParse(req.params.slug);
    const record =
      slug.success && repository
        ? await repository.publicPortfolio(slug.data)
        : null;
    if (!record) {
      res
        .set("X-Robots-Tag", "noindex")
        .status(404)
        .type("html")
        .send(missingDocument());
      return;
    }
    if (!record.indexable) res.set("X-Robots-Tag", "noindex, follow");
    res.type("html").send(publicDocument(record, origin));
  });
  app.get("/sitemap.xml", async (req, res) => {
    empty.parse(req.query);
    const rows = repository ? await repository.sitemap() : [];
    const entries = [
      `<url><loc>${escapeHtml(origin)}/</loc></url>`,
      ...rows
        .filter((row) => slugSchema.safeParse(row.slug).success)
        .map(
          (row) =>
            `<url><loc>${escapeHtml(origin)}/p/${escapeHtml(String(row.slug))}</loc>${row.published_at ? `<lastmod>${new Date(row.published_at).toISOString()}</lastmod>` : ""}</url>`,
        ),
    ];
    res
      .type("application/xml")
      .set("Cache-Control", "no-cache, must-revalidate")
      .send(
        `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`,
      );
  });
  app.get("/robots.txt", (req, res) => {
    empty.parse(req.query);
    res
      .type("text")
      .set("Cache-Control", "public, max-age=300")
      .send(
        `User-agent: *\nAllow: /\nDisallow: /builder\nDisallow: /auth\nDisallow: /account\nDisallow: /dashboard\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`,
      );
  });
}
