import { checkVisual, parseVisualCheckArgs } from "@lib/checks/visual";
import { exitOnErrors } from "./support";

const args = parseVisualCheckArgs(process.argv.slice(2));
const baseUrl = args.baseUrl;
if (!baseUrl) {
  console.error("Usage: npm run check:visual -- --base <url> [--compare <url>] [--out tmp/visual-qa]");
  process.exit(1);
}

const result = await checkVisual({
  root: process.cwd(),
  baseUrl,
  compareUrl: args.compareUrl,
  outDir: args.outDir
});

console.log(`Visual QA report: ${result.reportPath}`);
exitOnErrors(result.errors, (error) => error);
