import { test, expect } from "@playwright/test";

test("configured authentication rejects invalid credentials without losing the guest draft", async ({
  page,
}) => {
  const config = await (await page.request.get("/api/config")).json();
  test.skip(
    !config.cloud,
    "Live Auth credentials are optional in the guest-only test environment.",
  );
  await page.goto("/builder");
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page
    .getByLabel("Your name", { exact: true })
    .fill("Guest remains local");
  await page.getByRole("link", { name: "Account", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByLabel("Email", { exact: true })
    .fill("invalid-login@example.com");
  await dialog
    .getByLabel("Password", { exact: true })
    .fill("invalid-verification-password");
  await dialog.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(dialog.getByRole("status")).toContainText(
    "Invalid login credentials",
  );
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
    "Guest remains local",
  );
  const unauthenticated = await page.request.get("/api/portfolios/me");
  expect(unauthenticated.status()).toBe(401);
  const invalidToken = await page.request.get("/api/portfolios/me", {
    headers: { Authorization: "Bearer invalid-token" },
  });
  expect(invalidToken.status()).toBe(401);
});
