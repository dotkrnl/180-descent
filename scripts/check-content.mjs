import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import * as cheerio from "cheerio";

let failures = 0;
const dayFiles = (await readdir("src/days")).filter((file) => file.endsWith(".md")).sort();
if (!dayFiles.length) {
  console.error("No day files found");
  process.exit(1);
}

for (const file of dayFiles) {
  const full = path.join("src/days", file);
  const parsed = matter.read(full);
  for (const key of ["day", "title", "summary", "threads", "permalink"]) {
    if (!parsed.data[key]) {
      console.error(`${file} missing frontmatter key: ${key}`);
      failures++;
    }
  }
  if (!parsed.content.includes('class="sources"')) {
    console.error(`${file} has no sources section`);
    failures++;
  }
  if (!parsed.content.includes("chip ")) {
    console.error(`${file} has no frontier status chips`);
    failures++;
  }
  if (parsed.content.includes("fonts.googleapis.com")) {
    console.error(`${file} references remote Google Fonts`);
    failures++;
  }
  const $ = cheerio.load(parsed.content);
  const webPanels = $(".panel.web-only").length;
  const staticAlternates = $(".format-alt.print-only").length;
  if (staticAlternates < webPanels) {
    console.error(`${file} has ${webPanels} web-only panels but only ${staticAlternates} static print/EPUB alternates`);
    failures++;
  }
  $(".chip").each((_, el) => {
    if (!$(el).attr("data-print")) {
      console.error(`${file} has a status chip without data-print="${$(el).text().trim()}"`);
      failures++;
    }
  });
}

const css = await readFile("src/assets/css/book.css", "utf8");
if (!css.includes("@font-face")) {
  console.error("CSS does not declare local fonts");
  failures++;
}

if (failures) process.exit(1);
