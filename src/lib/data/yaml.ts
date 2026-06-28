import { readFile } from "node:fs/promises";
import YAML from "yaml";

export async function readYamlFile(filePath: string): Promise<unknown> {
  return YAML.parse(await readFile(filePath, "utf8"));
}
