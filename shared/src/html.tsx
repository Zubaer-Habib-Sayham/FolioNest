import { renderToStaticMarkup } from "react-dom/server";
import { Portfolio } from "./Portfolio";
import { portfolioSchema, type PortfolioData } from "./schema";
export function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}
export function portfolioMarkup(data: PortfolioData) {
  return renderToStaticMarkup(<Portfolio data={portfolioSchema.parse(data)} />);
}
export function staticWebsite(data: PortfolioData) {
  const p = portfolioSchema.parse(data);
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(p.identity.name)} — ${escapeHtml(p.identity.headline)}</title><meta name="description" content="${escapeHtml(p.about.slice(0, 160) || p.identity.headline)}"><link rel="stylesheet" href="styles.css"><script defer src="script.js"></script></head><body><a class="folio-skip" href="#portfolio-main">Skip to portfolio</a><main id="portfolio-main">${portfolioMarkup(p)}</main></body></html>`;
}
export const websiteBaseCss =
  "html{scroll-behavior:smooth}body{margin:0}main{max-width:1200px;margin:auto}.folio-skip{position:absolute;left:12px;top:-60px;z-index:5;background:#fff;color:#222;padding:12px}.folio-skip:focus{top:12px}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}";
export const websiteScript =
  "document.querySelectorAll('a[href=\"#\"]').forEach(function(link){link.addEventListener('click',function(event){event.preventDefault();window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});});";
