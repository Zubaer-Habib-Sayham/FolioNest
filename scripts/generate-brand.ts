import { readFile, writeFile } from "node:fs/promises";
// Keep the supplied artwork intact, while giving it a tighter display viewport.
const png = await readFile("assets/brand/folionest-logo-icon.png");
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="220 190 330 400"><style>.tile{fill:#f5f2ff}@media(prefers-color-scheme:dark){.tile{fill:#e9e4fa}}</style><rect class="tile" x="220" y="190" width="330" height="400" rx="45"/><image width="${width}" height="${height}" href="data:image/png;base64,${png.toString("base64")}"/></svg>`;
await writeFile("client/public/brand/mark.svg", svg);
