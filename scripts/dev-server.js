import { context } from "esbuild";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../", import.meta.url));
let child;
async function stopChild() {
  if (!child || child.exitCode !== null) return;
  const previous = child;
  await new Promise((resolve) => {
    previous.once("exit", resolve);
    previous.kill("SIGTERM");
  });
}
const builder = await context({
  absWorkingDir: root,
  entryPoints: ["server/src/index.js"],
  outfile: "server/dist/dev.js",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
  jsx: "automatic",
  plugins: [
    {
      name: "restart-local-api",
      setup(build) {
        build.onEnd(async (result) => {
          if (result.errors.length) return;
          await stopChild();
          child = spawn(
            process.execPath,
            ["--env-file-if-exists=.env", "server/dist/dev.js"],
            { cwd: root, stdio: "inherit", windowsHide: true },
          );
        });
      },
    },
  ],
});
await builder.watch();
async function shutdown() {
  await builder.dispose();
  await stopChild();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
