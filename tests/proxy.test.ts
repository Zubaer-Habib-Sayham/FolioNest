import { expect, test, vi, afterEach } from "vitest";
import { onRequest } from "../functions/[[path]]";
afterEach(() => vi.unstubAllGlobals());
test("proxy excludes static files and never forwards to invalid origins", async () => {
  const next = vi.fn(async () => new Response("static"));
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  expect(
    await (
      await onRequest({
        request: new Request("https://folio.example/robots.txt"),
        env: { API_ORIGIN: "https://api.example" },
        next,
      })
    ).text(),
  ).toBe("static");
  expect(
    (
      await onRequest({
        request: new Request("https://folio.example/p/person"),
        env: { API_ORIGIN: "http://unsafe.example" },
        next,
      })
    ).status,
  ).toBe(503);
  expect(fetch).not.toHaveBeenCalled();
});
test("proxy preserves status, auth and public metadata without caching drafts", async () => {
  const fetch = vi.fn(
    async () =>
      new Response("<h1>Published person</h1>", {
        status: 404,
        headers: { "X-Robots-Tag": "noindex", "set-cookie": "private-cookie" },
      }),
  );
  vi.stubGlobal("fetch", fetch);
  const response = await onRequest({
    request: new Request("https://folio.example/api/portfolios/me", {
      headers: {
        Authorization: "Bearer test-token",
        Cookie: "unneeded-cookie",
      },
    }),
    env: { API_ORIGIN: "https://api.example" },
    next: async () => new Response("static"),
  });
  expect(response.status).toBe(404);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(response.headers.has("set-cookie")).toBe(false);
  const [url, options] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
  expect(url.href).toBe("https://api.example/api/portfolios/me");
  expect(new Headers(options.headers).get("Authorization")).toBe(
    "Bearer test-token",
  );
  expect(new Headers(options.headers).has("Cookie")).toBe(false);
});
test("a sleeping upstream yields actionable noindex 503", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("timeout");
    }),
  );
  const response = await onRequest({
    request: new Request("https://folio.example/p/person"),
    env: { API_ORIGIN: "https://api.example" },
    next: async () => new Response("static"),
  });
  expect(response.status).toBe(503);
  expect(await response.text()).toContain("waking up");
  expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
});
