import { expect, test } from "vitest";
import {
  blankPortfolio,
  samplePortfolio,
  portfolioSchema,
  publishableSchema,
  slugSchema,
  validateBackup,
} from "../shared/src/schema.js";
import { loadDraft, saveDraft, DRAFT_KEY } from "../client/src/storage.js";
test("blank drafts and complete samples validate", () => {
  expect(portfolioSchema.parse(blankPortfolio())).toBeTruthy();
  expect(publishableSchema.parse(samplePortfolio())).toBeTruthy();
  expect(publishableSchema.safeParse(blankPortfolio()).success).toBe(false);
});
test("rejects executable URLs, unknown properties, duplicates and oversized imports", () => {
  const p = samplePortfolio();
  p.identity.website = "javascript:alert(1)";
  expect(portfolioSchema.safeParse(p).success).toBe(false);
  expect(
    portfolioSchema.safeParse({ ...blankPortfolio(), owner_id: "intruder" })
      .success,
  ).toBe(false);
  const duplicate = samplePortfolio();
  duplicate.sections[1] = duplicate.sections[0];
  expect(portfolioSchema.safeParse(duplicate).success).toBe(false);
  expect(() => validateBackup(" ".repeat(2000001))).toThrow("too large");
});
test("slugs reject reserved, malformed and overlong addresses", () => {
  for (const value of [
    "Admin",
    "api",
    "two--hyphens",
    "-start",
    "a",
    "a".repeat(65),
  ])
    expect(slugSchema.safeParse(value).success).toBe(false);
  expect(slugSchema.parse("alex-morgan")).toBe("alex-morgan");
});
test("storage survives reload and reports failures without throwing", () => {
  const map = new Map();
  const storage = {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => {
      map.set(k, v);
    },
  };
  expect(saveDraft(storage, samplePortfolio())).toBe("Saved on this device");
  expect(loadDraft(storage).data.identity.name).toBe("Zubaer Habib Sayham");
  map.set(DRAFT_KEY, "broken");
  expect(loadDraft(storage).message).toContain("could not be read");
  expect(map.get(DRAFT_KEY)).toBe("broken");
  expect(
    saveDraft(
      {
        getItem: () => null,
        setItem: () => {
          throw Error("quota");
        },
      },
      samplePortfolio(),
    ),
  ).toContain("Unable");
});
