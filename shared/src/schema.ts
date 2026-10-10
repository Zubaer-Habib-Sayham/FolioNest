import { z } from "zod";
export const recordIdSchema = z.uuid();
export const templateSchema = z.enum(["editorial", "bento", "motion", "quest"]);
export const palettes = {
  forest: "#355b40",
  violet: "#65508a",
  ocean: "#285b78",
  terracotta: "#9b4934",
  rose: "#914360",
  ink: "#303d4e",
} as const;
export type Palette = keyof typeof palettes;
export const paletteSchema = z.enum([
  "forest",
  "violet",
  "ocean",
  "terracotta",
  "rose",
  "ink",
]);
export const sectionIds = [
  "about",
  "skills",
  "projects",
  "experience",
  "education",
  "achievements",
  "links",
  "contact",
] as const;
export const sectionNames = {
  about: "About",
  skills: "Skills",
  projects: "Selected work",
  experience: "Experience",
  education: "Education",
  achievements: "Achievements",
  links: "Around the web",
  contact: "Let’s connect",
};
const text = (max: number) =>
  z
    .string()
    .max(max)
    .refine(
      (v) =>
        [...v].every((char) => {
          const code = char.charCodeAt(0);
          return code >= 32 || [9, 10, 13].includes(code);
        }),
      "Remove control characters",
    );
export const webUrl = text(500).refine((value) => {
  if (!value) return true;
  try {
    const u = new URL(value);
    return (
      ["http:", "https:"].includes(u.protocol) && !u.username && !u.password
    );
  } catch {
    return false;
  }
}, "Use a full http:// or https:// link");
export const emailSchema = z.union([z.literal(""), z.email().max(254)]);
const itemId = z
  .string()
  .min(1)
  .max(80)
  .regex(/^[a-zA-Z0-9_-]+$/);
export const projectSchema = z
  .object({
    id: itemId,
    title: text(100),
    description: text(1600),
    tags: text(200),
    url: webUrl,
  })
  .strict();
export const journeySchema = z
  .object({
    id: itemId,
    title: text(120),
    organization: text(120),
    period: text(100),
    description: text(1600),
  })
  .strict();
const unique = <T extends { id: string }>(items: T[]) =>
  new Set(items.map((x) => x.id)).size === items.length;
export const portfolioSchema = z
  .object({
    version: z.literal(1),
    sample: z.boolean(),
    theme: templateSchema,
    palette: paletteSchema,
    appearance: z.enum(["light", "dark"]),
    font: z.enum(["sans", "serif", "mono"]),
    identity: z
      .object({
        name: text(100),
        headline: text(160),
        location: text(120),
        email: emailSchema,
        website: webUrl,
      })
      .strict(),
    about: text(4000),
    skills: z.array(text(60).min(1)).max(40),
    projects: z
      .array(projectSchema)
      .max(12)
      .refine(unique, "Project IDs must be unique"),
    experience: z
      .array(journeySchema)
      .max(12)
      .refine(unique, "Experience IDs must be unique"),
    education: z
      .array(journeySchema)
      .max(12)
      .refine(unique, "Education IDs must be unique"),
    achievements: z
      .array(journeySchema)
      .max(12)
      .refine(unique, "Achievement IDs must be unique"),
    links: z
      .array(z.object({ id: itemId, label: text(80), url: webUrl }).strict())
      .max(12)
      .refine(unique, "Link IDs must be unique"),
    contact: text(1200),
    sections: z
      .array(
        z
          .object({
            id: z.enum(sectionIds),
            visible: z.boolean(),
            color: paletteSchema,
          })
          .strict(),
      )
      .length(sectionIds.length)
      .refine(unique, "Include every section once"),
  })
  .strict();
