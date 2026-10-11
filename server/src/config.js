import { z } from "zod";
const httpOrigin = z
  .string()
  .url()
  .refine((value) => {
    const url = new URL(value);
    return (
      ["http:", "https:"].includes(url.protocol) &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      !url.username &&
      !url.password
    );
  });
export function readConfig(env) {
  const configuredOrigin = env.APP_ORIGIN || env.RENDER_EXTERNAL_URL;
  const origin = httpOrigin
    .parse(configuredOrigin || "http://127.0.0.1:5173")
    .replace(/\/$/, "");
  const production = env.NODE_ENV === "production";
  if (production && (!configuredOrigin || !origin.startsWith("https://")))
    throw new Error("Production requires an HTTPS APP_ORIGIN.");
  const databaseUrl = env.DATABASE_URL
    ? z
        .string()
        .url()
        .refine((value) =>
          ["postgres:", "postgresql:"].includes(new URL(value).protocol),
        )
        .parse(env.DATABASE_URL)
    : undefined;
  const supabaseUrl = env.SUPABASE_URL
    ? z
        .url()
        .refine((value) => value.startsWith("https://"))
        .parse(env.SUPABASE_URL)
    : undefined;
  const supabaseKey = env.SUPABASE_PUBLISHABLE_KEY;
  return {
    origin,
    production,
    databaseUrl,
    supabaseUrl,
    supabaseKey,
    port: z.coerce
      .number()
      .int()
      .min(1)
      .max(65535)
      .parse(env.PORT || 3001),
  };
}
