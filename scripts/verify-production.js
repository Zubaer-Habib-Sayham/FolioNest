import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
});
try {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const origin = "http://127.0.0.1:3002";
  const raw = await fetch(origin);
  assert.equal(raw.status, 200);
  const html = await raw.text();
  assert.ok(html.includes("Your little corner"));
  assert.ok(html.includes('rel="canonical" href="' + origin + '/"'));
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
  assert.ok(raw.headers.get("Content-Security-Policy"));
  await page.goto(origin);
  await page.getByRole("link", { name: "Create your portfolio" }).click();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page
    .getByLabel("Your name", { exact: true })
    .fill("Production Verification");
  await page
    .getByLabel("Professional headline", { exact: true })
    .fill("A working portfolio, built locally.");
  await page
    .getByLabel("Portrait photo (optional)", { exact: true })
    .setInputFiles("tests/fixtures/astronaut.png");
  await expect(page.locator(".portfolio-portrait")).toBeVisible();
  await page.getByRole("button", { name: /Design$/ }).click();
  await page.getByRole("button", { name: /^Creative Studio/ }).click();
  await page
    .getByLabel("Portfolio appearance", { exact: true })
    .selectOption("dark");
  await page.getByRole("button", { name: "Sage", exact: true }).click();
  await page.getByRole("button", { name: /Introduction$/ }).click();
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
  await expect(page.locator(".portfolio h1")).toHaveText(
    "Production Verification",
  );
  await page.getByRole("button", { name: /Review & export$/ }).click();
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Portfolio PNG/ }).click();
  const download = await pending;
  const png = await readFile(await download.path());
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16), 960);
  const resumePending = page.waitForEvent("download");
  await page.getByRole("button", { name: /^Download résumé/ }).click();
  const resumeDownload = await resumePending;
  const resume = await getDocument({
    data: new Uint8Array(await readFile(await resumeDownload.path())),
  }).promise;
  assert.equal(resume.numPages, 1);
  const sheet = await resume.getPage(1);
  assert.ok(Math.abs(sheet.view[2] - 595.28) < 0.1);
  assert.ok(Math.abs(sheet.view[3] - 841.89) < 0.1);
  await resume.cleanup();
  await page.locator(".hosting-details > summary").click();
  await expect(page.locator(".hosting-details")).toContainText(
    "No extra app or code is needed.",
  );
  await page.locator(".hosting-details img").first().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      page
        .locator(".hosting-details img")
        .first()
        .evaluate((el) => el.complete && el.naturalWidth === 720),
    )
    .toBe(true);
  await page.goto(origin + "/builder?account=1");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goto(origin + "/builder/?code=valid-callback-code");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByText("Cloud services aren’t connected yet.", { exact: true }),
  ).toBeVisible();
  const builder = await fetch(origin + "/builder?code=valid-callback-code");
  assert.equal(builder.status, 200);
  assert.ok(builder.headers.get("X-Robots-Tag")?.includes("noindex"));
  assert.equal((await fetch(origin + "/p/missing-person")).status, 404);
  assert.equal((await fetch(origin + "/missing-page")).status, 404);
  assert.deepEqual(errors, []);
  console.log(
    "Compiled production smoke passed: initial HTML/metadata, guest editing/cutout/signature/PNG/one-page A4 résumé under CSP, callback routing, 404s and no browser-console errors.",
  );
} finally {
  await browser.close();
}
