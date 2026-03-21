import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "lib");
const dirs = [
  ["utils", "./utils/"],
  ["analytics", "./analytics/"],
  ["core", "./core/"],
  ["trading", "./trading/"],
  ["social", "./social/"],
];

const files = fs.readdirSync(root).filter((f) => f.endsWith(".ts"));
const cands = [];

for (const f of files) {
  const full = path.join(root, f);
  if (!fs.statSync(full).isFile()) continue;
  const txt = fs.readFileSync(full, "utf8");
  const lineCount = txt.split("\n").length;
  if (lineCount <= 6 && txt.includes("export * from")) continue;
  for (const [d, prefix] of dirs) {
    const twin = path.join(root, d, f);
    if (fs.existsSync(twin)) {
      cands.push({ f, d, prefix, lineCount });
      break;
    }
  }
}

cands.sort((a, b) => b.lineCount - a.lineCount);

const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Math.max(1, parseInt(limitArg.split("=")[1], 10) || 45) : 45;
const take = cands.slice(0, limit);

for (const { f, d, prefix } of take) {
  const p = path.join(root, f);
  const body = `/** Canonical: \`lib/${d}/${f}\`. */\nexport * from '${prefix}${f}';\n`;
  fs.writeFileSync(p, body, "utf8");
}

console.log("Barreled", take.length, "files");
console.log(take.map((x) => x.f).join(", "));
