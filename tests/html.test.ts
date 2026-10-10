import { test, expect } from "vitest";
import { samplePortfolio } from "../shared/src/schema";
import { portfolioMarkup, staticWebsite } from "../shared/src/html";
test("all templates render escaped meaningful independent content", () => {
  const p = samplePortfolio();
  p.identity.name = "<script>alert(1)</script>";
  for (const theme of ["editorial", "bento", "motion", "quest"] as const) {
    p.theme = theme;
    const html = staticWebsite(p);
    expect(html).toContain(`template-${theme}`);
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("styles.css");
    expect(html).not.toContain("localhost");
    expect(html).not.toContain("supabase");
  }
});
test("hidden sections stay out of exported content", () => {
  const p = samplePortfolio();
  p.sections.find((s) => s.id === "about")!.visible = false;
  expect(portfolioMarkup(p)).not.toContain("healthy dose of curiosity");
});
