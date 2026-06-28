import { checkVisual, parseVisualCheckArgs } from "@lib/checks/visual";
import { exitOnErrors } from "./support";

const args = parseVisualCheckArgs(process.argv.slice(2));
const usage = "Usage: npm run check:visual -- --base <url> [--compare <url>] [--out tmp/visual-qa]";
if (args.errors.length) {
  console.error(usage);
  console.error(args.errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

if (!args.baseUrl) {
  console.error(usage);
  process.exit(1);
}

const result = await checkVisual({
  root: process.cwd(),
  baseUrl: args.baseUrl,
  compareUrl: args.compareUrl,
  outDir: args.outDir
});

console.log(`Visual QA report: ${result.reportPath}`);
exitOnErrors(result.errors, (error) => error);
