export const templateIds = [
  "editorial",
  "bento",
  "motion",
  "quest",
  "studio",
  "monograph",
  "portrait",
  "atelier",
  "cinema",
  "ember",
  "halo",
];
export const templates = [
  {
    id: "editorial",
    name: "Editorial",
    description: "Refined type. Generous breathing room.",
  },
  {
    id: "bento",
    name: "Pinboard / Bento",
    description: "A playful collection of colorful cards.",
  },
  {
    id: "motion",
    name: "Motion Story",
    description: "Bold chapters that let your story unfold.",
  },
  {
    id: "quest",
    name: "Quest / Level-Up",
    description: "A professional timeline of your journey.",
  },
  {
    id: "studio",
    name: "Creative Studio",
    description: "Oversized type, warm paper and a portrait in the spotlight.",
    previewImage: "studio.jpg",
    displayFont: true,
  },
  {
    id: "monograph",
    name: "Monograph",
    description:
      "A monochrome portrait, oversized name and graphic project spreads.",
    previewImage: "monograph.jpg",
    category: "Bold",
    sampleImagery: true,
  },
  {
    id: "portrait",
    name: "Portrait Motion",
    description:
      "Outline typography and a layered portrait that gently comes into focus.",
    previewImage: "portrait.jpg",
    category: "Motion",
    sampleImagery: true,
  },
  {
    id: "atelier",
    name: "Quiet Atelier",
    description:
      "Minimal italic typography, a portrait column and generous white space.",
    previewImage: "atelier.jpg",
    category: "Minimal",
    sampleImagery: true,
  },
  {
    id: "cinema",
    name: "Cinematic",
    description:
      "Golden frames, bold titles and contrasting chapters for visual storytellers.",
    previewImage: "cinema.jpg",
    category: "Creative",
    sampleImagery: true,
    displayFont: true,
  },
  {
    id: "ember",
    name: "Ember",
    description:
      "A charcoal canvas, warm accent and a three-part portrait introduction.",
    previewImage: "ember.jpg",
    category: "Bold",
    sampleImagery: true,
  },
  {
    id: "halo",
    name: "Golden Hour",
    description:
      "An airy warm glow, an editorial portrait and confident condensed typography.",
    previewImage: "halo.jpg",
    category: "Creative",
    sampleImagery: true,
    displayFont: true,
  },
];

export const photographicTemplates = [
  "monograph",
  "portrait",
  "atelier",
  "cinema",
  "ember",
  "halo",
];
export function usesDisplayFont(id) {
  return Boolean(templates.find((template) => template.id === id)?.displayFont);
}
