import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { portfolioMarkup, websiteBaseCss } from "../shared/src/html.jsx";
import { samplePortfolio, templates } from "../shared/src/schema.js";
const css =
  websiteBaseCss +
  (await readFile("shared/src/portfolio.css", "utf8")).replaceAll(
    "/fonts/BarlowCondensed-Black.ttf",
    `data:font/ttf;base64,${(await readFile("client/public/fonts/BarlowCondensed-Black.ttf")).toString("base64")}`,
  );
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
});
try {
  await mkdir("client/public/templates", { recursive: true });
  const page = await browser.newPage({
    viewport: { width: 960, height: 1100 },
    reducedMotion: "reduce",
  });
  const dimensions = {};
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
            : template.id === "studio"
              ? "terracotta"
              : "forest";
    p.sections.forEach((section) => (section.color = p.palette));
    await page.setContent(
      `<!doctype html><html><head><style>${css}</style></head><body>${portfolioMarkup(p)}</body></html>`,
    );
    await page.evaluate(() => document.fonts.ready);
    if (template.id === "studio")
      assert.ok(
        await page
          .locator(".studio-display")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
        "Studio display type must fit on one line",
      );
    await page.screenshot({
      path: `client/public/templates/${template.id}.png`,
      fullPage: true,
    });
    dimensions[template.id] = Math.ceil(
      await page
        .locator(".portfolio")
        .evaluate((el) => el.getBoundingClientRect().height),
    );
  }
  await writeFile(
    "client/src/preview-dimensions.json",
    JSON.stringify(dimensions, null, 2) + "\n",
  );
  console.log(
    `Generated ${templates.length} full-page previews from the actual portfolio renderer.`,
  );
} finally {
  await browser.close();
}
