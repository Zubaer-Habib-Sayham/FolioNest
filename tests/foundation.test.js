import { expect, test } from "vitest";
import { templateIds, templates } from "../shared/src/index.js";
test("registered designs have unique IDs and safe preview filenames", () => {
  expect(new Set(templateIds).size).toBe(templateIds.length);
  expect(templateIds.length).toBeGreaterThanOrEqual(11);
  expect(templates.map((template) => template.id)).toEqual(templateIds);
  for (const template of templates) {
    expect(template.id).toMatch(/^[a-z]+$/);
    if (template.previewImage)
      expect(template.previewImage).toMatch(/^[a-z]+\.(png|jpg)$/);
  }
});
