import { beforeAll, afterAll, test, expect } from "vitest";
import request from "supertest";
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs/promises";
import { createRepository } from "../server/src/repository";
import { createApp } from "../server/src/app";
import { samplePortfolio } from "../shared/src/schema";

const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222";
const db = new PGlite();
const repository = createRepository({
  query: async (sql, values) => db.query<Record<string, unknown>>(sql, values),
});
const app = createApp({
  repository,
  origin: "http://127.0.0.1:5173",
  verifyToken: async (token) =>
    token === "token-a" ? a : token === "token-b" ? b : null,
});
const owner = (
  method: "get" | "post" | "put" | "delete",
  url: string,
  user = "a",
) => request(app)[method](url).set("Authorization", `Bearer token-${user}`);
const draft = () => ({ ...samplePortfolio(), sample: false });
let id: string;
beforeAll(async () => {
  await db.exec(
    "create schema auth; create table auth.users(id uuid primary key); create role anon; create role authenticated; create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema auth to authenticated; grant execute on function auth.uid() to authenticated;",
  );
  await db.query("insert into auth.users values ($1),($2)", [a, b]);
  await db.exec(
    await fs.readFile(
      "supabase/migrations/20261010182706_portfolios.sql",
      "utf8",
    ),
  );
  const response = await owner("post", "/api/portfolios").send({
    data: draft(),
  });
  expect(response.status).toBe(201);
  id = response.body.portfolio.id;
}, 20000);
afterAll(async () => {
  await db.close();
});
test("authentication and strict request validation fail safely", async () => {
  const listing = (await owner("get", "/api/portfolios/me")).body.portfolios;
  expect(listing).toHaveLength(1);
  expect(listing[0]).not.toHaveProperty("data");
  expect(listing[0]).not.toHaveProperty("published_data");
  expect((await request(app).get("/api/portfolios/me")).status).toBe(401);
  expect((await owner("get", "/api/portfolios/me", "invalid")).status).toBe(
    401,
  );
  expect(
    (
      await owner("post", "/api/portfolios").send({
        data: draft(),
        owner_id: b,
      })
    ).status,
  ).toBe(400);
  expect((await owner("get", "/api/portfolios/not-a-uuid")).status).toBe(400);
  expect((await owner("get", "/api/portfolios/me?owner=" + b)).status).toBe(
    400,
  );
});
test("actual PostgreSQL queries prevent cross-account read, edit, publish, unpublish and delete", async () => {
  for (const [method, url, body] of [
    ["get", `/api/portfolios/${id}`, undefined],
    ["put", `/api/portfolios/${id}`, { data: draft() }],
    [
      "post",
      `/api/portfolios/${id}/publish`,
      { slug: "stolen-page", indexable: true, confirm: true },
    ],
    ["post", `/api/portfolios/${id}/unpublish`, {}],
    ["delete", `/api/portfolios/${id}`, {}],
  ] as const) {
    const response = await owner(method, url, "b").send(body);
    expect(response.status).toBe(404);
  }
  expect(
    (await owner("get", "/api/portfolios/me", "b")).body.portfolios,
  ).toEqual([]);
  expect((await owner("get", `/api/portfolios/${id}`)).status).toBe(200);
});
test("publication requires valid unique slug, confirmation and complete non-sample identity", async () => {
  expect(
    (
      await owner("post", `/api/portfolios/${id}/publish`).send({
        slug: "Bad Slug",
        indexable: true,
        confirm: true,
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await owner("post", `/api/portfolios/${id}/publish`).send({
        slug: "missing-confirmation",
        indexable: true,
      })
    ).status,
  ).toBe(400);
  expect(
    (
      await owner("post", `/api/portfolios/${id}/publish`).send({
        slug: "owner-portfolio",
        indexable: true,
        confirm: true,
      })
    ).status,
  ).toBe(200);
  const other = await owner("post", "/api/portfolios", "b").send({
    data: draft(),
  });
  expect(
    (
      await owner(
        "post",
        `/api/portfolios/${other.body.portfolio.id}/publish`,
        "b",
      ).send({ slug: "owner-portfolio", indexable: true, confirm: true })
    ).status,
  ).toBe(409);
  const sample = await owner("post", "/api/portfolios").send({
    data: samplePortfolio(),
  });
  expect(
    (
      await owner(
        "post",
        `/api/portfolios/${sample.body.portfolio.id}/publish`,
      ).send({ slug: "sample-portfolio", indexable: true, confirm: true })
    ).status,
  ).toBe(400);
});
test("private updates do not alter published snapshot; public JSON excludes internal fields", async () => {
  const original = await request(app).get("/api/public/owner-portfolio");
  expect(original.status).toBe(200);
  expect(original.body.owner_id).toBeUndefined();
  expect(original.body.id).toBeUndefined();
  const edited = draft();
  edited.identity.name = "Private next version";
  await owner("put", `/api/portfolios/${id}`).send({ data: edited });
  expect(
    (await request(app).get("/api/public/owner-portfolio")).body.data.identity
      .name,
  ).toBe("Zubaer Habib Sayham");
});
test("hidden fields are removed from public structured data", async () => {
  const hidden = draft();
  hidden.identity.name = "Hidden Contact";
  hidden.sections.find((s) => s.id === "contact")!.visible = false;
  hidden.sections.find((s) => s.id === "about")!.visible = false;
  const row = await owner("post", "/api/portfolios").send({ data: hidden });
  await owner("post", `/api/portfolios/${row.body.portfolio.id}/publish`).send({
    slug: "hidden-contact",
    indexable: false,
    confirm: true,
  });
  const result = await request(app).get("/api/public/hidden-contact");
  expect(result.body.data.identity.email).toBe("");
  expect(result.body.data.identity.website).toBe("");
  expect(result.body.data.about).toBe("");
});
test("stale draft cannot publish a different document accidentally", async () => {
  const current = await repository.get(id, a);
  const next = draft();
  next.identity.headline = "Changed concurrently";
  await repository.save(id, a, next);
  expect(
    await repository.publish(id, a, "stale-draft", false, current!.data),
  ).toBeNull();
});
test("public status codes, initial HTML and sitemap use actual publication state", async () => {
  const response = await request(app).get("/p/owner-portfolio");
  expect(response.status).toBe(200);
  expect(response.text).toContain("Zubaer Habib Sayham");
  expect(response.text).not.toContain("Private next version");
  expect(response.text).toContain(
    'href="http://127.0.0.1:5173/p/owner-portfolio"',
  );
  const sitemap = await request(app).get("/sitemap.xml");
  expect(sitemap.text).toContain("/p/owner-portfolio");
  expect(sitemap.text).not.toContain("/p/hidden-contact");
  expect(sitemap.text).not.toContain("/builder");
  const hidden = await request(app).get("/p/hidden-contact");
  expect(hidden.headers["x-robots-tag"]).toContain("noindex");
  expect(hidden.text).not.toContain("hello@example.com");
});
test("unpublishing immediately removes public data and sitemap eligibility", async () => {
  expect(
    (await owner("post", `/api/portfolios/${id}/unpublish`).send({})).status,
  ).toBe(200);
  expect((await request(app).get("/api/public/owner-portfolio")).status).toBe(
    404,
  );
  expect((await request(app).get("/p/owner-portfolio")).status).toBe(404);
  expect((await request(app).get("/sitemap.xml")).text).not.toContain(
    "/p/owner-portfolio",
  );
  expect(
    (await repository.sitemap()).some((row) => row.slug === "owner-portfolio"),
  ).toBe(false);
});
test("RLS protects Data API reads and revokes direct writes", async () => {
  await db.exec(`set role authenticated; set request.jwt.claim.sub='${b}';`);
  const result = await db.query<{ owner_id: string }>(
    "select owner_id from public.portfolios",
  );
  expect(result.rows.every((row) => row.owner_id === b)).toBe(true);
  await expect(
    db.query("update public.portfolios set title=$1 where id=$2", [
      "unauthorized",
      id,
    ]),
  ).rejects.toThrow(/permission denied/);
  await db.exec("reset role;");
});
test("origin, JSON size and rate limits are enforced", async () => {
  expect(
    (
      await owner("get", "/api/portfolios/me").set(
        "Origin",
        "https://evil.example",
      )
    ).status,
  ).toBe(403);
  expect(
    (await owner("post", "/api/portfolios").send({ data: "x".repeat(2100000) }))
      .status,
  ).toBe(413);
  const limited = createApp({
    origin: "http://127.0.0.1:5173",
    rateLimitMax: 1,
  });
  expect((await request(limited).get("/api/portfolios/me")).status).toBe(401);
  expect((await request(limited).get("/api/portfolios/me")).status).toBe(429);
});
test("missing cloud configuration leaves health and guest server operational", async () => {
  const local = createApp({ origin: "http://127.0.0.1:5173" });
  expect((await request(local).get("/api/health")).body).toEqual({
    status: "ok",
  });
  expect((await request(local).get("/api/config")).body).toEqual({
    cloud: false,
  });
  expect(
    (
      await request(local)
        .get("/api/portfolios/me")
        .set("Authorization", "Bearer token-a")
    ).status,
  ).toBe(503);
});
