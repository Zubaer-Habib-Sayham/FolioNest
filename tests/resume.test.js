import { expect, test } from "vitest";
import {
  samplePortfolio,
  portfolioSchema,
  resumePortfolio,
} from "../shared/src/index.js";

test("résumé excerpts respect ordering, hidden sections and the unchanged draft", () => {
  const source = samplePortfolio();
  source.theme = "studio";
  source.appearance = "dark";
  source.background = "sage";
  source.about = "A longer introduction with meaningful wording. ".repeat(70);
  source.sections = [...source.sections].reverse();
  source.sections.find((section) => section.id === "experience").visible =
    false;
  source.projects = Array.from({ length: 12 }, (_, i) => ({
    ...source.projects[0],
    id: `project-${i}`,
    title: `Ordered project ${i}`,
  }));
  const before = structuredClone(source);
  const resume = resumePortfolio(source);
  expect(source).toEqual(before);
  expect(resume.identity.name).toBe(source.identity.name);
  expect(resume.about).toContain(
    "A longer introduction with meaningful wording.",
  );
  expect(resume.about.endsWith("…")).toBe(true);
  expect(resume.projects.map((p) => p.id)).toEqual(["project-0", "project-1"]);
  expect(resume.experience).toEqual([]);
  expect(resume.sections).toEqual(source.sections);
  expect(resume).toMatchObject({
    theme: "studio",
    appearance: "dark",
    background: "sage",
  });
  expect(portfolioSchema.safeParse(resume).success).toBe(true);
});

test("résumé tightening keeps identity and never truncates a surrogate pair", () => {
  const source = samplePortfolio();
  source.about = "💚".repeat(500);
  source.skills = Array.from({ length: 40 }, (_, i) => `Skill ${i}`);
  source.identity.email = "person@example.com";
  source.identity.website = "https://example.com/";
  const resume = resumePortfolio(source, 3);
  expect(resume.identity.name).toBe(source.identity.name);
  expect(resume.identity.email).toBe(source.identity.email);
  expect(resume.identity.website).toBe(source.identity.website);
  expect([...resume.about]).toHaveLength(60);
  expect(resume.about.slice(0, -1)).toBe("💚".repeat(59));
  expect(resume.skills).toHaveLength(6);
});
