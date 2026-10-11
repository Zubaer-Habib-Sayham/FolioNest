import { test, expect } from "@playwright/test";
import { samplePortfolio, templates } from "../../shared/src/schema.js";
test("gallery previews reveal their full page on hover and keyboard focus, and respect reduced motion", async ({
  page,
}) => {
  await page.goto("/");
  const card = page.locator(".template-card").first();
  const image = card.locator("img");
  await card.scrollIntoViewIfNeeded();
  expect(await image.evaluate((el) => el.naturalHeight)).toBeGreaterThan(1500);
  await card.hover();
  await expect
    .poll(
      () =>
        image.evaluate(
          (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
        ),
      { timeout: 7000 },
    )
    .toBeLessThan(-100);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(image).toHaveCSS("transform", "none");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const last = page.locator(".template-card").last();
  await last.focus();
  await expect
    .poll(
      () =>
        last
          .locator("img")
          .evaluate(
            (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m42,
          ),
      { timeout: 7000 },
    )
    .toBeLessThan(-100);
});
test("real full-page previews and all five layouts stay readable on desktop and mobile", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator("#templates").scrollIntoViewIfNeeded();
  for (const template of templates) {
    const image = page.getByAltText(
      `${template.name} sample portfolio preview`,
    );
    await expect(image).toBeVisible();
    expect(
      await image.evaluate((el) => el.complete && el.naturalWidth === 960),
    ).toBe(true);
  }
  await page.goto("/builder");
  const p = samplePortfolio();
  await page.evaluate(
    (data) => localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
    p,
  );
  await page.reload();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page
    .getByLabel("Portrait photo (optional)", { exact: true })
    .setInputFiles("client/public/brand/folionest-icon-512.png");
  await expect(page.locator(".portfolio-portrait")).toBeVisible();
  await page.getByRole("button", { name: /Design$/ }).click();
  for (const width of [1366, 390]) {
    await page.setViewportSize({ width, height: 900 });
    if (width === 390)
      await page.getByRole("button", { name: /^Preview$/ }).click();
    for (const template of templates) {
      if (width === 390)
        await page.getByRole("button", { name: /Back to editing/ }).click();
      await page
        .getByRole("button", { name: new RegExp(`^${template.name}`) })
        .click();
      if (width === 390)
        await page.getByRole("button", { name: /^Preview$/ }).click();
      await expect(page.locator(".portfolio")).toHaveClass(
        new RegExp(`template-${template.id}`),
      );
      await expect(page.locator(".portfolio-portrait")).toBeVisible();
      await expect(page.locator(".portfolio h1")).toHaveText(p.identity.name);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `artifacts/${template.id}-${width}.png`,
        fullPage: true,
      });
    }
  }
  expect(errors).toEqual([]);
});
