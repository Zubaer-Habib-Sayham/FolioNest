import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";
import { galleryPortfolio } from "../../scripts/gallery-samples.js";

test("featured limits, search and a persistent four-design shortlist lead to independent website exports", async ({
  page,
  browser,
}) => {
  test.setTimeout(90000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/");
  await expect(
    page.locator(".featured-gallery .template-choice:visible"),
  ).toHaveCount(8);
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(
    page.locator(".featured-gallery .template-choice:visible"),
  ).toHaveCount(6);
  await page
    .getByRole("link", { name: "See all templates", exact: true })
    .click();
  await expect(page.locator(".template-card")).toHaveCount(11);
  await page.getByLabel("Find a design", { exact: true }).fill("Golden Hour");
  await expect(page.locator(".template-card")).toHaveCount(1);
  await page
    .getByLabel("Find a design", { exact: true })
    .fill("nothingmatches");
  await expect(
    page.getByText("No designs match. Try another name or style."),
  ).toBeVisible();
  await page.getByLabel("Find a design", { exact: true }).fill("");
  await page.getByLabel("Style", { exact: true }).selectOption("Motion");
  await expect(page.locator(".template-card")).toHaveCount(2);
  await page.getByLabel("Style", { exact: true }).selectOption("All");
  const names = [
    "Creative Studio",
    "Portrait Motion",
    "Cinematic",
    "Golden Hour",
  ];
  for (const name of names) {
    const button = page.getByRole("button", {
      name: `Shortlist ${name}`,
      exact: true,
    });
    await button.focus();
    await page.keyboard.press("Space");
  }
  await page
    .getByRole("button", { name: "Shortlist Ember", exact: true })
    .click();
  await expect(
    page.getByText("You have four designs. Remove one before adding another."),
  ).toBeVisible();
  await page.reload();
  const shortlist = page.getByRole("complementary", {
    name: "Your template shortlist",
  });
  await expect(shortlist.getByRole("listitem")).toHaveCount(4);
  const p = await galleryPortfolio("halo");
  p.sample = false;
  p.identity.name = "My saved story";
  p.about = "My real introduction stays with every selected design.";
  await page.evaluate(
    (data) => localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
    p,
  );
  await page
    .getByRole("link", { name: "Edit selected designs", exact: true })
    .click();
  await expect(page.locator(".portfolio h1")).toHaveText(p.identity.name);
  const choices = page.getByRole("region", { name: "Your selected designs" });
  await expect(choices.getByRole("button")).toHaveCount(4);
  await choices
    .getByRole("button", { name: "Use Golden Hour", exact: true })
    .click();
  await expect(page.locator(".portfolio")).toHaveClass(/template-halo/);
  await expect(page.locator(".portfolio-portrait")).toHaveAttribute(
    "src",
    p.identity.photo,
  );
  await page.getByRole("button", { name: /Review & export$/ }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("folionest-draft-v1")).theme,
      ),
    )
    .toBe("halo");
  const before = await page.evaluate(() =>
    localStorage.getItem("folionest-draft-v1"),
  );
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", {
      name: "Download selected websites (4)",
      exact: true,
    })
    .click();
  const download = await pending;
  const directory = path.resolve("artifacts/selected-websites");
  await mkdir(directory, { recursive: true });
  const filename = path.join(directory, "collection.zip");
  await download.saveAs(filename);
  const zip = await JSZip.loadAsync(await readFile(filename));
  expect(await zip.file("README.txt").async("string")).toContain(
    "publish one design",
  );
  for (const [name, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const target = path.join(directory, name);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, await file.async("nodebuffer"));
  }
  const context = await browser.newContext({
    offline: true,
    reducedMotion: "reduce",
  });
  const standalone = await context.newPage();
  const requests = [];
  standalone.on("request", (request) => {
    if (/^https?:/.test(request.url())) requests.push(request.url());
  });
  for (const id of ["studio", "portrait", "cinema", "halo"]) {
    expect(zip.file(`${id}/styles.css`)).not.toBeNull();
    await standalone.goto(
      pathToFileURL(path.join(directory, id, "index.html")).href,
    );
    await expect(standalone.getByRole("heading", { level: 1 })).toHaveText(
      p.identity.name,
    );
    await expect(standalone.getByText(p.about, { exact: true })).toBeVisible();
    await standalone
      .locator(".portfolio-portrait")
      .evaluate((el) => el.decode());
    expect(
      await standalone
        .locator(".portfolio-portrait")
        .evaluate((el) => el.naturalWidth),
    ).toBe(800);
    await standalone.evaluate(() => document.fonts.ready);
    expect(
      await standalone.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await context.close();
  expect(requests).toEqual([]);
  expect(
    await page.evaluate(() => localStorage.getItem("folionest-draft-v1")),
  ).toBe(before);
  await page.goto("/templates");
  await page
    .getByRole("button", {
      name: "Remove Golden Hour from shortlist",
      exact: true,
    })
    .click();
  await expect(
    page
      .getByRole("complementary", { name: "Your template shortlist" })
      .getByRole("listitem"),
  ).toHaveCount(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const image of await page.locator(".template-card img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((el) => el.decode());
  }
  await page.mouse.move(0, 0);
  await page.screenshot({
    path: "artifacts/gallery-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.screenshot({
    path: "artifacts/gallery-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  expect(errors).toEqual([]);
});
