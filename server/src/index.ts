import express from "express";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";
const app = express();
app.disable("x-powered-by");
app.use(helmet());
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);
const client =
  process.env.NODE_ENV === "production"
    ? path.join(root, "client/dist")
    : path.resolve("../client/dist");
app.use(express.static(client));
app.get("/builder", (_req, res) => {
  res.set("X-Robots-Tag", "noindex");
  res.sendFile(path.join(client, "index.html"));
});
const server = app.listen(Number(process.env.PORT) || 3001, "127.0.0.1", () =>
  console.log("FolioNest API: http://127.0.0.1:3001"),
);
server.requestTimeout = 15000;
