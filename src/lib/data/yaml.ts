import { readFile } from "node:fs/promises";
import YAML from "yaml";

export async function readYamlFile<T>(filePath: string): Promise<T> {
  return YAML.parse(await readFile(filePath, "utf8")) as T;
}
