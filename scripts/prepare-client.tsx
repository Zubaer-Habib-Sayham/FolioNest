import React from "react";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import Landing from "../client/src/Landing";
import { websiteBaseCss } from "../shared/src/html";
const raw = readFileSync("client/dist/index.html", "utf8");
const origin = (process.env.APP_ORIGIN || "http://127.0.0.1:5173").replace(
  /\/$/,
  "",
);
const url = new URL(origin);
if (
  !["http:", "https:"].includes(url.protocol) ||
  url.pathname !== "/" ||
  url.search ||
  url.hash ||
  url.username ||
  url.password
)
  throw new Error("APP_ORIGIN must be a valid HTTP origin.");
const escaped = origin
  .replace(/&/g, "&amp;")
  .replace(/"/g, "&quot;")
  .replace(/</g, "&lt;");
const metadata = `<link rel="canonical" href="${escaped}/"><meta property="og:type" content="website"><meta property="og:title" content="FolioNest — Your story, beautifully online."><meta property="og:description" content="Build a portfolio that feels like you. Four thoughtful designs and free exports."><meta property="og:url" content="${escaped}/"><meta property="og:image" content="${escaped}/brand/folionest-icon-512.png">`;
const index = raw
  .replace(
    /<div id="root">[\s\S]*?<\/div>/,
    `<div id="root">${renderToStaticMarkup(<Landing />)}</div>`,
  )
  .replace("</head>", metadata + "</head>");
writeFileSync("client/dist/index.html", index);
writeFileSync(
  "client/dist/portfolio.css",
  websiteBaseCss + "\n" + readFileSync("shared/src/portfolio.css", "utf8"),
);
mkdirSync("client/dist/builder", { recursive: true });
writeFileSync(
  "client/dist/builder/index.html",
  raw.replace(
    "</head>",
    '<meta name="robots" content="noindex, nofollow"></head>',
  ),
);
writeFileSync(
  "client/dist/robots.txt",
  `User-agent: *\nAllow: /\nDisallow: /builder\nDisallow: /auth\nDisallow: /account\nDisallow: /dashboard\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`,
);
writeFileSync(
  "client/dist/_headers",
  "/builder\n  X-Robots-Tag: noindex, nofollow\n/builder/*\n  X-Robots-Tag: noindex, nofollow\n",
);
writeFileSync(
  "client/dist/_routes.json",
  JSON.stringify({
    version: 1,
    include: ["/api/*", "/p/*", "/sitemap.xml"],
    exclude: [],
  }),
);
