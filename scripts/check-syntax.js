import { transform } from "esbuild";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
const roots = [
  "client/src",
  "server/src",
  "shared/src",
  "scripts",
  "tests",
  "functions",
];
const files = [
  "client/vite.config.js",
  "playwright.config.js",
  "vitest.config.js",
  "eslint.config.js",
];
for (const root of roots) {
  for (const entry of await readdir(root, { recursive: true })) {
    if (/\.jsx?$/.test(entry)) files.push(path.join(root, entry));
  }
}
for (const file of files) {
  await transform(await readFile(file, "utf8"), {
    loader: file.endsWith(".jsx") ? "jsx" : "js",
    sourcefile: file,
    jsx: "automatic",
    logLevel: "warning",
  });
}
console.log(`Validated JavaScript syntax in ${files.length} files.`);
