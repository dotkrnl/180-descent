import path from "node:path";
import { runPdfRendererSmoke } from "@lib/refactor";

try {
  const result = await runPdfRendererSmoke({ root: process.cwd() });
  console.log(`Wrote ${path.relative(process.cwd(), result.reportPath)}`);
  console.log(`Temporary outputs: ${path.relative(process.cwd(), result.outputDir)}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
