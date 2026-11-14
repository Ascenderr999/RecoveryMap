import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const assets = (await readdir("dist/assets"))
  .filter((f) => !f.endsWith(".map"))
  .map((f) => "/assets/" + f);
const hash = createHash("sha256");
for (const asset of [...assets].sort()) {
  hash.update(asset);
  hash.update(await readFile("dist" + asset));
}
const version = hash.digest("hex").slice(0, 12);
let sw = await readFile("dist/sw.js", "utf8");
sw = sw.replace(
  "const CACHE='recoverymap-v1';",
  `const CACHE='recoverymap-${version}';`,
);
sw = sw.replace(
  "addAll([...new Set(['/',...assets])])",
  `addAll([...new Set(['/',...assets,...${JSON.stringify(assets)}])])`,
);
await writeFile("dist/sw.js", sw);
console.log(
  `Offline cache prepared: ${assets.length} assets, revision ${version}`,
);
