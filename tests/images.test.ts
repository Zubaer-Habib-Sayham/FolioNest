import { expect, test } from "vitest";
import { rasterDimensions, validPhoto } from "../shared/src/images";
import { samplePortfolio, portfolioSchema } from "../shared/src/schema";
test("image validation rejects active formats, remote images and malformed raster content", () => {
  for (const source of [
    "https://example.com/photo.jpg",
    "data:image/svg+xml;base64,PHN2Zz4=",
    "data:image/jpeg;base64,AAAA",
    "javascript:alert(1)",
  ])
    expect(validPhoto(source)).toBe(false);
  expect(() => rasterDimensions(new Uint8Array([255, 216, 255]))).toThrow();
  const p = samplePortfolio();
  p.identity.photo = "data:image/svg+xml;base64,PHN2Zz4=";
  expect(portfolioSchema.safeParse(p).success).toBe(false);
});
test("existing version-one backups gain optional photo fields without losing content", () => {
  const p = samplePortfolio();
  const legacy = JSON.parse(JSON.stringify(p));
  delete legacy.identity.photo;
  for (const project of legacy.projects) {
    delete project.image;
    delete project.imageAlt;
  }
  const restored = portfolioSchema.parse(legacy);
  expect(restored.identity.photo).toBe("");
  expect(restored.projects[0].image).toBe("");
  expect(restored.projects[0].title).toBe(p.projects[0].title);
});
