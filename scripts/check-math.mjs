import { readFile } from "node:fs/promises";
import { walk } from "./lib/fs.mjs";

const legacyPatterns = [
  { pattern: /class="formula"[^>]*>[\s\S]*?<p\s+class="eq"/, label: "raw .formula .eq (use {% math %} instead)" },
  { pattern: /<p\s+class="formula"><code>/, label: "raw <p class=formula><code> (use {% math %} instead)" },
  { pattern: /\\\[.*\\\]/, label: "raw \\[ \\] delimiters (use {% math %} instead)" },
];

const files = await walk("src/_includes/days", { exts: ".njk", ignored: [] });
let failures = 0;

for (const file of files) {
  const content = await readFile(file, "utf8");
  for (const { pattern, label } of legacyPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      console.error(`${file}: ${label}`);
      failures++;
    }
  }
}

if (failures) {
  console.error(`\nMath lint failed. ${failures} legacy pattern(s) found.`);
  console.error("Use {% math %}...{% endmath %} for display equations.");
  process.exit(1);
}

console.log(`Math lint passed for ${files.length} files. All equations use KaTeX.`);
