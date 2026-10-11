import { expect, test } from "vitest";
import { rasterDimensions, validPhoto } from "../shared/src/images.js";
import {
  samplePortfolio,
  portfolioSchema,
  visiblePortfolio,
} from "../shared/src/schema.js";
import { readFileSync } from "node:fs";
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
  delete legacy.background;
  for (const project of legacy.projects) {
    delete project.image;
    delete project.imageAlt;
  }
  const restored = portfolioSchema.parse(legacy);
  expect(restored.identity.photo).toBe("");
  expect(restored.identity.photoOriginal).toBe("");
  expect(restored.identity.signature).toBe("");
  expect(restored.background).toBe("default");
  expect(restored.projects[0].image).toBe("");
  expect(restored.projects[0].title).toBe(p.projects[0].title);
});
test("bounded PNGs validate and corrupt chunks, mislabeled data and original backgrounds stay private", () => {
  const png = readFileSync("client/public/brand/folionest-icon-512.png");
  const data = `data:image/png;base64,${png.toString("base64")}`;
  expect(validPhoto(data)).toBe(true);
  const corrupt = Buffer.from(png);
  corrupt[40] ^= 1;
  expect(
    validPhoto(`data:image/png;base64,${corrupt.toString("base64")}`),
  ).toBe(false);
  expect(validPhoto(data.replace("image/png", "image/jpeg"))).toBe(false);
  const p = samplePortfolio();
  p.identity.photo = data;
  p.identity.photoOriginal = data;
  p.identity.signature = data;
  const visible = visiblePortfolio(portfolioSchema.parse(p));
  expect(visible.identity.photo).toBe(data);
  expect(visible.identity.photoOriginal).toBe("");
  expect(visible.identity.signature).toBe("");
  p.theme = "studio";
  expect(visiblePortfolio(p).identity.signature).toBe(data);
});
