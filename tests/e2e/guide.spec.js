import { test, expect } from "@playwright/test";
test("illustrated browser-only hosting guide works on home and in the export step", async ({
  page,
}) => {
  await page.goto("/");
  const guide = page.locator("#hosting");
  await guide.scrollIntoViewIfNeeded();
  await expect(guide).toContainText("No extra app or code is needed.");
  for (const image of await guide.locator("img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((el) => el.complete && el.naturalWidth === 720),
      )
      .toBe(true);
  }
  await expect(
    guide.getByRole("link", { name: "Official upload instructions" }),
  ).toHaveAttribute(
    "href",
    "https://docs.netlify.com/start/quickstarts/netlify-drop-quickstart/",
  );
  await expect(
    guide.getByRole("link", { name: "Open Netlify Drop", exact: true }),
  ).toHaveAttribute("href", "https://app.netlify.com/drop");
  await guide
    .getByText("Update your link or fix an upload", { exact: true })
    .click();
  await expect(guide).toContainText("Production deploys");
  await guide
    .getByText("Already using Cloudflare Pages?", { exact: true })
    .click();
  await expect(guide).toContainText("Create a new deployment");
  await expect(
    guide.getByRole("link", { name: "Cloudflare Pages upload instructions" }),
  ).toHaveAttribute(
    "href",
    "https://developers.cloudflare.com/pages/get-started/direct-upload/",
  );
  await page.goto("/builder");
  await page.getByRole("button", { name: /Review & export$/ }).click();
  const details = page.locator(".hosting-details");
  await details.locator(":scope > summary").focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(details).toContainText("your JSON backup");
  const help = details.locator(".hosting-help").first();
  await help.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(help).toHaveAttribute("open", "");
  await expect(
    details.getByRole("link", {
      name: /Open a larger illustration for step 3/,
    }),
  ).toHaveAttribute("href", "/guides/upload.svg");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "artifacts/hosting-guide-mobile.png",
    fullPage: true,
  });
  await details.locator(".hosting-steps li").nth(2).scrollIntoViewIfNeeded();
  await page.screenshot({
    path: "artifacts/hosting-guide-mobile-viewport.png",
  });
});
