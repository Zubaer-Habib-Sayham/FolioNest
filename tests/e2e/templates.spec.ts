import { test, expect } from "@playwright/test";
import { samplePortfolio, templates } from "../../shared/src/schema";
test("real template previews and all four layouts stay readable on desktop and mobile", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.locator("#templates").scrollIntoViewIfNeeded();
  for (const template of templates) {
    const image = page.getByAltText(
      `${template.name} sample portfolio preview`,
    );
    await expect(image).toBeVisible();
    expect(
      await image.evaluate(
        (el: HTMLImageElement) => el.complete && el.naturalWidth === 960,
      ),
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
