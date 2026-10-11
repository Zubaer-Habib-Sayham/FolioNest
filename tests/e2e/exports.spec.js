import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { photographicTemplates } from "../../shared/src/templates.js";
import {
  samplePortfolio,
  portfolioBackground,
} from "../../shared/src/schema.js";
async function verifyPageBackground(page, filename, expected, heroColor) {
  await page.context().route("**/__pdf-render.mjs", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      path: path.resolve("node_modules/pdfjs-dist/build/pdf.mjs"),
    }),
  );
  await page.context().route("**/__pdf-worker.mjs", (route) =>
    route.fulfill({
      contentType: "text/javascript",
      path: path.resolve("node_modules/pdfjs-dist/build/pdf.worker.mjs"),
    }),
  );
  const rendered = await page.evaluate(
    async ({ bytes, modulePath }) => {
      const library = await import(modulePath);
      library.GlobalWorkerOptions.workerSrc = "/__pdf-worker.mjs";
      const loading = library.getDocument({
        data: new Uint8Array(bytes),
      });
      const document = await loading.promise;
      const output = [];
      for (let number = 1; number <= document.numPages; number++) {
        const pdfPage = await document.getPage(number);
        const viewport = pdfPage.getViewport({ scale: 0.75 });
        const canvas = window.document.createElement("canvas");
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const context = canvas.getContext("2d");
        if (!context) throw new Error("PDF render canvas unavailable");
        await pdfPage.render({ canvas, canvasContext: context, viewport })
          .promise;
        output.push({
          number,
          png: canvas.toDataURL("image/png"),
          corners: [
            [1, 1],
            [canvas.width - 2, 1],
            [1, canvas.height - 2],
            [canvas.width - 2, canvas.height - 2],
          ].map(([x, y]) =>
            Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3),
          ),
        });
      }
      await loading.destroy();
      return output;
    },
    {
      bytes: Array.from(await fs.readFile(filename)),
      modulePath: "/__pdf-render.mjs",
    },
  );
  const rgb = expected
    .match(/[a-f0-9]{2}/gi)
    .map((value) => Number.parseInt(value, 16));
  for (const renderedPage of rendered) {
    await fs.writeFile(
      `${filename}-page-${renderedPage.number}.png`,
      Buffer.from(renderedPage.png.split(",")[1], "base64"),
    );
    // PDF color channels are quantized; a two-level tolerance still rejects a white frame.
    for (const [index, corner] of renderedPage.corners.entries()) {
      const expectedColor =
        heroColor && renderedPage.number === 1 && index < 2 ? heroColor : rgb;
      corner.forEach((channel, index) =>
        expect(Math.abs(channel - expectedColor[index])).toBeLessThanOrEqual(2),
      );
    }
  }
}
for (const theme of ["editorial", "studio", ...photographicTemplates]) {
  test(`real ${theme} résumé, portfolio PDF, PNG and independently operating website ZIP`, async ({
    page,
    browser,
  }) => {
    test.setTimeout(90000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/builder");
    const p = samplePortfolio();
    p.sample = false;
    p.identity.name = "Export Verification";
    p.theme = theme;
    if (theme === "studio") {
      p.appearance = "dark";
      p.background = "sage";
      p.palette = "terracotta";
    }
    await page.evaluate((data) => {
      localStorage.setItem("folionest-draft-v1", JSON.stringify(data));
    }, p);
    await page.reload();
    await page.getByRole("button", { name: /Introduction$/ }).click();
    await page
      .getByLabel("Portrait photo (optional)", { exact: true })
      .setInputFiles(
        theme === "studio"
          ? "tests/fixtures/astronaut.png"
          : "client/public/brand/folionest-icon-512.png",
      );
    await expect(page.locator(".portfolio-portrait")).toBeVisible();
    let originalPhoto = "";
    if (theme === "studio") {
      originalPhoto = await page
        .locator(".portfolio-portrait")
        .getAttribute("src");
      await page
        .getByRole("button", { name: "Remove background", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Use original photo" }),
      ).toBeVisible({ timeout: 60000 });
      await page
        .getByLabel("Signature image (optional)", { exact: true })
        .setInputFiles("client/public/brand/folionest-icon-512.png");
      await expect(page.locator(".studio-signature img")).toBeVisible();
    }
    await page.getByRole("button", { name: /Projects$/ }).click();
    await page
      .getByLabel("Project 1 photo (optional)", { exact: true })
      .setInputFiles("client/public/brand/folionest-icon-512.png");
    await page
      .getByLabel("Photo description", { exact: true })
      .fill("A green leaf brand image used for export verification");
    await expect(page.locator(".project-photo")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("folionest-draft-v1")).projects[0]
              .image,
        ),
      )
      .toMatch(/^data:image\/jpeg;base64,/);
    await page.reload();
    await expect(page.locator(".portfolio-portrait")).toBeVisible();
    await page.getByRole("button", { name: /Review & export$/ }).click();
    await fs.mkdir(`artifacts/exports/${theme}`, { recursive: true });
    const saved = {};
    for (const label of [
      "Download résumé",
      "Portfolio PDF",
      "Portfolio PNG",
      "Website ZIP",
    ]) {
      const pending = page.waitForEvent("download");
      await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
      const download = await pending;
      const target = path.resolve(
        "artifacts/exports",
        theme,
        download.suggestedFilename(),
      );
      await download.saveAs(target);
      expect((await fs.stat(target)).size).toBeGreaterThan(500);
      saved[label] = target;
    }
    const resume = await getDocument({
      data: new Uint8Array(await fs.readFile(saved["Download résumé"])),
      useSystemFonts: true,
    }).promise;
    expect(resume.numPages).toBe(1);
    expect((await resume.getMetadata()).info.Title).toContain(
      "Export Verification",
    );
    const resumePage = await resume.getPage(1);
    expect(resumePage.view[2]).toBeCloseTo(595.28, 1);
    expect(resumePage.view[3]).toBeCloseTo(841.89, 1);
    expect((await resumePage.getOperatorList()).fnArray.length).toBeGreaterThan(
      0,
    );
    await resume.cleanup();
    const pdf = await getDocument({
      data: new Uint8Array(await fs.readFile(saved["Portfolio PDF"])),
    }).promise;
    expect(pdf.numPages).toBeGreaterThan(1);
    const first = await pdf.getPage(1);
    expect((await first.getOperatorList()).fnArray.length).toBeGreaterThan(0);
    await pdf.cleanup();
    await verifyPageBackground(
      page,
      saved["Portfolio PDF"],
      portfolioBackground(p),
      theme === "ember"
        ? await page.locator(".photo-hero").evaluate((el) => {
            const canvas = document.createElement("canvas");
            canvas.width = canvas.height = 1;
            const context = canvas.getContext("2d");
            context.fillStyle = getComputedStyle(el).backgroundColor;
            context.fillRect(0, 0, 1, 1);
            return Array.from(context.getImageData(0, 0, 1, 1).data).slice(
              0,
              3,
            );
          })
        : undefined,
    );
    await verifyPageBackground(
      page,
      saved["Download résumé"],
      portfolioBackground(p),
    );
    const png = await fs.readFile(saved["Portfolio PNG"]);
    expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
    expect(png.readUInt32BE(16)).toBe(960);
    expect(png.readUInt32BE(20)).toBeGreaterThan(1000);
    const zip = await JSZip.loadAsync(await fs.readFile(saved["Website ZIP"]));
    expect(Object.keys(zip.files)).toEqual(
      expect.arrayContaining([
        "index.html",
        "styles.css",
        "script.js",
        "README.txt",
      ]),
    );
    const imageAssets = Object.keys(zip.files).filter((name) =>
      name.startsWith("assets/photo-"),
    );
    expect(imageAssets).toHaveLength(theme === "studio" ? 3 : 2);
    const websiteHTML = await zip.file("index.html").async("string");
    const instructions = await zip.file("README.txt").async("string");
    expect(instructions).toContain("https://app.netlify.com/drop");
    expect(instructions).toContain("Make public");
    expect(instructions).toContain("Production deploys");
    expect(instructions).toContain("Create a new deployment");
    if (originalPhoto) {
      expect(websiteHTML).not.toContain(originalPhoto);
      const originalBytes = Buffer.from(originalPhoto.split(",")[1], "base64");
      for (const asset of imageAssets)
        expect(
          (await zip.file(asset).async("nodebuffer")).equals(originalBytes),
        ).toBe(false);
    }
    const dir = path.resolve("artifacts/exports", theme, "standalone");
    await fs.mkdir(dir, { recursive: true });
    for (const [filename, file] of Object.entries(zip.files)) {
      if (file.dir) {
        await fs.mkdir(path.join(dir, filename), { recursive: true });
        continue;
      }
      await fs.mkdir(path.dirname(path.join(dir, filename)), {
        recursive: true,
      });
      await fs.writeFile(
        path.join(dir, filename),
        await file.async("nodebuffer"),
      );
    }
    const context = await browser.newContext({ offline: true });
    const standalone = await context.newPage();
    const independentErrors = [];
    standalone.on("pageerror", (e) => independentErrors.push(e.message));
    await standalone.goto(pathToFileURL(path.join(dir, "index.html")).href);
    await expect(standalone.getByRole("heading", { level: 1 })).toHaveText(
      p.identity.name,
    );
    await expect(
      standalone.getByRole("article", {
        name: "Export Verification portfolio",
      }),
    ).toBeVisible();
    await expect(standalone.locator(".portfolio-portrait")).toBeVisible();
    expect(
      await standalone
        .locator(".portfolio-portrait")
        .evaluate((el) => el.complete && el.naturalWidth > 0),
    ).toBe(true);
    expect(
      await standalone
        .locator(".project-photo")
        .evaluate((el) => el.complete && el.naturalWidth > 0),
    ).toBe(true);
    expect(
      await standalone
        .locator(".portfolio")
        .evaluate((el) => getComputedStyle(el).padding),
    ).toBe(
      { studio: "42px 40px", monograph: "30px", cinema: "0px", ember: "36px" }[
        theme
      ] || "48px",
    );
    if (theme === "studio") {
      await expect(standalone.locator(".studio-signature img")).toBeVisible();
      expect(
        await standalone
          .locator(".studio-signature img")
          .evaluate((el) => el.complete && el.naturalWidth > 0),
      ).toBe(true);
      await expect(standalone.locator(".portfolio")).toHaveClass(
        /portrait-cutout/,
      );
      expect(zip.file("fonts/BarlowCondensed-Black.ttf")).not.toBeNull();
      await standalone.evaluate(() => document.fonts.ready);
      expect(
        await standalone.evaluate(() =>
          document.fonts.check('900 20px "Barlow Condensed"'),
        ),
      ).toBe(true);
      expect(
        await standalone
          .locator(".studio-display")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
    }
    await standalone.screenshot({
      path: `artifacts/exports/${theme}/standalone.png`,
      fullPage: true,
    });
    await context.close();
    expect(independentErrors).toEqual([]);
    expect(errors).toEqual([]);
  });
}
test("long text résumé stays one page and incomplete exports fail without losing the draft", async ({
  page,
}) => {
  await page.goto("/builder");
  const p = samplePortfolio();
  p.about = "Long-form accessible work and thoughtful storytelling. ".repeat(
    70,
  );
  await page.evaluate(
    (data) => localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
    p,
  );
  await page.reload();
  await page.getByRole("button", { name: /Review & export$/ }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Download résumé/ }).click();
  const download = await pending;
  const pdf = await getDocument({
    data: new Uint8Array(await fs.readFile(await download.path())),
  }).promise;
  expect(pdf.numPages).toBe(1);
  await pdf.cleanup();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page.getByLabel("Your name", { exact: true }).fill("");
  await page.getByRole("button", { name: /Review & export$/ }).click();
  await page.getByRole("button", { name: /^Portfolio PNG/ }).click();
  await expect(page.getByRole("status").last()).toContainText("Add your name");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("folionest-draft-v1")).about.length,
    ),
  ).toBeGreaterThan(3000);
});
