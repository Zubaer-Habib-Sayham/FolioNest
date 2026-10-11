import { test, expect } from "@playwright/test";
import { samplePortfolio } from "../../shared/src/schema.js";

test("real local portrait cutout, original fallback, signature and persistence", async ({
  page,
}) => {
  test.setTimeout(90000);
  const requests = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("data:"))
      requests.push({ url: request.url(), method: request.method() });
  });
  await page.goto("/builder?template=studio");
  const p = samplePortfolio();
  p.theme = "studio";
  await page.evaluate(
    (data) => localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
    p,
  );
  await page.reload();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page
    .getByLabel("Portrait photo (optional)", { exact: true })
    .setInputFiles("tests/fixtures/astronaut.png");
  const original = await page
    .locator(".portfolio-portrait")
    .getAttribute("src");
  expect(original).toMatch(/^data:image\/jpeg/);
  expect(await page.locator(".studio-signature").innerText()).toBe("");
  await page
    .getByRole("button", { name: "Remove background", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Use original photo" }),
  ).toBeVisible({ timeout: 60000 });
  await expect(page.locator(".portfolio-portrait")).toHaveAttribute(
    "src",
    /^data:image\/(png|webp)/,
  );
  const cutout = await page.locator(".portfolio-portrait").getAttribute("src");
  const pixels = await page
    .locator(".portfolio-portrait")
    .evaluate(async (img) => {
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let clear = 0,
        opaque = 0;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 10) clear++;
        if (data[i] > 240) opaque++;
      }
      return { clear, opaque };
    });
  expect(pixels.clear).toBeGreaterThan(500);
  expect(pixels.opaque).toBeGreaterThan(500);
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("folionest-draft-v1")).identity.photo,
      ),
    )
    .toBe(cutout);
  await page.reload();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page.getByRole("button", { name: "Use original photo" }).click();
  await expect(page.locator(".portfolio-portrait")).toHaveAttribute(
    "src",
    original,
  );
  await page
    .getByLabel("Signature image (optional)", { exact: true })
    .setInputFiles("client/public/brand/folionest-icon-512.png");
  await expect(page.locator(".studio-signature img")).toBeVisible();
  await page
    .getByRole("button", { name: "Remove signature image (optional)" })
    .click();
  await expect(page.locator(".studio-signature img")).toHaveCount(0);
  expect(requests.filter((r) => r.method !== "GET")).toEqual([]);
  expect(
    requests.every((r) => r.url.startsWith("http://127.0.0.1:5173/")),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/studio-original-restored.png",
    fullPage: true,
  });
});

test("failed and cancelled portrait processing keep the original draft", async ({
  page,
}) => {
  await page.goto("/builder?template=studio");
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page
    .getByLabel("Portrait photo (optional)", { exact: true })
    .setInputFiles("tests/fixtures/astronaut.png");
  await expect(page.locator(".portfolio-portrait")).toBeVisible();
  const original = await page
    .locator(".portfolio-portrait")
    .getAttribute("src");
  await page
    .getByRole("button", { name: "Remove background", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancel background removal" }).click();
  await expect(page.locator(".photo-upload").first()).toContainText(
    "Cancelled. Original photo kept.",
  );
  await expect(page.locator(".portfolio-portrait")).toHaveAttribute(
    "src",
    original,
  );
  await page.route("**/models/selfie-segmenter.tflite", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page
    .getByRole("button", { name: "Remove background", exact: true })
    .click();
  await expect(page.locator(".photo-upload").first()).toContainText(
    "Your original is safe.",
    { timeout: 15000 },
  );
  await expect(page.locator(".portfolio-portrait")).toHaveAttribute(
    "src",
    original,
  );
  await expect(
    page.getByRole("button", { name: "Remove background", exact: true }),
  ).toBeEnabled();
});
