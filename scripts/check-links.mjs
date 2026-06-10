import { access, readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import matter from "gray-matter";
import YAML from "yaml";

const htmlFiles = await walk("_site", ".html");
let failures = 0;

for (const file of htmlFiles) {
  const $ = cheerio.load(await readFile(file, "utf8"));
  const ids = new Set($("[id]").map((_, el) => $(el).attr("id")).get());
  for (const a of $("a[href]").toArray()) {
    const href = $(a).attr("href");
    if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#") || href.startsWith("urn:")) continue;
    if (!href.startsWith("/")) continue;
    const [pathname, anchor] = href.split("#");
    const target = pathname.endsWith("/") ? path.join("_site", pathname, "index.html") : path.join("_site", pathname);
    try {
      await access(target);
      if (anchor && file === target && !ids.has(anchor)) {
        console.error(`Missing anchor ${href} in ${file}`);
        failures++;
      }
    } catch {
      console.error(`Broken internal link ${href} in ${file}`);
      failures++;
    }
  }
}

const dayFiles = (await readdir("src/days")).filter((file) => file.endsWith(".md"));
const days = dayFiles.map((file) => matter.read(path.join("src/days", file)).data.day);
const maxDay = Math.max(...days);
const futureLinks = YAML.parse(await readFile("src/_data/future-links.yaml", "utf8"));
for (const link of futureLinks) {
  if (link.status === "pending" && Number(link.target_day) <= maxDay) {
    console.error(`Future link ${link.id} targets published day ${link.target_day} but is still pending`);
    failures++;
  }
}

if (failures) process.exit(1);

async function walk(dir, ext) {
  const out = [];
  for (const entry of await readdir(dir)) {
    const full = path.join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) out.push(...await walk(full, ext));
    else if (full.endsWith(ext)) out.push(full);
  }
  return out;
}

