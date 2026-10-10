import { expect, test } from "vitest";
import { templateIds } from "../shared/src/index";
test("five distinct supported designs", () => {
  expect(new Set(templateIds).size).toBe(5);
});
