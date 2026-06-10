import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const [dayRaw] = process.argv.slice(2);
if (!dayRaw) {
  console.error("Usage: node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs DAY");
  process.exit(1);
}

const day = Number(dayRaw);
if (!Number.isInteger(day) || day < 1 || day > 180) {
  console.error("DAY must be an integer from 1 to 180");
  process.exit(1);
}

const prefix = `day-${String(day).padStart(3, "0")}-`;
const dayFiles = (await readdir("src/days")).filter((file) => file.startsWith(prefix) && file.endsWith(".md"));
let failures = 0;

if (dayFiles.length !== 1) {
  console.error(`Expected exactly one src/days/${prefix}*.md file; found ${dayFiles.length}`);
  failures++;
} else {
  const text = await readFile(path.join("src/days", dayFiles[0]), "utf8");
  for (const needle of ["layout: layouts/day.njk", "section class=\"sources\"", "class=\"recap\"", "class=\"tomorrow\""]) {
    if (!text.includes(needle)) {
      console.error(`${dayFiles[0]} missing ${needle}`);
      failures++;
    }
  }
}

for (const file of ["src/_data/future-links.yaml", "src/_data/credits.yaml", "src/assets/css/book.css", "src/assets/js/book.js"]) {
  try {
    await access(file);
  } catch {
    console.error(`Missing expected project file: ${file}`);
    failures++;
  }
}

if (failures) process.exit(1);
console.log(`Day ${day} checklist passed`);

