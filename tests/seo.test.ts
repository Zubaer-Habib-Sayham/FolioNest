import { test, expect } from "vitest";
import request from "supertest";
import { createApp } from "../server/src/app";
import { publicDocument, landingDocument } from "../server/src/seo";
import { samplePortfolio } from "../shared/src/schema";
import type { Repository } from "../server/src/repository";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
const data = { ...samplePortfolio(), sample: false };
const record = {
  slug: "taylor-guest",
  data,
  indexable: true,
  publishedAt: "2026-10-10T18:00:00Z",
};
test("public first response contains content and escaped SEO metadata without requiring JavaScript", async () => {
  const repo = {
    publicPortfolio: async (slug: string) =>
      slug === record.slug ? record : null,
    sitemap: async () => [
      { slug: record.slug, published_at: record.publishedAt },
    ],
  } as unknown as Repository;
  const app = createApp({
    repository: repo,
    origin: "https://folio.example",
    portfolioCss: ".portfolio{color:green}",
  });
  const response = await request(app).get("/p/taylor-guest");
  expect(response.status).toBe(200);
  expect(response.text).toContain("A softer kind of digital");
  expect(response.text).toContain(
    '<link rel="canonical" href="https://folio.example/p/taylor-guest">',
  );
  expect(response.text).toContain('property="og:title"');
  expect(response.text).toContain("application/ld+json");
  expect(response.text).toContain('"@type":"Person"');
  expect((await request(app).get("/p/missing-portfolio")).status).toBe(404);
  expect((await request(app).get("/p/Bad--slug")).status).toBe(404);
  expect((await request(app).get("/sitemap.xml")).text).toContain(
    "https://folio.example/p/taylor-guest",
  );
  const robots = (await request(app).get("/robots.txt")).text;
  expect(robots).not.toContain("Disallow: /p");
  expect(robots).toContain("Sitemap: https://folio.example/sitemap.xml");
});
test("noindex and JSON-LD remain safe with hostile profile text and hidden information", () => {
  const malicious = structuredClone(record);
  malicious.data.identity.name = "</script><script>alert(1)</script>";
  malicious.data.about = "<img src=x onerror=alert(1)>";
  malicious.data.sections.find((s) => s.id === "about")!.visible = false;
  malicious.indexable = false;
  const html = publicDocument(malicious, "https://folio.example");
  expect(html).toContain("noindex, follow");
  expect(html).not.toContain("<script>alert");
  expect(html).not.toContain("onerror=alert");
  const json = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/,
  )![1];
  expect(JSON.parse(json).name).toBe(malicious.data.identity.name);
});
test("landing canonical is derived from configured origin, never an untrusted Host header", () => {
  const html = landingDocument(
    "<html><head><title>FolioNest</title></head><body>Build your story</body></html>",
    "https://folio.example",
  );
  expect(html).toContain('href="https://folio.example/"');
  expect(html).toContain("og:image");
});
test("private builder accepts bounded email callbacks and rejects arbitrary query keys", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "folio-pages-"));
  try {
    await writeFile(
      path.join(directory, "index.html"),
      "<html><head><title>FolioNest</title></head><body>Workspace</body></html>",
    );
    const app = createApp({
      origin: "https://folio.example",
      clientDir: directory,
    });
    const response = await request(app).get(
      "/builder?code=valid-callback-code",
    );
    expect(response.status).toBe(200);
    expect(response.headers["x-robots-tag"]).toContain("noindex");
    expect(response.text).toContain('name="robots" content="noindex');
    expect((await request(app).get("/builder?account=1")).status).toBe(200);
    expect((await request(app).get("/builder?account=2")).status).toBe(400);
    expect((await request(app).get("/builder?owner_id=untrusted")).status).toBe(
      400,
    );
    expect(
      (await request(app).get("/builder/?error=access_denied")).status,
    ).toBe(200);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
