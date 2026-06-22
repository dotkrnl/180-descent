import path from "node:path";
import { writeArtifactInventory } from "@lib/refactor";

try {
  const result = await writeArtifactInventory({ root: process.cwd() });
  console.log(`Wrote ${path.relative(process.cwd(), result.jsonPath)}`);
  console.log(`Wrote ${path.relative(process.cwd(), result.markdownPath)}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
