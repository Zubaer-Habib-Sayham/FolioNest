import express, {
  type ErrorRequestHandler,
  type RequestHandler,
} from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  portfolioSchema,
  publishableSchema,
  publishSchema,
  slugSchema,
  templateSchema,
  templates,
  visiblePortfolio,
} from "../../shared/src/schema.js";
import type { Repository } from "./repository.js";
import { installPublicRoutes, landingDocument } from "./seo.js";
import { readFileSync } from "node:fs";

export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}
export interface AppOptions {
  repository?: Repository;
  verifyToken?: (token: string) => Promise<string | null>;
  origin: string;
  clientDir?: string;
  portfolioCss?: string;
  production?: boolean;
  rateLimitMax?: number;
  analyticsHost?: string;
}
const empty = z.object({}).strict();
const uuid = z.uuid();
const saveBody = z.object({ data: portfolioSchema }).strict();
function required<T>(value: T | null | undefined) {
  if (value == null)
    throw new HttpError(404, "NOT_FOUND", "Portfolio not found.");
  return value;
}
export function createApp(options: AppOptions) {
  const app = express();
  app.disable("x-powered-by");
  app.use((req, res, next) => {
    res.locals.requestId = randomUUID();
    res.set("X-Request-ID", res.locals.requestId);
    const start = Date.now();
    res.on("finish", () => {
      if (process.env.NODE_ENV !== "test")
        console.log(
          JSON.stringify({
            level: "info",
            requestId: res.locals.requestId,
            method: req.method,
            route: req.route?.path || "unmatched",
            status: res.statusCode,
            durationMs: Date.now() - start,
          }),
        );
    });
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "blob:"],
          "connect-src": [
            "'self'",
            "https://*.supabase.co",
            ...([
              "https://us.i.posthog.com",
              "https://eu.i.posthog.com",
            ].includes(options.analyticsHost || "")
              ? [options.analyticsHost!]
              : []),
          ],
          "frame-src": ["'self'", "blob:"],
          "object-src": ["'none'"],
          "base-uri": ["'self'"],
          "upgrade-insecure-requests": options.production ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: options.production ? undefined : false,
    }),
  );
  app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Robots-Tag", "noindex");
    const origin = req.get("origin");
    if (origin && origin !== options.origin) {
      next(new HttpError(403, "ORIGIN_DENIED", "This origin is not allowed."));
      return;
    }
    if (origin) {
      res.set("Access-Control-Allow-Origin", origin);
      res.vary("Origin");
      res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
      res.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
    }
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app.use(express.json({ limit: "2mb", strict: true }));
  const limiter = rateLimit({
    windowMs: 60000,
    limit: options.rateLimitMax ?? 60,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Try again in a minute.",
      },
    },
  });
  app.use("/api/portfolios", limiter);
  const noQuery: RequestHandler = (req, _res, next) => {
    empty.parse(req.query);
    next();
  };
  app.use("/api", noQuery);
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/config", (_req, res) =>
    res.json({ cloud: Boolean(options.repository && options.verifyToken) }),
  );
  app.get("/api/templates", (_req, res) => res.json({ templates }));
  const auth: RequestHandler = async (req, res, next) => {
    try {
      const header = req.get("authorization") || "";
      if (!/^Bearer [A-Za-z0-9._-]{1,8192}$/.test(header))
        throw new HttpError(
          401,
          "AUTH_REQUIRED",
          "Sign in to use cloud saving and publishing.",
        );
      if (!options.verifyToken || !options.repository)
        throw new HttpError(
          503,
          "CLOUD_NOT_CONFIGURED",
          "Cloud services are not configured. Local editing and exports are available.",
        );
      const owner = await options.verifyToken(header.slice(7));
      if (!owner || !uuid.safeParse(owner).success)
        throw new HttpError(
          401,
          "INVALID_TOKEN",
          "Your session is invalid or expired. Sign in again.",
        );
      res.locals.owner = owner;
      next();
    } catch (error) {
      next(error);
    }
  };
  app.use("/api/portfolios", auth);
  app.get("/api/portfolios/me", async (_req, res) =>
    res.json({ portfolios: await options.repository!.list(res.locals.owner) }),
  );
  app.post("/api/portfolios", async (req, res) => {
    const { data } = saveBody.parse(req.body);
    const result = await options.repository!.create(res.locals.owner, data);
    if (!result)
      throw new HttpError(
        409,
        "PORTFOLIO_LIMIT",
        "You can keep up to 50 cloud portfolios. Remove an unused one first.",
      );
    res.status(201).json({ portfolio: result });
  });
  app.get("/api/portfolios/:id", async (req, res) =>
    res.json({
      portfolio: required(
        await options.repository!.get(
          uuid.parse(req.params.id),
          res.locals.owner,
        ),
      ),
    }),
  );
  app.put("/api/portfolios/:id", async (req, res) => {
    const { data } = saveBody.parse(req.body);
    res.json({
      portfolio: required(
        await options.repository!.save(
          uuid.parse(req.params.id),
          res.locals.owner,
          data,
        ),
      ),
    });
  });
  app.post("/api/portfolios/:id/publish", async (req, res) => {
    const id = uuid.parse(req.params.id);
    const body = publishSchema.parse(req.body);
    const portfolio = required(
      await options.repository!.get(id, res.locals.owner),
    );
    publishableSchema.parse(portfolio.data);
    if (portfolio.data.sample)
      throw new HttpError(
        400,
        "SAMPLE_CONTENT",
        "Replace the sample introduction with your own before publishing.",
      );
    const result = await options.repository!.publish(
      id,
      res.locals.owner,
      body.slug,
      body.indexable,
      portfolio.data,
    );
    if (!result)
      throw new HttpError(
        409,
        "DRAFT_CHANGED",
        "The draft changed during publishing. Review it and try again.",
      );
    res.json({ portfolio: result, url: `${options.origin}/p/${result.slug}` });
  });
  app.post("/api/portfolios/:id/unpublish", async (req, res) => {
    empty.parse(req.body ?? {});
    res.json({
      portfolio: required(
        await options.repository!.unpublish(
          uuid.parse(req.params.id),
          res.locals.owner,
        ),
      ),
    });
  });
  app.delete("/api/portfolios/:id", async (req, res) => {
    empty.parse(req.body ?? {});
    if (
      !(await options.repository!.remove(
        uuid.parse(req.params.id),
        res.locals.owner,
      ))
    )
      throw new HttpError(404, "NOT_FOUND", "Portfolio not found.");
    res.sendStatus(204);
  });
  app.get("/api/public/:slug", async (req, res) => {
    const slug = slugSchema.safeParse(req.params.slug);
    if (!slug.success || !options.repository)
      throw new HttpError(404, "NOT_FOUND", "Portfolio not found.");
    const result = required(
      await options.repository.publicPortfolio(slug.data),
    );
    res.json({
      slug: result.slug,
      data: visiblePortfolio(result.data),
      indexable: result.indexable,
    });
  });
  app.use("/api", (_req, _res, next) =>
    next(new HttpError(404, "NOT_FOUND", "Endpoint not found.")),
  );
  installPublicRoutes(app, {
    repository: options.repository,
    origin: options.origin,
    css: options.portfolioCss || "",
  });
  if (options.clientDir) {
    app.get("/builder", (req, res) => {
      z.object({ template: templateSchema.optional() })
        .strict()
        .parse(req.query);
      res.set("X-Robots-Tag", "noindex, nofollow");
      res.set("Cache-Control", "no-store");
      const index = readFileSync(`${options.clientDir}/index.html`, "utf8");
      res
        .type("html")
        .send(
          index.replace(
            "</head>",
            '<meta name="robots" content="noindex, nofollow"></head>',
          ),
        );
    });
    app.get("/", (req, res) => {
      empty.parse(req.query);
      res
        .type("html")
        .send(
          landingDocument(
            readFileSync(`${options.clientDir}/index.html`, "utf8"),
            options.origin,
          ),
        );
    });
    app.use(express.static(options.clientDir, { index: false }));
  }
  app.use((_req, res) =>
    res
      .set("X-Robots-Tag", "noindex")
      .status(404)
      .type("html")
      .send(
        '<!doctype html><html lang="en"><head><title>Page not found — FolioNest</title><meta name="robots" content="noindex"></head><body><main><h1>Page not found.</h1><a href="/">Back to FolioNest</a></main></body></html>',
      ),
  );
  const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
    if (res.headersSent) return;
    let status = 500,
      code = "INTERNAL_ERROR",
      message = "Something went wrong. Please try again.";
    if (error instanceof HttpError) {
      ({ status, code, message } = error);
    } else if (error instanceof z.ZodError) {
      status = 400;
      code = "VALIDATION_ERROR";
      message = "Check your information and try again.";
    } else if (error?.code === "23505") {
      status = 409;
      code = "SLUG_TAKEN";
      message = "That address is already in use. Choose another.";
    } else if (error?.type === "entity.too.large") {
      status = 413;
      code = "BODY_TOO_LARGE";
      message = "The portfolio is too large. Maximum request size is 2 MB.";
    } else if (error instanceof SyntaxError && "body" in error) {
      status = 400;
      code = "INVALID_JSON";
      message = "Request must contain valid JSON.";
    }
    if (status === 500 && process.env.NODE_ENV !== "test")
      console.error(
        JSON.stringify({
          level: "error",
          requestId: res.locals.requestId,
          code,
        }),
      );
    res.status(status).json({
      error: {
        code,
        message,
        ...(error instanceof z.ZodError
          ? {
              fields: error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
              })),
            }
          : {}),
      },
    });
  };
  app.use(errorHandler);
  return app;
}