export type PortfolioData = z.infer<typeof portfolioSchema>;
export type SectionId = (typeof sectionIds)[number];
export type Journey = z.infer<typeof journeySchema>;
export function visiblePortfolio(input: PortfolioData): PortfolioData {
  const p = structuredClone(input);
  const visible = new Set(p.sections.filter((s) => s.visible).map((s) => s.id));
  if (!visible.has("about")) p.about = "";
  if (!visible.has("skills")) p.skills = [];
  for (const key of [
    "projects",
    "experience",
    "education",
    "achievements",
    "links",
  ] as const)
    if (!visible.has(key)) p[key] = [];
  if (!visible.has("contact")) {
    p.contact = "";
    p.identity.email = "";
    p.identity.website = "";
  }
  return p;
}
export const publishableSchema = portfolioSchema.superRefine((p, ctx) => {
  if (!p.identity.name.trim())
    ctx.addIssue({
      code: "custom",
      path: ["identity", "name"],
      message: "Add your name",
    });
  if (!p.identity.headline.trim())
    ctx.addIssue({
      code: "custom",
      path: ["identity", "headline"],
      message: "Add a short professional headline",
    });
});
export const slugSchema = z
  .string()
  .min(3)
  .max(64)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers and single hyphens",
  )
  .refine(
    (x) =>
      ![
        "api",
        "admin",
        "builder",
        "account",
        "auth",
        "templates",
        "sitemap",
        "robots",
        "login",
        "signup",
        "dashboard",
        "health",
      ].includes(x),
    "Choose another address",
  );
export const publishSchema = z
  .object({
    slug: slugSchema,
    indexable: z.boolean(),
    confirm: z.literal(true),
  })
  .strict();
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
] as const;
export function blankPortfolio(): PortfolioData {
  return {
    version: 1,
    sample: false,
    theme: "editorial",
    palette: "forest",
    appearance: "light",
    font: "sans",
    identity: { name: "", headline: "", location: "", email: "", website: "" },
    about: "",
    skills: [],
    projects: [],
    experience: [],
    education: [],
    achievements: [],
    links: [],
    contact: "",
    sections: sectionIds.map((id) => ({ id, visible: true, color: "forest" })),
  };
}
export function samplePortfolio(): PortfolioData {
  return {
    ...blankPortfolio(),
    sample: true,
    identity: {
      name: "Alex Morgan",
      headline: "Thoughtful design. Human stories.",
      location: "London, UK",
      email: "hello@example.com",
      website: "https://example.com",
    },
    about:
      "I’m a designer and maker who turns complex ideas into calm, useful experiences. My work lives at the intersection of strategy, storytelling and a healthy dose of curiosity.",
    skills: [
      "Product design",
      "Visual storytelling",
      "Research",
      "Prototyping",
      "Accessible design",
    ],
    projects: [
      {
        id: "sample-1",
        title: "A softer kind of digital",
        description:
          "An independent exploration of more thoughtful digital spaces. From research to a clear, welcoming product experience.",
        tags: "Strategy · Product design",
        url: "https://example.com",
      },
      {
        id: "sample-2",
        title: "Room to grow",
        description:
          "A visual identity for people making good things happen. A flexible system built around an optimistic, human voice.",
        tags: "Identity · Art direction",
        url: "https://example.com",
      },
    ],
    experience: [
      {
        id: "sample-work",
        title: "Product designer",
        organization: "Independent practice",
        period: "2023 — Present",
        description:
          "Helping small teams make meaningful products with research, thoughtful design and close collaboration.",
      },
    ],
    education: [
      {
        id: "sample-education",
        title: "BA, Design",
        organization: "Example School of Art",
        period: "2019 — 2022",
        description:
          "Focused on communication, visual systems and inclusive design.",
      },
    ],
    achievements: [
      {
        id: "sample-achievement",
        title: "Accessible design certificate",
        organization: "Example learning program",
        period: "2024",
        description: "Building experiences that work for more people.",
      },
    ],
    links: [
      {
        id: "sample-link",
        label: "My design journal",
        url: "https://example.com",
      },
    ],
    contact: "Have an interesting idea? I’d love to hear about it.",
  };
}
export function validateBackup(raw: string): PortfolioData {
  if (new TextEncoder().encode(raw).length > 150000)
    throw new Error("Backup is too large. Maximum size is 150 KB.");
  return portfolioSchema.parse(JSON.parse(raw));
}
