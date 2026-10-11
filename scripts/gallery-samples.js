import { readFile } from "node:fs/promises";
import { samplePortfolio, portfolioSchema } from "../shared/src/schema.js";

// Gallery imagery is illustrative and never replaces a visitor's saved draft.
export async function galleryPortfolio(templateId) {
  const p = samplePortfolio();
  p.theme = templateId;
  if (templateId === "studio") {
    const asset = async (filename, type) =>
      `data:image/${type};base64,${(await readFile(new URL(`../assets/gallery/studio/${filename}`, import.meta.url))).toString("base64")}`;
    p.identity.photo = await asset("portrait.webp", "webp");
    p.projects[0] = {
      ...p.projects[0],
      title: "Form & space",
      description:
        "An illustrative architecture concept exploring warm materials, quiet spaces and a clear visual language.",
      tags: "Sample project · Art direction",
      image: await asset("interior.jpg", "jpeg"),
      imageAlt: "Cream lounge chair in a warm architectural interior",
    };
    p.projects[1] = {
      ...p.projects[1],
      title: "Everyday ritual",
      description:
        "An illustrative identity concept balancing tactile packaging, soft light and thoughtful everyday details.",
      tags: "Sample project · Visual identity",
      image: await asset("branding.jpg", "jpeg"),
      imageAlt: "Terracotta bottle and cream carton on a stone plinth",
    };
  }
  return portfolioSchema.parse(p);
}
