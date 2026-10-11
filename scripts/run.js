import { build } from "esbuild";
import { mkdtemp, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

// Bundle JSX for Node while keeping third-party packages external.
const temporary = await mkdtemp(path.resolve(".script-"));
if (path.dirname(temporary) !== process.cwd() || !path.basename(temporary).startsWith(".script-"))
  throw new Error("Temporary script directory is outside the workspace.");
try {
  const outfile = path.join(temporary, "entry.mjs");
  await build({
    entryPoints: [process.argv[2]],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    packages: "external",
    jsx: "automatic",
    logLevel: "warning",
  });
  await import(pathToFileURL(outfile).href);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
