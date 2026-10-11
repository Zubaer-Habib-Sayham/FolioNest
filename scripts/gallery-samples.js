import { readFile } from "node:fs/promises";
import { samplePortfolio, portfolioSchema } from "../shared/src/schema.js";
import { photographicTemplates } from "../shared/src/templates.js";

// Gallery imagery is illustrative and never replaces a visitor's saved draft.
export async function galleryPortfolio(templateId) {
  const p = samplePortfolio();
  p.theme = templateId;
  if (templateId === "studio" || photographicTemplates.includes(templateId)) {
    const asset = async (filename, type) =>
      `data:image/${type};base64,${(await readFile(new URL(`../assets/gallery/studio/${filename}`, import.meta.url))).toString("base64")}`;
    const portraits = {
      monograph: "profile.webp",
      cinema: "camera.webp",
      atelier: "female-close.webp",
      portrait: "female-wide.webp",
      halo: "female-wide.webp",
    };
    p.identity.photo = portraits[templateId]
      ? `data:image/webp;base64,${(await readFile(new URL(`../assets/gallery/portraits/${portraits[templateId]}`, import.meta.url))).toString("base64")}`
      : await asset("portrait.webp", "webp");
    if (templateId === "ember") p.appearance = "dark";
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
