import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const extensions = new Set([".css", ".js", ".mjs", ".ts", ".tsx"]);
const roots = ["src", "tests", "scripts"];
const failures = [];

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) await walk(target);
    else if (extensions.has(path.extname(entry.name))) {
      const lines = (await readFile(target, "utf8")).split(/\r?\n/).length;
      if (lines > 350) failures.push(`${target}: ${lines} lines`);
    }
  }
}

for (const root of roots) await walk(root);
if (failures.length) {
  console.error(`Maintained files exceed 350 physical lines:\n${failures.join("\n")}`);
  process.exit(1);
}
console.log("Line limit passed: all maintained files are <= 350 lines.");
