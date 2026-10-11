import { test, expect } from "vitest";
import request from "supertest";
import { createApp } from "../server/src/app.js";
import { publicDocument, landingDocument } from "../server/src/seo.js";
import { samplePortfolio } from "../shared/src/schema.js";
import { mkdtemp, writeFile, rm, mkdir } from "node:fs/promises";
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
    publicPortfolio: async (slug) => (slug === record.slug ? record : null),
    sitemap: async () => [
      { slug: record.slug, published_at: record.publishedAt },
    ],
  };
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
  malicious.data.sections.find((s) => s.id === "about").visible = false;
  malicious.indexable = false;
  const html = publicDocument(malicious, "https://folio.example");
  expect(html).toContain("noindex, follow");
  expect(html).not.toContain("<script>alert");
  expect(html).not.toContain("onerror=alert");
  const json = html.match(
    /<script type="application\/ld\+json">(.*?)<\/script>/,
  )[1];
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

test("template gallery has meaningful HTML and its own canonical on the server", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "folio-gallery-"));
  try {
    await mkdir(path.join(directory, "templates"));
    await writeFile(
      path.join(directory, "templates/index.html"),
      '<html><head><title>Portfolio templates — FolioNest</title><link rel="canonical" href="https://stale.example/"></head><body><main><h1>Find your next canvas.</h1><a href="/builder?template=halo">Golden Hour</a></main></body></html>',
    );
    const app = createApp({
      origin: "https://folio.example",
      clientDir: directory,
    });
    const response = await request(app)
      .get("/templates")
      .set("Host", "untrusted.example");
    expect(response.status).toBe(200);
    expect(response.text).toContain("Golden Hour");
    expect(response.text).toContain('href="https://folio.example/templates"');
    expect(response.text).toContain(
      'property="og:url" content="https://folio.example/templates"',
    );
    expect(response.text.match(/rel="canonical"/g)).toHaveLength(1);
    expect(response.text).not.toMatch(/untrusted|stale|noindex/);
    expect((await request(app).get("/templates?query=private")).status).toBe(
      400,
    );
    expect((await request(app).get("/sitemap.xml")).text).toContain(
      "https://folio.example/templates",
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
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

test("social tracking is stripped before strict route validation while app queries remain intact", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "folio-tracking-"));
  try {
    await writeFile(
      path.join(directory, "index.html"),
      "<html><head><title>FolioNest</title></head><body>Build your story</body></html>",
    );
    const app = createApp({
      origin: "https://folio.example",
      clientDir: directory,
    });
    for (const query of [
      "fbclid=test",
      "gclid=test&dclid=test&msclkid=test&igshid=test",
      "utm_source=facebook&utm_medium=social&utm_campaign=launch&utm_custom=x",
      "FBCLID=test&GcLiD=test&DCLID=test&MSCLKID=test&IGSHID=test&UtM_Source=test",
      "%66bclid=test&%55TM_campaign=test&fbclid=one&fbclid=two",
    ]) {
      const response = await request(app).get(`/?${query}`);
      expect(response.status, query).toBe(200);
      expect(response.type).toBe("text/html");
      expect(response.text).toContain("Build your story");
    }
    expect(
      (await request(app).get("/api/health?fbclid=test&utm_source=facebook"))
        .status,
    ).toBe(200);
    const builder = await request(app).get(
      "/builder/?fbclid=test&template=studio&account=1&code=valid_callback-code&UTM_Source=facebook",
    );
    expect(builder.status).toBe(200);
    expect(builder.headers["x-robots-tag"]).toContain("noindex");
    for (const url of [
      "/?fbclid=test&unknown=value",
      "/?fbclid_extra=test",
      "/?utmSource=test",
      "/builder?fbclid=test&account=2",
      "/builder?utm_source=test&template=unknown",
      "/builder?gclid=test&code=invalid%20code",
      "/builder?fbclid=test&account=1&account=2",
      "/api/health?utm_medium=social&owner_id=untrusted",
    ]) {
      const response = await request(app).get(url);
      expect(response.status, url).toBe(400);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    }
    expect((await request(app).get("/missing-page?fbclid=test")).status).toBe(
      404,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
