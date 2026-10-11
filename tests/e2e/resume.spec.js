import { test, expect } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { samplePortfolio, templates } from "../../shared/src/schema.js";

test("all five templates export one A4 résumé from a long draft without changing it", async ({
  page,
}) => {
  test.setTimeout(120000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir("artifacts/resumes", { recursive: true });
  for (const template of templates) {
    const p = samplePortfolio();
    p.theme = template.id;
    p.sample = false;
    p.appearance = template.id === "studio" ? "dark" : "light";
    p.background = "sage";
    p.identity.name = "Zubaer Habib Sayham";
    p.identity.email = "person@example.com";
    p.identity.website = "https://example.com/my-portfolio";
    p.about = "Clear words about real work, impact and collaboration. ".repeat(
      70,
    );
    p.contact = "An invitation to collaborate on thoughtful work. ".repeat(20);
    p.skills = Array.from(
      { length: 40 },
      (_, i) => `Professional skill number ${i}`,
    );
    p.projects = Array.from({ length: 12 }, (_, i) => ({
      ...p.projects[0],
      id: `project-${i}`,
      title: `Project ${i}: a detailed example of thoughtful work`,
      description:
        "A detailed description of a real project and its impact. ".repeat(25),
    }));
    for (const id of ["experience", "education", "achievements"]) {
      p[id] = Array.from({ length: 12 }, (_, i) => ({
        ...p[id][0],
        id: `${id}-${i}`,
        description:
          "A detailed account of the work and lessons learned. ".repeat(30),
      }));
    }
    p.links = Array.from({ length: 12 }, (_, i) => ({
      id: `link-${i}`,
      label: `My professional writing ${i}`,
      url: `https://example.com/work/${i}`,
    }));
    await page.goto("/builder");
    await page.evaluate(
      (data) =>
        localStorage.setItem("folionest-draft-v1", JSON.stringify(data)),
      p,
    );
    await page.reload();
    await page.getByRole("button", { name: /Introduction$/ }).click();
    await page
      .getByLabel("Portrait photo (optional)", { exact: true })
      .setInputFiles("tests/fixtures/astronaut.png");
    await expect(page.locator(".portfolio-portrait")).toBeVisible();
    await page.getByRole("button", { name: /Review & export$/ }).click();
    await expect(page.getByRole("button", { name: /^CV PDF/ })).toHaveCount(0);
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("folionest-draft-v1")).identity
              .photo.length,
        ),
      )
      .toBeGreaterThan(100);
    const before = await page.evaluate(() =>
      localStorage.getItem("folionest-draft-v1"),
    );
    const pending = page.waitForEvent("download", { timeout: 15000 });
    await page.getByRole("button", { name: /^Download résumé/ }).click();
    const download = await pending;
    const filename = path.resolve(
      "artifacts/resumes",
      `${template.id}-resume.pdf`,
    );
    await download.saveAs(filename);
    const pdf = await getDocument({
      data: new Uint8Array(await readFile(filename)),
    }).promise;
    expect(pdf.numPages).toBe(1);
    const sheet = await pdf.getPage(1);
    expect(sheet.view[2]).toBeCloseTo(595.28, 1);
    expect(sheet.view[3]).toBeCloseTo(841.89, 1);
    const annotations = await sheet.getAnnotations();
    expect(
      annotations.some(
        (annotation) => annotation.url === "mailto:person@example.com",
      ),
    ).toBe(true);
    expect(
      annotations.some(
        (annotation) => annotation.url === "https://example.com/my-portfolio",
      ),
    ).toBe(true);
    await pdf.cleanup();
    expect(
      await page.evaluate(() => localStorage.getItem("folionest-draft-v1")),
    ).toBe(before);
  }
  expect(errors).toEqual([]);
});
