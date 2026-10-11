import { copyFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = fileURLToPath(new URL("../", import.meta.url));
const target = path.join(root, "client/public/background-runtime");
await mkdir(target, { recursive: true });
for (const filename of [
  "vision_wasm_module_internal.js",
  "vision_wasm_module_internal.wasm",
]) {
  await copyFile(
    path.join(root, "node_modules/@mediapipe/tasks-vision/wasm", filename),
    path.join(target, filename),
  );
}
