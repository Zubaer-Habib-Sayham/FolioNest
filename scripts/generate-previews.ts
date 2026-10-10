import { chromium } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { portfolioMarkup, websiteBaseCss } from "../shared/src/html";
import { samplePortfolio, templates } from "../shared/src/schema";
const css =
  websiteBaseCss + (await readFile("shared/src/portfolio.css", "utf8"));
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
});
try {
  await mkdir("client/public/templates", { recursive: true });
  const page = await browser.newPage({
    viewport: { width: 960, height: 1100 },
    reducedMotion: "reduce",
  });
  for (const template of templates) {
    const p = samplePortfolio();
    p.theme = template.id;
    p.palette =
      template.id === "bento"
        ? "violet"
        : template.id === "motion"
          ? "ocean"
          : template.id === "quest"
            ? "ink"
            : "forest";
    p.sections.forEach((section) => (section.color = p.palette));
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${portfolioMarkup(p)}</body></html>`,
    );
    await page.screenshot({
      path: `client/public/templates/${template.id}.png`,
    });
  }
  console.log("Generated four previews from the actual portfolio renderer.");
} finally {
  await browser.close();
}
