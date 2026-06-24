import { checkVisual } from "@lib/checks/visual";
import { exitOnErrors } from "./support";

const args = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 1) {
  const arg = process.argv[index];
  if (!arg.startsWith("--")) continue;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    args.set(arg.slice(2), "1");
  } else {
    args.set(arg.slice(2), value);
    index += 1;
  }
}

const baseUrl = args.get("base");
if (!baseUrl) {
  console.error("Usage: npm run check:visual -- --base <url> [--compare <url>] [--out tmp/visual-qa]");
  process.exit(1);
}

const result = await checkVisual({
  root: process.cwd(),
  baseUrl,
  compareUrl: args.get("compare"),
  outDir: args.get("out")
});

console.log(`Visual QA report: ${result.reportPath}`);
exitOnErrors(result.errors, (error) => error);
