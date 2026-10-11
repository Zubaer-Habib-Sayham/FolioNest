import { describe, expect, it } from "vitest";
import { readConfig } from "../server/src/config.js";

describe("production origin configuration", () => {
  it("uses the hosting provider's assigned HTTPS origin when no custom origin is set", () => {
    expect(
      readConfig({
        NODE_ENV: "production",
        RENDER_EXTERNAL_URL: "https://folionest-example.onrender.com",
      }).origin,
    ).toBe("https://folionest-example.onrender.com");
  });
  it("prefers an explicitly configured custom domain", () => {
    expect(
      readConfig({
        NODE_ENV: "production",
        APP_ORIGIN: "https://example.com",
        RENDER_EXTERNAL_URL: "https://folionest-example.onrender.com",
      }).origin,
    ).toBe("https://example.com");
  });
  it("rejects missing, insecure, or non-origin production addresses", () => {
    for (const env of [
      {},
      { RENDER_EXTERNAL_URL: "http://example.com" },
      { RENDER_EXTERNAL_URL: "https://example.com/path" },
    ]) {
      expect(() => readConfig({ NODE_ENV: "production", ...env })).toThrow();
    }
  });
});
