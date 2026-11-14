import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
async function files(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = dir + "/" + entry.name;
    if (entry.isDirectory()) out.push(...(await files(p)));
    else if (
      !entry.name.endsWith(".map") &&
      !["sw.js", "offline-manifest.json"].includes(entry.name)
    )
      out.push("/" + p.slice(5));
  }
  return out;
}
const assets = (await files("dist")).sort();
const hash = createHash("sha256");
for (const asset of assets) {
  hash.update(asset);
  hash.update(await readFile("dist" + asset));
}
hash.update(await readFile("public/sw.js"));
const version = hash.digest("hex").slice(0, 12),
  cacheName = "recoverymap-" + version;
const precache = ["/", ...assets, "/offline-manifest.json"];
await writeFile(
  "dist/offline-manifest.json",
  JSON.stringify({ cacheName, assets: precache }, null, 2),
);
let sw = await readFile("dist/sw.js", "utf8");
sw = sw
  .replace("const CACHE='recoverymap-v1';", `const CACHE='${cacheName}';`)
  .replace(
    "addAll([...new Set(['/',...assets])])",
    `addAll([...new Set(${JSON.stringify(precache)})])`,
  );
await writeFile("dist/sw.js", sw);
console.log(
  `Offline cache prepared: ${precache.length} files including CFT70 JSON/CSV, revision ${version}`,
);
