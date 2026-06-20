import { readFile } from "node:fs/promises";
import { exists, walk } from "./lib/fs.mjs";

const legacyPatterns = [
  { pattern: /class="formula"[^>]*>[\s\S]*?<p\s+class="eq"/, label: "raw .formula .eq (use {% math %} instead)" },
  { pattern: /<p\s+class="formula"><code>/, label: "raw <p class=formula><code> (use {% math %} instead)" },
  { pattern: /\\\[.*\\\]/, label: "raw \\[ \\] delimiters (use {% math %} instead)" },
  { pattern: /<text[^>]*>[^<]*\\\(/, label: "KaTeX delimiter inside SVG text (SVG text cannot render KaTeX)" },
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

if (await exists("_site")) {
  const builtFiles = await walk("_site", { exts: ".html", ignored: [] });
  const builtPatterns = [
    { pattern: /katex-error|ParseError|KaTeX parse error/, label: "KaTeX render error in built HTML" },
    { pattern: /\\\(|\\\)|\\\[|\\\]/, label: "unrendered KaTeX delimiter in built HTML" },
  ];

  for (const file of builtFiles) {
    const content = await readFile(file, "utf8");
    for (const { pattern, label } of builtPatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(content)) {
        console.error(`${file}: ${label}`);
        failures++;
      }
    }
  }
}

if (failures) {
  console.error(`\nMath lint failed. ${failures} problem(s) found.`);
  console.error("Use {% math %}...{% endmath %} for display equations.");
  process.exit(1);
}

console.log(`Math lint passed for ${files.length} files. KaTeX output is clean.`);
