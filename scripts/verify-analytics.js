import { chromium, expect } from "@playwright/test";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({
  channel: process.env.CI ? undefined : "chrome",
});
try {
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  });
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.text().includes("PostHog"))
      console.log(msg.type(), msg.text());
  });
  page.on("pageerror", (error) => console.log(error.message));
  const requests = [];
  const events = [];
  await page.addInitScript({
    content:
      "Object.defineProperty(navigator, 'webdriver', {get: () => false}); Object.defineProperty(navigator, 'userAgentData', {get: () => undefined});",
  });
  await page.route("https://*.posthog.com/**", async (route) => {
    requests.push(route.request().url());
    const raw = route.request().postData();
    if (raw) {
      const params = new URLSearchParams(raw);
      const payload = params.has("data")
        ? JSON.parse(Buffer.from(params.get("data"), "base64").toString())
        : JSON.parse(raw);
      events.push(
        ...(payload.batch || (Array.isArray(payload) ? payload : [payload])),
      );
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: '{"status":1}',
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  });
  await page.goto("http://127.0.0.1:5174/");
  await page.getByRole("link", { name: "Create your portfolio" }).click();
  await page.getByRole("button", { name: /Introduction$/ }).click();
  await page
    .getByLabel("Your name", { exact: true })
    .fill("PRIVATE PERSON NEVER SENT");
  await page
    .getByLabel("Professional headline", { exact: true })
    .fill("PRIVATE DRAFT NEVER SENT");
  assert.equal(requests.length, 0, "No SDK requests without consent");
  await page.getByText("Privacy & analytics", { exact: true }).click();
  await page.getByRole("button", { name: "Turn usage analytics on" }).click();
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect
    .poll(() => events.some((e) => e.event === "builder_step_completed"), {
      timeout: 10000,
    })
    .toBe(true);
  assert.ok(events.some((e) => e.event === "builder_step_completed"));
  for (const event of events) {
    assert.ok(
      [
        "site_opened",
        "builder_started",
        "builder_step_completed",
        "template_selected",
        "landing_cta_clicked",
        "contact_link_clicked",
        "export_downloaded",
      ].includes(event.event),
    );
    for (const key of Object.keys(event.properties))
      assert.ok(
        [
          "distinct_id",
          "$process_person_profile",
          "$geoip_disable",
          "template",
          "step",
          "format",
          "token",
          "type",
          "page",
        ].includes(key),
        key,
      );
  }
  assert.ok(!JSON.stringify(events).includes("PRIVATE"));
  await page.getByRole("button", { name: "Turn usage analytics off" }).click();
  const count = events.length;
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForTimeout(300);
  assert.equal(events.length, count);
  const dntPage = await browser.newPage();
  let dntRequests = 0;
  await dntPage.addInitScript({
    content:
      "Object.defineProperty(navigator,'doNotTrack',{get:()=> '1'}); localStorage.setItem('folionest-analytics','enabled');",
  });
  await dntPage.route("https://*.posthog.com/**", async (route) => {
    dntRequests++;
    await route.fulfill({ status: 200, body: "{}" });
  });
  await dntPage.goto("http://127.0.0.1:5174/builder");
  await dntPage.getByRole("button", { name: /^Pinboard/ }).click();
  await dntPage.getByText("Privacy & analytics", { exact: true }).click();
  await expect(
    dntPage.getByText("Usage analytics is off.", { exact: true }),
  ).toBeVisible();
  await dntPage.waitForTimeout(300);
  assert.equal(dntRequests, 0);
  await mkdir("artifacts", { recursive: true });
  await writeFile(
    "artifacts/analytics-verification.json",
    JSON.stringify(
      {
        requests: requests.length,
        events: events.map((e) => ({
          event: e.event,
          keys: Object.keys(e.properties),
        })),
        privateContentSent: false,
        doNotTrackRequests: dntRequests,
      },
      null,
      2,
    ),
  );
  console.log(
    `Analytics verified: ${events.length} intercepted event(s); no requests before consent; opt-out blocks further capture.`,
  );
} finally {
  await browser.close();
}
