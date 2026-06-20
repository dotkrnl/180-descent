import { readFileSync } from "node:fs";
import YAML from "yaml";

const data = YAML.parse(readFileSync(new URL("./syllabus.yaml", import.meta.url), "utf8"));

function project(value, locale) {
  if (value == null) return null;
  if (typeof value === "object" && !Array.isArray(value)) {
    if ("en" in value && "zh" in value) return value[locale];
    const out = {};
    for (const [key, val] of Object.entries(value)) out[key] = project(val, locale);
    return out;
  }
  if (Array.isArray(value)) return value.map((v) => project(v, locale));
  return value;
}

export default project(data, "en");
