import { test, expect } from "@playwright/test";
import { samplePortfolio, templates } from "../../shared/src/schema.js";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";

async function layout(locator) {
  return locator.evaluate((root) => {
    const origin = root.getBoundingClientRect();
    return [
      ...root.querySelectorAll(
        ".portfolio-masthead,.studio-display,.studio-introduction,.studio-photo-area,h1,h2,h3,.portfolio-prose,.project-grid,.portfolio-section,.portfolio-portrait",
      ),
    ].map((node) => {
      const box = node.getBoundingClientRect();
      const css = getComputedStyle(node);
      return {
        tag: node.tagName,
        class: node.className,
        x: Math.round(box.x - origin.x),
        y: Math.round(box.y - origin.y),
        width: Math.round(box.width),
        height: Math.round(box.height),
        font: css.fontFamily,
        size: css.fontSize,
        display: css.display,
        columns: css.gridTemplateColumns,
      };
    });
  });
}
test("all website ZIP layouts match the live preview at the same canvas width", async ({
  page,
  browser,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1366, height: 900 });
  for (const template of templates) {
    await page.goto("/builder");
    const data = samplePortfolio();
    data.theme = template.id;
    await page.evaluate(
      (data) =>
        localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
      data,
    );
    await page.reload();
    await page.getByRole("button", { name: /Introduction$/ }).click();
    await page
      .getByLabel("Portrait photo (optional)", { exact: true })
      .setInputFiles("tests/fixtures/astronaut.png");
    await expect(page.locator(".portfolio-portrait")).toBeVisible();
    await page.getByRole("button", { name: /Review & export$/ }).click();
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: /^Website ZIP/ }).click();
    const download = await pending;
    const directory = path.resolve("artifacts/layout-parity", template.id);
    await fs.mkdir(directory, { recursive: true });
    const filename = path.join(directory, "website.zip");
    await download.saveAs(filename);
    const zip = await JSZip.loadAsync(await fs.readFile(filename));
    for (const [name, file] of Object.entries(zip.files)) {
      if (file.dir) continue;
      const target = path.join(directory, name);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, await file.async("nodebuffer"));
    }
    await page
      .getByRole("button", { name: "Full preview", exact: true })
      .click();
    const context = await browser.newContext({
      viewport: { width: 1366, height: 900 },
      offline: true,
      reducedMotion: "reduce",
    });
    const standalone = await context.newPage();
    await standalone.goto(
      pathToFileURL(path.join(directory, "index.html")).href,
    );
    for (const size of ["Desktop", "Mobile"]) {
      await page.getByRole("button", { name: size, exact: true }).click();
      const width = await page
        .locator(".portfolio-stage")
        .evaluate((el) => el.getBoundingClientRect().width);
      await standalone.setViewportSize({
        width: Math.round(width),
        height: 900,
      });
      await page.evaluate(() => document.fonts.ready);
      await standalone.evaluate(() => document.fonts.ready);
      expect(await layout(standalone.locator(".portfolio"))).toEqual(
        await layout(page.locator(".portfolio")),
      );
      if (template.id === "studio") {
        const title = await standalone.locator(".studio-display").boundingBox();
        const photo = await standalone
          .locator(".studio-photo-area")
          .boundingBox();
        expect(photo.y).toBeGreaterThanOrEqual(title.y + title.height);
      }
    }
    if (template.id === "studio")
      await standalone.screenshot({
        path: "artifacts/studio-zip-corrected-mobile.png",
        fullPage: true,
      });
    await context.close();
    await page
      .getByRole("button", { name: "Back to editing", exact: true })
      .click();
  }
});
