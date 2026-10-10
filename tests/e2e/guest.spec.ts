import { test, expect } from "@playwright/test";
import fs from "node:fs/promises";
test("guest editing, ordering, themes, reload and confirmed JSON restore", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.getByRole("link", { name: "Create your portfolio" }).click();
  await page.getByRole("button", { name: "Continue →", exact: true }).click();
  await page.getByLabel("Your name", { exact: true }).fill("Taylor Guest");
  await page
    .getByLabel("Professional headline", { exact: true })
    .fill("Designing useful things.");
  await expect(page.getByRole("status").first()).toHaveText(
    "Saved on this device",
  );
  await page.reload();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await expect(page.getByLabel("Your name", { exact: true })).toHaveValue(
    "Taylor Guest",
  );
  await page.getByRole("button", { name: /About & skills$/ }).click();
  await page
    .getByLabel("Your skills", { exact: true })
    .fill("Design, Research, Prototyping");
  await page
    .getByLabel("About you", { exact: true })
    .fill("I turn ideas into welcoming digital spaces.");
  await page.getByRole("button", { name: /Projects$/ }).click();
  await page
    .getByRole("button", { name: "+ Add a project", exact: true })
    .click();
  await page.getByLabel("Project title", { exact: true }).fill("First project");
  await page
    .getByRole("button", { name: "+ Add a project", exact: true })
    .click();
  await page
    .getByLabel("Project title", { exact: true })
    .nth(1)
    .fill("Second project");
  await page
    .getByRole("button", { name: "Move project 2 up", exact: true })
    .click();
  await expect(
    page.getByLabel("Project title", { exact: true }).first(),
  ).toHaveValue("Second project");
  await page.getByRole("button", { name: /Design$/ }).click();
  for (const name of [
    "Pinboard / Bento",
    "Motion Story",
    "Quest / Level-Up",
    "Editorial",
  ])
    await page
      .getByRole("button", { name: new RegExp(`^${name.replace("/", "\\/")}`) })
      .click();
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator(".app")).toHaveClass(/dark/);
  await expect(page.locator(".portfolio")).toHaveClass(/portfolio-light/);
  await page.getByRole("button", { name: /Review & export$/ }).click();
  await page
    .getByRole("button", { name: "Move About section down", exact: true })
    .click();
  await page
    .getByRole("checkbox", { name: "Achievements", exact: true })
    .uncheck();
  await page
    .getByLabel("About section color", { exact: true })
    .selectOption("violet");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /^JSON backup/ }).click();
  const download = await downloadPromise;
  const raw = await fs.readFile((await download.path())!, "utf8");
  const backup = JSON.parse(raw);
  expect(backup.identity.name).toBe("Taylor Guest");
  expect(backup.skills).toHaveLength(3);
  backup.identity.name = "Restored Guest";
  await page
    .getByLabel("Choose a portfolio JSON backup")
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(backup)),
    });
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.locator(".portfolio").innerText()).toContain(
    "Taylor Guest",
  );
  await page
    .getByRole("button", { name: "Replace draft", exact: true })
    .click();
  await expect(page.locator(".portfolio")).toContainText("Restored Guest");
  await page
    .getByLabel("Choose a portfolio JSON backup")
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"bad":true}'),
    });
  await expect(page.getByRole("status").last()).toContainText("not a valid");
  await expect(page.locator(".portfolio")).toContainText("Restored Guest");
  await fs.mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/builder-desktop.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("mobile, keyboard, and reduced motion remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/builder");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page.getByLabel("Your name", { exact: true }).fill("Mobile Guest");
  await page
    .getByLabel("Professional headline", { exact: true })
    .fill("A story that fits every screen.");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(
    page.getByRole("region", { name: "Live preview" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Back to editing", exact: true })
    .click();
  await expect(page.getByLabel("Your name", { exact: true })).toBeVisible();
  await fs.mkdir("artifacts", { recursive: true });
  await page.screenshot({
    path: "artifacts/builder-mobile.png",
    fullPage: true,
  });
});
