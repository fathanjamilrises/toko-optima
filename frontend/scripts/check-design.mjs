import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";

const sourceRoot = join(process.cwd(), "src");
const forbidden = [
  /backdrop-filter/i,
  /(?:linear|radial)-gradient\s*\(/i,
  /box-shadow\s*:\s*(?:-?\d+px\s+){2}0(?:px)?\s+(?:#[0-9a-f]{3,8}|rgb\()/i,
  /box-shadow\s*:\s*(?:-?\d+px\s+){2}(?:#[0-9a-f]{3,8}|rgb\()/i,
  /border\s*:\s*(?:[3-9]|[1-9]\d+)px\s+(?:solid|black|#000)/i,
];

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]));
  return nested.flat();
}

const matches = [];
for (const file of await files(sourceRoot)) {
  const source = await readFile(file, "utf8");
  forbidden.forEach((rule) => {
    if (rule.test(source)) matches.push(`${relative(process.cwd(), file)}: ${rule}`);
  });
}

if (matches.length) {
  console.error("Design check failed:\n" + matches.join("\n"));
  process.exit(1);
}

console.log("Design check passed: no forbidden visual patterns in src/.");
