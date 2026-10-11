import { test, expect } from "@playwright/test";
import { samplePortfolio, templates } from "../../shared/src/schema.js";
import { galleryPortfolio } from "../../scripts/gallery-samples.js";
import { photographicTemplates } from "../../shared/src/templates.js";

test("Studio sample portrait keeps its transparent alignment and gallery selection preserves the draft", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const sample = await galleryPortfolio("studio");
  sample.palette = "terracotta";
  sample.sections.forEach((section) => (section.color = sample.palette));
  await page.goto("/builder");
  await page.evaluate(
    (data) => localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
    sample,
  );
  await page.reload();
  await page.getByRole("button", { name: /Review & export$/ }).click();
  await page.getByRole("button", { name: "Full preview", exact: true }).click();
  for (const width of [375, 600, 799, 923, 960]) {
    await page.setViewportSize({ width, height: 900 });
    await page
      .getByRole("button", {
        name: width <= 600 ? "Mobile" : "Desktop",
        exact: true,
      })
      .click();
    await page
      .locator(".portfolio-portrait")
      .evaluate((image) => image.decode());
    const geometry = await page
      .locator(".studio-photo-area")
      .evaluate((area) => {
        const frame = area.getBoundingClientRect();
        const image = area.querySelector("img");
        const photo = image.getBoundingClientRect();
        const circle = area
          .querySelector(".studio-photo-circle")
          .getBoundingClientRect();
        const display = document
          .querySelector(".studio-display")
          .getBoundingClientRect();
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0);
        return {
          ratio: frame.width / frame.height,
          circleRatio: circle.width / circle.height,
          rightGap: Math.abs(photo.right - circle.right),
          bottomGap: Math.abs(photo.bottom - frame.bottom),
          titleGap: circle.top - display.bottom,
          fit: getComputedStyle(image).objectFit,
          cornerAlpha: context.getImageData(0, 0, 1, 1).data[3],
          imageCount: document.querySelectorAll(".project-photo").length,
        };
      });
    expect(geometry.ratio).toBeCloseTo(1.08, 2);
    expect(geometry.circleRatio).toBeCloseTo(1, 2);
    expect(geometry.rightGap).toBeLessThan(1);
    expect(geometry.bottomGap).toBeLessThan(1);
    expect(geometry.titleGap).toBeGreaterThanOrEqual(0);
    expect(geometry.fit).toBe("contain");
    expect(geometry.cornerAlpha).toBe(0);
    expect(geometry.imageCount).toBe(2);
    if (width === 375 || width === 960)
      await page.screenshot({
        path: `artifacts/studio-gallery-${width}.png`,
        fullPage: true,
      });
  }
  const draft = samplePortfolio();
  draft.identity.name = "My saved portfolio";
  draft.identity.photo = sample.identity.photo;
  await page.evaluate(
    (data) => localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
    draft,
  );
  await page.goto("/");
  const card = page
    .locator(".template-card")
    .filter({ hasText: "Creative Studio" });
  await expect(card).toContainText("AI-generated sample imagery");
  await card.click();
  await expect(page.locator(".portfolio h1")).toHaveText(draft.identity.name);
  await expect(page.locator(".portfolio-portrait")).toHaveAttribute(
    "src",
    draft.identity.photo,
  );
  expect(errors).toEqual([]);
});
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
test("real full-page previews and all registered layouts stay readable on desktop and mobile", async ({
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

test("generated model cutouts fit all photographic frames in both modes and motion remains optional", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const theme of photographicTemplates) {
    const sample = await galleryPortfolio(theme);
    for (const appearance of ["light", "dark"]) {
      sample.appearance = appearance;
      await page.goto("/builder");
      await page.evaluate(
        (data) =>
          localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
        sample,
      );
      await page.reload();
      await page.getByRole("button", { name: /^Preview$/ }).click();
      for (const width of [1366, 390]) {
        await page.setViewportSize({ width, height: 900 });
        await page
          .getByRole("button", {
            name: width === 390 ? "Mobile" : "Desktop",
            exact: true,
          })
          .click();
        const image = page.locator(".photo-frame .portfolio-portrait");
        await image.evaluate((el) => el.decode());
        const geometry = await image.evaluate((el) => {
          const frame = el.parentElement.getBoundingClientRect();
          const photo = el.getBoundingClientRect();
          const canvas = document.createElement("canvas");
          canvas.width = el.naturalWidth;
          canvas.height = el.naturalHeight;
          const context = canvas.getContext("2d");
          context.drawImage(el, 0, 0);
          return {
            gaps: [
              photo.top - frame.top,
              photo.bottom - frame.bottom,
              photo.left - frame.left,
              photo.right - frame.right,
            ],
            fit: getComputedStyle(el).objectFit,
            alpha: context.getImageData(0, 0, 1, 1).data[3],
            animation: getComputedStyle(el.parentElement).animationName,
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        geometry.gaps.forEach((gap) => expect(Math.abs(gap)).toBeLessThan(1));
        expect(geometry.fit).toBe("contain");
        expect(geometry.alpha).toBe(0);
        expect(geometry.animation).toBe("none");
        expect(geometry.overflow).toBe(false);
        await expect(page.locator(".portfolio h1")).toHaveText(
          sample.identity.name,
        );
        if (appearance === "light")
          await page.screenshot({
            path: `artifacts/models-${theme}-${width}.png`,
            fullPage: true,
          });
      }
    }
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".photo-frame")).toHaveCSS(
    "animation-name",
    "portrait-arrive",
  );
  await page.locator(".photo-frame").hover();
  await expect
    .poll(() =>
      page
        .locator(".photo-frame img")
        .evaluate(
          (el) => new DOMMatrixReadOnly(getComputedStyle(el).transform).m11,
        ),
    )
    .toBeCloseTo(1.025, 2);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".photo-frame img")).toHaveCSS("transform", "none");
  expect(errors).toEqual([]);
});
