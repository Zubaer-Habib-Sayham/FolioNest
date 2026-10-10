import { Pool } from "pg";
import { createClient } from "@supabase/supabase-js";
import { createApp, HttpError } from "./app.js";
import { createRepository } from "./repository.js";
import { readConfig } from "./config.js";
import path from "node:path";
import { readFileSync } from "node:fs";
const root = path.resolve(
  process.cwd(),
  path.basename(process.cwd()) === "server" ? ".." : ".",
);
const config = readConfig(process.env);
let pool: Pool | undefined;
if (config.databaseUrl) {
  const url = new URL(config.databaseUrl);
  for (const key of [
    "sslmode",
    "sslrootcert",
    "sslcert",
    "sslkey",
    "sslpassword",
  ])
    url.searchParams.delete(key);
  pool = new Pool({
    connectionString: url.toString(),
    ssl: {
      rejectUnauthorized: true,
      ...(process.env.DATABASE_CA_CERT
        ? { ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, "\n") }
        : {}),
    },
    max: 4,
    connectionTimeoutMillis: 8000,
    idleTimeoutMillis: 30000,
    statement_timeout: 8000,
  });
  pool.on("error", () =>
    console.error(
      JSON.stringify({ level: "error", code: "DATABASE_CONNECTION" }),
    ),
  );
}
const supabase =
  config.supabaseUrl && config.supabaseKey
    ? createClient(config.supabaseUrl, config.supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: {
          fetch: (input, init) =>
            fetch(input, { ...init, signal: AbortSignal.timeout(8000) }),
        },
      })
    : undefined;
const app = createApp({
  origin: config.origin,
  production: config.production,
  analyticsHost: process.env.VITE_POSTHOG_KEY
    ? process.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com"
    : undefined,
  clientDir: path.join(root, "client/dist"),
  portfolioCss: readFileSync(
    path.join(root, "shared/src/portfolio.css"),
    "utf8",
  ),
  repository: pool ? createRepository(pool) : undefined,
  verifyToken: supabase
    ? async (token) => {
        const { data, error } = await supabase.auth.getUser(token);
        if (error && (!error.status || error.status >= 500))
          throw new HttpError(
            503,
            "AUTH_UNAVAILABLE",
            "Sign-in services are unavailable. Try again later.",
          );
        return data.user && !data.user.is_anonymous ? data.user.id : null;
      }
    : undefined,
});
const server = app.listen(config.port, "0.0.0.0", () =>
  console.log(`FolioNest API: http://127.0.0.1:${config.port}`),
);
server.requestTimeout = 15000;
server.headersTimeout = 10000;
async function shutdown() {
  server.close();
  await pool?.end();
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
