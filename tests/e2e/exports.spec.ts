import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { samplePortfolio } from "../../shared/src/schema";

test("real CV, portfolio PDF, PNG and independently operating website ZIP", async ({
  page,
  browser,
}) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/builder");
  const p = samplePortfolio();
  p.sample = false;
  p.identity.name = "Export Verification";
  await page.evaluate((data) => {
    localStorage.setItem("folionest-draft-v1", JSON.stringify(data));
  }, p);
  await page.reload();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page
    .getByLabel("Portrait photo (optional)", { exact: true })
    .setInputFiles("client/public/brand/folionest-icon-512.png");
  await expect(page.locator(".portfolio-portrait")).toBeVisible();
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
          JSON.parse(localStorage.getItem("folionest-draft-v1")!).projects[0]
            .image,
      ),
    )
    .toMatch(/^data:image\/jpeg;base64,/);
  await page.reload();
  await expect(page.locator(".portfolio-portrait")).toBeVisible();
  await page.getByRole("button", { name: /Review & export$/ }).click();
  await fs.mkdir("artifacts/exports", { recursive: true });
  const saved: Record<string, string> = {};
  for (const label of [
    "CV PDF",
    "Portfolio PDF",
    "Portfolio PNG",
    "Website ZIP",
  ]) {
    const pending = page.waitForEvent("download");
    await page.getByRole("button", { name: new RegExp(`^${label}`) }).click();
    const download = await pending;
    const target = path.resolve(
      "artifacts/exports",
      download.suggestedFilename(),
    );
    await download.saveAs(target);
    expect((await fs.stat(target)).size).toBeGreaterThan(500);
    saved[label] = target;
  }
  const cv = await getDocument({
    data: new Uint8Array(await fs.readFile(saved["CV PDF"])),
    useSystemFonts: true,
  }).promise;
  let cvText = "";
  for (let n = 1; n <= cv.numPages; n++) {
    const content = await (await cv.getPage(n)).getTextContent();
    cvText += content.items
      .filter((item): item is typeof item & { str: string } => "str" in item)
      .map((item) => item.str)
      .join(" ");
  }
  expect(cvText).toContain("Export Verification");
  expect(cvText).toContain("A softer kind of digital");
  expect(cv.numPages).toBeGreaterThan(0);
  await cv.cleanup();
  const pdf = await getDocument({
    data: new Uint8Array(await fs.readFile(saved["Portfolio PDF"])),
  }).promise;
  expect(pdf.numPages).toBeGreaterThan(1);
  const first = await pdf.getPage(1);
  expect((await first.getOperatorList()).fnArray.length).toBeGreaterThan(0);
  await pdf.cleanup();
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
      "assets/photo-1.jpg",
      "assets/photo-2.jpg",
    ]),
  );
  expect(
    (await zip.file("assets/photo-1.jpg")!.async("nodebuffer"))
      .subarray(0, 2)
      .toString("hex"),
  ).toBe("ffd8");
  const dir = path.resolve("artifacts/exports/standalone");
  await fs.mkdir(dir, { recursive: true });
  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir) {
      await fs.mkdir(path.join(dir, filename), { recursive: true });
      continue;
    }
    await fs.mkdir(path.dirname(path.join(dir, filename)), { recursive: true });
    await fs.writeFile(
      path.join(dir, filename),
      await file.async("nodebuffer"),
    );
  }
  const context = await browser.newContext({ offline: true });
  const standalone = await context.newPage();
  const independentErrors: string[] = [];
  standalone.on("pageerror", (e) => independentErrors.push(e.message));
  await standalone.goto(pathToFileURL(path.join(dir, "index.html")).href);
  await expect(standalone.getByRole("heading", { level: 1 })).toHaveText(
    p.identity.headline,
  );
  await expect(
    standalone.getByRole("article", { name: "Export Verification portfolio" }),
  ).toBeVisible();
  await expect(standalone.locator(".portfolio-portrait")).toBeVisible();
  expect(
    await standalone
      .locator(".portfolio-portrait")
      .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
  ).toBe(true);
  expect(
    await standalone
      .locator(".project-photo")
      .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
  ).toBe(true);
  expect(
    await standalone
      .locator(".portfolio")
      .evaluate((el) => getComputedStyle(el).padding),
  ).toBe("48px");
  await standalone.screenshot({
    path: "artifacts/exports/standalone.png",
    fullPage: true,
  });
  await context.close();
  expect(independentErrors).toEqual([]);
  expect(errors).toEqual([]);
});
test("long text CV paginates and incomplete exports fail without losing the draft", async ({
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
  await page.getByRole("button", { name: /^CV PDF/ }).click();
  const download = await pending;
  const pdf = await getDocument({
    data: new Uint8Array(await fs.readFile((await download.path())!)),
  }).promise;
  expect(pdf.numPages).toBeGreaterThan(1);
  await pdf.cleanup();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page.getByLabel("Your name", { exact: true }).fill("");
  await page.getByRole("button", { name: /Review & export$/ }).click();
  await page.getByRole("button", { name: /^Portfolio PNG/ }).click();
  await expect(page.getByRole("status").last()).toContainText("Add your name");
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("folionest-draft-v1")!).about.length,
    ),
  ).toBeGreaterThan(3000);
});
